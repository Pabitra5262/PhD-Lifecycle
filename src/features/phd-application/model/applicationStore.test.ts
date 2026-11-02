import { describe, expect, it, vi } from "vitest";
import { candidateForApplication, getCandidate, requestContactCode, saveCandidate, verifyContactCode } from "@/features/candidate-profile/model/candidateStore";
import { emptyProfile, type CandidateProfile } from "@/features/candidate-profile/model/candidateProfile";
import { activeAdvertisements, findAdvertisement } from "./advertisements";
import { applicationsForScrutiny, emptyApplication, feeFor, readMyApplications, recordDemoPayment, saveApplication, validateApplication, type ApplicationForm } from "./applicationStore";
const pdf = () => new File(["%PDF-test"], "file.pdf", { type: "application/pdf" });
const candidate = (change: Partial<CandidateProfile> = {}) => {
    const account = crypto.randomUUID(); const record = getCandidate(account);
    const profile: CandidateProfile = { ...emptyProfile(record.profile.candidateId), fullName: "Asha Patnaik", mobile: "9876543210", email: "asha@example.com", dateOfBirth: "2000-06-15", currentAddress: "Bhubaneswar", currentPin: "751001", sameAddress: true, education: [{ qualification: "MSc", institution: "Utkal University", year: "2024", marks: "75" }], qualificationType: "NET", examName: "UGC NET", examYear: "2025", examScore: "180", examRank: "10", qualificationCertificate: pdf(), identityDocument: pdf(), academicDocument: pdf(), declaration: true, ...change };
    for (const type of ["mobile", "email"] as const) { const code = requestContactCode(account, type, profile[type]); verifyContactCode(account, type, profile[type], code); }
    saveCandidate(account, profile, true); return account;
};
const application = (id = "PHD-DEMO-CS"): ApplicationForm => ({ ...emptyApplication(id), researchArea: id === "PHD-DEMO-CS" ? "Data Science" : "Quantum Optics", synopsis: "Proposed research into the configured subject.", synopsisFile: pdf(), documents: { cv: pdf(), statement: pdf() }, eligibilityConfirmed: true, declaration: true });
describe("PhD applications", () => {
    it("lists only open, published advertisements", () => {
        expect(activeAdvertisements().map((row) => row.id)).toEqual(["PHD-DEMO-CS", "PHD-DEMO-PHYSICS"]);
        expect(activeAdvertisements().every((row) => row.published && row.status === "Published")).toBe(true);
    });
    it("requires a completed, verified profile", () => {
        const account = crypto.randomUUID(); getCandidate(account);
        expect(validateApplication(account, application()).profile).toBeDefined();
        expect(() => saveApplication(account, application(), true)).toThrow(/Profile/);
    });
    it("submits a complete application, preserves snapshots and prevents duplicates", () => {
        const account = candidate(); const form = application();
        expect(validateApplication(account, form)).toEqual({});
        const draft = saveApplication(account, form, false); expect(draft.ok).toBe(true);
        expect(readMyApplications(account)[0].status).toBe("Draft");
        const result = saveApplication(account, form, true);
        expect(result.ok).toBe(true); if (!result.ok) return;
        expect(result.application.reference).toMatch(/^PHD-APP-/);
        expect(result.application.status).toBe("Submitted");
        expect(result.application.selectionStages).toEqual(["written", "interview", "synopsis"]);
        form.researchArea = "Changed after submit";
        expect(readMyApplications(account)[0].form.researchArea).toBe("Data Science");
        expect(() => saveApplication(account, application(), true)).toThrow(/already been submitted/);
        expect(() => saveCandidate(account, candidateForApplication(account)!, false)).toThrow(/locked/);
        expect(applicationsForScrutiny("University Authority").some((row) => row.id === result.application.id)).toBe(true);
        expect(() => applicationsForScrutiny("Student / Candidate / Scholar")).toThrow(/permission/);
        expect(readMyApplications(crypto.randomUUID())).toEqual([]);
    });
    it.each<Partial<ApplicationForm>>([
        { researchArea: "Unconfigured subject" }, { declaration: false }, { eligibilityConfirmed: false },
        { synopsis: "", synopsisFile: null }, { documents: {} }, { synopsis: "x".repeat(5001) },
        { documents: { cv: new File(["text"], "file.txt", { type: "text/plain" }) } },
    ])("blocks incomplete or invalid applications %j", (change) => {
        const account = candidate(); const form = { ...application(), ...change };
        expect(Object.keys(validateApplication(account, form)).length).toBeGreaterThan(0);
        expect(saveApplication(account, form, true).ok).toBe(false);
        expect(readMyApplications(account)).toEqual([]);
    });
    it("enforces academic eligibility and NET/URET requirements", () => {
        const account = candidate({ qualificationType: "Not Applicable", education: [{ qualification: "BSc", institution: "University", year: "2022", marks: "90" }] });
        const errors = validateApplication(account, application());
        expect(errors.qualification).toBeDefined(); expect(errors.academics).toBeDefined();
    });
    it("requires successful payment, allows only configured exemptions and permits NET exemption from URET", () => {
        const account = candidate(); const form = application("PHD-DEMO-PHYSICS"); const ad = findAdvertisement(form.advertisement)!;
        expect(validateApplication(account, form).qualification).toBeUndefined();
        expect(feeFor(account, ad).status).toBe("Pending");
        expect(saveApplication(account, form, true).ok).toBe(false);
        recordDemoPayment(account, ad.id); const reference = feeFor(account, ad).reference;
        expect(feeFor(account, ad).status).toBe("Success");
        recordDemoPayment(account, ad.id); expect(feeFor(account, ad).reference).toBe(reference);
        expect(saveApplication(account, form, true).ok).toBe(true);
        const exempt = candidate({ category: "SC", categoryProof: pdf() });
        expect(feeFor(exempt, ad).status).toBe("Exempt");
        expect(saveApplication(exempt, form, true).ok).toBe(true);
        const other = candidate(); expect(feeFor(other, ad).status).toBe("Pending");
    });
    it("rechecks the deadline at submission even when the form was opened earlier", () => {
        const account = candidate(); const form = application(); const ad = findAdvertisement(form.advertisement)!;
        vi.useFakeTimers();
        try {
            vi.setSystemTime(new Date(`${ad.ends}T12:00:00`).getTime() + 86400000);
            expect(validateApplication(account, form).advertisement).toBeDefined();
            expect(() => saveApplication(account, form, true)).toThrow(/closed/);
        } finally { vi.useRealTimers(); }
    });
    it("never accepts a closed advertisement", () => {
        const account = candidate(); expect(() => saveApplication(account, application("PHD-DEMO-CLOSED"), false)).toThrow(/closed/);
    });
});
