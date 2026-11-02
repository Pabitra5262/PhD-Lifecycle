import { describe, expect, it, vi } from "vitest";
import { getCandidate, requestContactCode, saveCandidate, verifyContactCode } from "@/features/candidate-profile/model/candidateStore";
import { emptyProfile } from "@/features/candidate-profile/model/candidateProfile";
import { correctionAdvertisementsFor, emptyApplication, readApplicationNotifications, readMyApplications, recordApplicationScrutiny, saveApplication, scrutinyApplications, validateApplication } from "@/features/phd-application/model/applicationStore";
import { findAdvertisement } from "@/features/phd-application/model/advertisements";
import { canOpen } from "@/features/shared/roles";
import { getMenuItemsForRole, flattenMenu } from "@/shared/components/layout/Sidebar/menuItems";
import { DEMO_SCRUTINY_ACTORS, emptyScrutiny, resolveScrutinyActor, scrutinyDocuments, validateScrutiny, type ScrutinyForm } from "./scrutinyRules";
const department = DEMO_SCRUTINY_ACTORS["Department Authority / Course Coordinator"];
const committee = DEMO_SCRUTINY_ACTORS["Scrutiny / Selection / Research Committee"];
const pdf = () => new File(["%PDF-test"], "proof.pdf", { type: "application/pdf" });
const submitted = () => {
    const account = crypto.randomUUID(); const record = getCandidate(account);
    const profile = { ...emptyProfile(record.profile.candidateId), fullName: "Candidate Test", mobile: "9876543210", email: "candidate@example.com", dateOfBirth: "2000-06-15", currentAddress: "Bhubaneswar", currentPin: "751001", sameAddress: true, education: [{ qualification: "MSc", institution: "Utkal University", year: "2024", marks: "80" }], qualificationType: "NET", examName: "NET", examYear: "2025", examScore: "180", qualificationCertificate: pdf(), identityDocument: pdf(), academicDocument: pdf(), declaration: true };
    for (const type of ["mobile", "email"] as const) { const code = requestContactCode(account, type, profile[type]); verifyContactCode(account, type, profile[type], code); }
    saveCandidate(account, profile, true);
    const applicationForm = { ...emptyApplication("PHD-DEMO-CS"), researchArea: "Data Science", synopsis: "Research interest", documents: { cv: pdf() }, eligibilityConfirmed: true, declaration: true };
    const result = saveApplication(account, applicationForm, true);
    if (!result.ok) throw new Error("Test application failed");
    return { account, profile, applicationForm, application: result.application };
};
const eligible = (application: ReturnType<typeof submitted>["application"]): ScrutinyForm => ({
    ...emptyScrutiny(application), netVerification: "Verified", decision: "Eligible",
    documents: Object.fromEntries(scrutinyDocuments(application).map((item) => [item.id, item.file ? "Verified" : "Not Applicable"])),
});
describe("scrutiny access and validation", () => {
    it("keeps scrutiny accessible alongside permitted lifecycle pages", () => {
        for (const role of ["Department Authority / Committees"]) {
            expect(canOpen(role, "applicationScrutiny")).toBe(true);
            expect(flattenMenu(getMenuItemsForRole(role)).map((item) => item.label)).toContain("Application Scrutiny");
        }
        expect(canOpen("Student / PhD Scholar", "applicationScrutiny")).toBe(false);
        expect(flattenMenu(getMenuItemsForRole("Student / PhD Scholar")).map((item) => item.label)).toEqual(expect.arrayContaining(["My Profile", "Apply"]));
    });
    it("enforces university and department assignments on reads and writes", () => {
        const { application } = submitted();
        const otherDepartment = { ...department, departments: ["Physics"] };
        const otherUniversity = { ...committee, university: "ravenshaw" };
        expect(scrutinyApplications(department).some((row) => row.id === application.id)).toBe(true);
        expect(scrutinyApplications(otherDepartment).some((row) => row.id === application.id)).toBe(false);
        expect(scrutinyApplications(otherUniversity).some((row) => row.id === application.id)).toBe(false);
        expect(recordApplicationScrutiny(application.id, otherDepartment, eligible(application), "Forward").ok).toBe(false);
        expect(resolveScrutinyActor("Student / Candidate / Scholar", null)).toBeNull();
        const missingDepartment = resolveScrutinyActor(department.role, { universityId: "utkal" })!;
        expect(scrutinyApplications(missingDepartment)).toEqual([]);
    });
    it("requires every document status, verification and consistent decisions", () => {
        const { application } = submitted();
        expect(Object.keys(validateScrutiny(application, department, emptyScrutiny(application), "Forward")).length).toBeGreaterThan(0);
        const form = eligible(application); expect(validateScrutiny(application, department, form, "Forward")).toEqual({});
        form.documents.identity = "Not Applicable";
        expect(validateScrutiny(application, department, form, "Forward")["document.identity"]).toBeDefined();
        form.documents.identity = "Deficient";
        expect(validateScrutiny(application, department, form, "Forward").remarks).toBeDefined();
        expect(validateScrutiny(application, department, form, "Forward").decision).toBeDefined();
        form.decision = "Deficient"; form.remarks = "Identity proof is illegible";
        expect(validateScrutiny(application, department, form, "Return")).toEqual({});
        form.netVerification = "Not Applicable";
        expect(validateScrutiny(application, department, form, "Return").netVerification).toBeDefined();
    });
    it("routes department recommendations to committee and eligible decisions to configured selection stages", () => {
        const { application } = submitted(); const form = eligible(application);
        const forwarded = recordApplicationScrutiny(application.id, department, form, "Forward");
        expect(forwarded.ok).toBe(true); if (!forwarded.ok) return;
        expect(forwarded.application.pendingWith).toBe("Scrutiny / Selection / Research Committee");
        expect(forwarded.application.status).toBe("Under Scrutiny");
        expect(recordApplicationScrutiny(application.id, department, form, "Forward").ok).toBe(false);
        const final = recordApplicationScrutiny(application.id, committee, eligible(forwarded.application), "Forward");
        expect(final.ok).toBe(true); if (!final.ok) return;
        expect(final.application.status).toBe("Eligible"); expect(final.application.pendingWith).toBe("written");
        expect(final.application.scrutinyHistory).toHaveLength(2);
        expect(final.application.scrutinyHistory?.[0].userId).toBe(department.userId);
        expect(final.application.scrutinyHistory?.[1].role).toBe(committee.role);
        expect(final.application.scrutinyHistory?.every((event) => !!event.date && !!event.user)).toBe(true);
    });
    it("requires remarks for ineligibility and leaves final decision to committee", () => {
        const { application } = submitted(); const form = { ...eligible(application), decision: "Ineligible" };
        expect(recordApplicationScrutiny(application.id, department, form, "Forward").ok).toBe(false);
        form.remarks = "Qualification evidence does not match the academic record";
        const forwarded = recordApplicationScrutiny(application.id, department, form, "Forward");
        if (!forwarded.ok) throw new Error("Forward failed");
        expect(forwarded.application.status).toBe("Under Scrutiny");
        const final = recordApplicationScrutiny(application.id, committee, { ...eligible(forwarded.application), decision: "Ineligible", remarks: form.remarks }, "Forward");
        expect(final.ok).toBe(true); if (final.ok) expect(final.application.status).toBe("Ineligible");
    });
});
describe("correction and resubmission", () => {
    it("notifies only the candidate, preserves reference/history and routes resubmission to the returning role", () => {
        const { account, application, profile, applicationForm } = submitted();
        const form = { ...eligible(application), decision: "Deficient", remarks: "Upload a legible identity proof", documents: { ...eligible(application).documents, identity: "Deficient" } };
        const returned = recordApplicationScrutiny(application.id, department, form, "Return");
        expect(returned.ok).toBe(true); if (!returned.ok) return;
        expect(returned.application.status).toBe("Returned");
        expect(readApplicationNotifications(account)).toHaveLength(1);
        expect(readApplicationNotifications(crypto.randomUUID())).toEqual([]);
        expect(() => saveCandidate(account, profile, true)).not.toThrow();
        const corrected = saveApplication(account, { ...applicationForm, documents: { cv: pdf() } }, true);
        expect(corrected.ok).toBe(true); if (!corrected.ok) return;
        expect(corrected.application.reference).toBe(application.reference);
        expect(corrected.application.pendingWith).toBe(department.role);
        expect(corrected.application.scrutinyHistory?.map((event) => event.action)).toEqual(["Return", "Resubmitted"]);
        expect(corrected.application.correctionUntil).toBeUndefined();
    });
    it("rejects corrections after the configured deadline, even while new applications remain open", () => {
        const { account, application, applicationForm } = submitted();
        const result = recordApplicationScrutiny(application.id, department, { ...eligible(application), decision: "Deficient", remarks: "Clarification required" }, "Return");
        if (!result.ok) throw new Error("Return failed");
        vi.useFakeTimers();
        try {
            vi.setSystemTime(new Date(result.application.correctionUntil!).getTime() + 1);
            expect(validateApplication(account, applicationForm).advertisement).toMatch(/correction period/);
            expect(() => saveApplication(account, applicationForm, true)).toThrow(/correction period/);
        } finally { vi.useRealTimers(); }
    });
    it("allows authorized corrections after the original deadline while the correction window remains open", () => {
        const { account, application, applicationForm } = submitted();
        vi.useFakeTimers();
        try {
            const advertisement = findAdvertisement(applicationForm.advertisement)!;
            vi.setSystemTime(new Date(`${advertisement.ends}T12:00:00`));
            const result = recordApplicationScrutiny(application.id, department, { ...eligible(application), decision: "Deficient", remarks: "Correct the uploaded evidence" }, "Return");
            expect(result.ok).toBe(true);
            vi.advanceTimersByTime(86400000);
            expect(correctionAdvertisementsFor(account).some((row) => row.id === advertisement.id)).toBe(true);
            expect(saveApplication(account, applicationForm, true).ok).toBe(true);
            expect(readMyApplications(account)[0].reference).toBe(application.reference);
        } finally { vi.useRealTimers(); }
    });
});
