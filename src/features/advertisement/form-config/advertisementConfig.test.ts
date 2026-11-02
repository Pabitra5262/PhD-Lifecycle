import { saveSelectionDraft, transitionSelection } from "@/features/selection-configuration/model/selectionConfiguration";
import { describe, expect, it } from "vitest";
import { advertisementSchema } from "./advertisementConfig";

const validDraft = () => ({
    advertisementNumber: "PHD/ADV/TEST", advertisementDate: "2026-10-31", academicSession: "2026-27",
    university: "utkal", department: "Physics", researchArea: "Quantum optics", seatsApplicable: true,
    seats: "2", eligibilityCriteria: "Relevant postgraduate qualification", qualificationRule: "net-uret",
    permittedExemptions: [], applicationStart: "2099-01-01", applicationEnd: "2099-02-01",
    selectionProcess: "test-interview", advertisementDocument: new File(["%PDF-test"], "advertisement.pdf", { type: "application/pdf" }), status: "Draft",
});
describe("advertisement validation", () => {
    it("accepts a complete draft", () => expect(advertisementSchema.safeParse(validDraft()).success).toBe(true));
    it.each([
        { department: "English" },
        { academicSession: "unknown" },
        { seats: "0" },
        { seats: "1.5" },
        { researchArea: "   " },
        { advertisementDate: "2026-02-30" },
        { applicationEnd: "2099-01-01" },
        { applicationEnd: "2020-01-01" },
        { permittedExemptions: ["Unapproved exemption"] },
        { selectionProcess: "inactive-process" },
        { status: "Published" },
    ])("rejects invalid values: %j", (change) => expect(advertisementSchema.safeParse({ ...validDraft(), ...change }).success).toBe(false));
    it("allows empty seats when allocation is not applicable", () => expect(advertisementSchema.safeParse({ ...validDraft(), seatsApplicable: false, seats: "" }).success).toBe(true));
    it("rejects missing, wrong-type and oversized documents", () => {
        for (const advertisementDocument of [undefined, new File(["text"], "file.txt", { type: "text/plain" }), new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.pdf", { type: "application/pdf" })]) {
            expect(advertisementSchema.safeParse({ ...validDraft(), advertisementDocument }).success).toBe(false);
        }
    });
    it("accepts only exemptions permitted by the selected rule", () => expect(advertisementSchema.safeParse({ ...validDraft(), qualificationRule: "net-exempt", permittedExemptions: ["NET-qualified applicants"] }).success).toBe(true));
});

it("maps only active selection configurations for the matching university and session", () => {
    const record = saveSelectionDraft({
        university: "utkal", academicSession: "2026-27", stages: [{ id: "written", order: "1", scored: true, marks: "100", qualifyingScore: "50", weightage: "100" }],
        meritMethod: "weighted", firstTieBreaker: "written", secondTieBreaker: "", exemptionRule: "", status: "Draft",
    }, null, "University Authority");
    const advertisement = { ...validDraft(), selectionProcess: record.id };
    expect(advertisementSchema.safeParse(advertisement).success).toBe(false);
    transitionSelection(record.id, "Approved", "University Authority");
    expect(advertisementSchema.safeParse(advertisement).success).toBe(false);
    transitionSelection(record.id, "Active", "University Authority");
    expect(advertisementSchema.safeParse(advertisement).success).toBe(true);
    expect(advertisementSchema.safeParse({ ...advertisement, academicSession: "2027-28" }).success).toBe(false);
});
