import { describe, expect, it, vi } from "vitest";
import { ageOn, candidateSchema, emptyProfile, profileConfig, today, type CandidateProfile } from "./candidateProfile";
import { candidateForApplication, getCandidate, requestContactCode, saveCandidate, setCandidateApplicationStatus, verifyContactCode } from "./candidateStore";
const pdf = () => new File(["%PDF-test"], "proof.pdf", { type: "application/pdf" });
const valid = (id = "CANDIDATE-TEST"): CandidateProfile => ({
    ...emptyProfile(id), fullName: "Asha Patnaik", mobile: "9876543210", email: "asha@example.com", dateOfBirth: "2000-06-15",
    currentAddress: "Bhubaneswar, Odisha", currentPin: "751001", sameAddress: true,
    education: [{ qualification: "MSc", institution: "Utkal University", year: "2024", marks: "75.5" }],
    identityDocument: pdf(), academicDocument: pdf(), declaration: true,
});
describe("candidate profile validation", () => {
    it("accepts a complete profile", () => expect(candidateSchema.safeParse(valid()).success).toBe(true));
    it.each([
        { fullName: "  " }, { mobile: "123" }, { mobile: "123456789a" }, { email: "bad-email" },
        { dateOfBirth: "2000-02-30" }, { dateOfBirth: today() }, { dateOfBirth: "2099-01-01" },
        { currentPin: "12345" }, { sameAddress: false }, { education: [] }, { identityDocument: null },
        { academicDocument: null }, { category: "SC" }, { qualificationType: "NET" }, { declaration: false },
    ])("rejects invalid values %j", (change) => expect(candidateSchema.safeParse({ ...valid(), ...change }).success).toBe(false));
    it("requires valid year and percentage in each qualification", () => {
        for (const change of [{ year: "2099" }, { year: "1990" }, { marks: "101" }, { marks: "-1" }, { marks: "" }, { institution: "" }]) {
            const profile = valid(); Object.assign(profile.education[0], change);
            expect(candidateSchema.safeParse(profile).success).toBe(false);
        }
    });
    it("validates conditional category and qualification uploads", () => {
        const profile = { ...valid(), category: "SC", categoryProof: pdf(), qualificationType: "NET", examName: "UGC NET", examYear: "2025", examScore: "180", examRank: "25", qualificationCertificate: pdf() };
        expect(candidateSchema.safeParse(profile).success).toBe(true);
        for (const change of [{ examYear: "2099" }, { examScore: "-1" }, { examRank: "1.5" }, { qualificationCertificate: null }]) expect(candidateSchema.safeParse({ ...profile, ...change }).success).toBe(false);
    });
    it("rejects invalid document size and type", () => {
        for (const identityDocument of [new File(["x"], "fake.txt", { type: "text/plain" }), new File([], "empty.pdf", { type: "application/pdf" }), new File([new Uint8Array(profileConfig.maxFileBytes + 1)], "big.pdf", { type: "application/pdf" })]) expect(candidateSchema.safeParse({ ...valid(), identityDocument }).success).toBe(false);
    });
    it("checks age against configured limits and handles birthdays", () => {
        expect(ageOn("2000-06-15", "2026-06-14")).toBe(25);
        expect(ageOn("2000-06-15", "2026-06-15")).toBe(26);
        profileConfig.minimumAge = 30;
        try { expect(candidateSchema.safeParse(valid()).success).toBe(false); } finally { profileConfig.minimumAge = null; }
    });
});
describe("candidate identity, verification and application controls", () => {
    it("reuses verified HIMS identifiers and separates different accounts", () => {
        const account = crypto.randomUUID();
        expect(getCandidate(account, "HIMS-123").profile.candidateId).toBe("HIMS-123");
        expect(getCandidate(account).profile.candidateId).toBe("HIMS-123");
        expect(getCandidate(crypto.randomUUID()).profile.candidateId).not.toBe("HIMS-123");
    });
    it("requires both verified current contacts and a declaration before submission", () => {
        const account = crypto.randomUUID(); const profile = valid(getCandidate(account).profile.candidateId);
        saveCandidate(account, profile, false); expect(candidateForApplication(account)).toBeNull();
        expect(() => saveCandidate(account, profile, true)).toThrow(/Verify both/);
        for (const type of ["mobile", "email"] as const) { const code = requestContactCode(account, type, profile[type]); verifyContactCode(account, type, profile[type], code); }
        saveCandidate(account, profile, true);
        expect(candidateForApplication(account)?.candidateId).toBe(profile.candidateId);
        expect(candidateForApplication(account)?.permanentPin).toBe(profile.currentPin);
        expect(() => saveCandidate(account, { ...profile, mobile: "9123456789" }, true)).toThrow(/Verify both/);
        expect(() => saveCandidate(account, { ...profile, candidateId: "ALTERED" }, true)).toThrow(/ID cannot/);
        expect(() => saveCandidate(account, { ...profile, declaration: false }, true)).toThrow();
        setCandidateApplicationStatus(account, "Submitted");
        expect(() => saveCandidate(account, profile, false)).toThrow(/locked/);
        setCandidateApplicationStatus(account, "Returned");
        expect(() => saveCandidate(account, profile, false)).not.toThrow();
        expect(candidateForApplication(account)).toBeNull();
    });
    it("rejects wrong, reused, changed-contact and expired codes", () => {
        const account = crypto.randomUUID(); getCandidate(account);
        let code = requestContactCode(account, "mobile", "9876543210");
        expect(() => verifyContactCode(account, "mobile", "9876543210", "bad")).toThrow(/Incorrect/);
        expect(() => verifyContactCode(account, "mobile", "9123456789", code)).toThrow(/contact changed/);
        verifyContactCode(account, "mobile", "9876543210", code);
        expect(() => verifyContactCode(account, "mobile", "9876543210", code)).toThrow();
        vi.useFakeTimers();
        try { code = requestContactCode(account, "email", "test@example.com"); vi.advanceTimersByTime(301000); expect(() => verifyContactCode(account, "email", "test@example.com", code)).toThrow(/expired/); } finally { vi.useRealTimers(); }
    });
});
