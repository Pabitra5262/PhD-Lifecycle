import { describe, expect, it } from "vitest";
import { readScrutinyApplications, recordScrutinyDecision } from "./scrutinyService";
import { DEMO_SCRUTINY_ACTORS } from "../form-config/scrutinyConfig";
import { scrutinyDocuments } from "../form-config/scrutinyDocuments";
import { emptyScrutiny } from "../form-config/scrutinyDefaults";

describe("scrutiny demo records and live workflow", () => {
    it("does not seed records for normal access", () => {
        expect(readScrutinyApplications(DEMO_SCRUTINY_ACTORS["Department Authority / Course Coordinator"])).toHaveLength(0);
    });
    it("provides five scoped, nonduplicated applications for explicit demo access", () => {
        const actor = DEMO_SCRUTINY_ACTORS["Department Authority / Course Coordinator"];
        const rows = readScrutinyApplications(actor, true);
        expect(rows).toHaveLength(5);
        expect(rows.every((row) => row.advertisement.university === actor.university && actor.departments.includes(row.advertisement.department))).toBe(true);
        expect(rows.every((row) => row.status === "Submitted" && row.pendingWith === "Department Authority / Course Coordinator")).toBe(true);
        expect(rows[0].profile?.academicDocument?.name).toBe("Ananya_Das_Academic_Transcripts.pdf");
        expect(rows[0].profile?.qualificationCertificate?.name).toBe("Ananya_Das_NET_URET_Certificate.pdf");
        expect(rows.every((row) => scrutinyDocuments(row).every((document) => !document.file || !/dummy|demo/i.test(document.file.name)))).toBe(true);
        expect(readScrutinyApplications(actor, true)).toHaveLength(5);
    });
    it("uses validated review decisions and preserves history for demo applications", () => {
        const actor = DEMO_SCRUTINY_ACTORS["Department Authority / Course Coordinator"];
        const row = readScrutinyApplications(actor, true)[0];
        const form = { ...emptyScrutiny(row), netVerification: "Verified", decision: "Eligible", documents: Object.fromEntries(scrutinyDocuments(row).map((document) => [document.id, document.file ? "Verified" : "Not Applicable"])) };
        const result = recordScrutinyDecision(row.id, actor, form, "Forward");
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.application.pendingWith).toBe("Scrutiny / Selection / Research Committee");
            expect(result.application.scrutinyHistory).toHaveLength(1);
        }
    });
});
