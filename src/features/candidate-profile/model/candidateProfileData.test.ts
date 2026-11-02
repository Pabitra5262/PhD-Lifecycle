import { describe, expect, it } from "vitest";
import { candidateSchema } from "./candidateProfile";
import { demoCandidateProfile } from "./candidateProfileData";

describe("candidate profile dummy data", () => {
    it("provides five independent qualification rows and preserves the account identifier", () => {
        const first = demoCandidateProfile("HIMS-DEMO-1");
        expect(first.candidateId).toBe("HIMS-DEMO-1");
        expect(first.education).toHaveLength(5);
        first.education[0].institution = "Changed";
        expect(demoCandidateProfile("HIMS-DEMO-2").education[0].institution).toBe("Capital High School, Bhubaneswar");
    });
    it("requires real upload and declaration completion before submission", () => {
        const sample = demoCandidateProfile("CANDIDATE-DEMO");
        const result = candidateSchema.safeParse(sample);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.map((issue) => issue.path[0])).toEqual(expect.arrayContaining(["identityDocument", "academicDocument", "declaration"]));
            expect(result.error.issues.some((issue) => issue.path[0] === "education")).toBe(false);
        }
    });
});
