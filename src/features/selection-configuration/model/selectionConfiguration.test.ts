import { describe, expect, it } from "vitest";
import { readSelectionChanges, readSelectionDraft, saveSelectionDraft, readSelectionRecords, reviseSelection, transitionSelection, selectionWorkflowsFor, selectionSchema, type SelectionConfiguration } from "./selectionConfiguration";
const valid = (): SelectionConfiguration => ({
    university: "utkal", academicSession: "2026-27", stages: [
        { id: "written", order: "1", scored: true, marks: "100", weightage: "70", qualifyingScore: "50" },
        { id: "interview", order: "2", scored: true, marks: "50", weightage: "30", qualifyingScore: "20" },
    ], meritMethod: "weighted", firstTieBreaker: "written", secondTieBreaker: "academic", exemptionRule: "net-written", status: "Draft",
});
describe("selection configuration", () => {
    it("accepts a valid weighted configuration", () => expect(selectionSchema.safeParse(valid()).success).toBe(true));
    it.each([
        { university: "unknown" }, { academicSession: "unknown" }, { stages: [] },
        { meritMethod: "unapproved" }, { firstTieBreaker: "synopsis" }, { secondTieBreaker: "written" },
        { exemptionRule: "unapproved" }, { status: "Active" },
    ])("rejects invalid configuration %j", (change) => expect(selectionSchema.safeParse({ ...valid(), ...change }).success).toBe(false));
    it.each([
        { order: "2" }, { order: "0" }, { order: "1.5" }, { marks: "0" }, { marks: "abc" },
        { qualifyingScore: "101" }, { qualifyingScore: "-1" }, { weightage: "60" }, { weightage: "abc" },
    ])("rejects invalid stage values %j", (change) => {
        const value = valid(); Object.assign(value.stages[0], change);
        expect(selectionSchema.safeParse(value).success).toBe(false);
    });
    it("requires at least one scored stage", () => {
        const value = valid(); value.stages.forEach((stage) => { stage.scored = false; });
        expect(selectionSchema.safeParse(value).success).toBe(false);
    });
    it("does not require weightage for total-marks merit", () => {
        const value = valid(); value.meritMethod = "total"; value.stages.forEach((stage) => { stage.weightage = ""; });
        expect(selectionSchema.safeParse(value).success).toBe(true);
    });
    it("rejects exemptions for an absent stage", () => {
        const value = valid(); value.stages = [value.stages[1]]; value.stages[0].order = "1"; value.stages[0].weightage = "100"; value.firstTieBreaker = "interview";
        expect(selectionSchema.safeParse(value).success).toBe(false);
    });
    it("records saved changes and protects snapshots from later edits", () => {
        const value = valid(); const count = readSelectionChanges().length;
        saveSelectionDraft(value); value.stages[0].marks = "999";
        expect(readSelectionDraft().stages[0].marks).toBe("100");
        const revised = readSelectionDraft(); revised.stages[0].qualifyingScore = "60"; saveSelectionDraft(revised);
        const changes = readSelectionChanges();
        expect(changes).toHaveLength(count + 2);
        expect(changes.at(-1)?.before?.stages[0].qualifyingScore).toBe("50");
        expect(changes.at(-1)?.after.stages[0].qualifyingScore).toBe("60");
        expect(changes.at(-1)?.role).toBe("University Authority");
    });
});

// Lifecycle checks use the same wireframe permission boundary as the page route.
describe("configuration lifecycle and mapping", () => {
    it("supports one, two and three configured stages", () => {
        const one = valid(); one.stages = [one.stages[0]]; one.stages[0].weightage = "100";
        expect(selectionSchema.safeParse(one).success).toBe(true);
        const three = valid(); three.stages[0].weightage = "50"; three.stages[1].weightage = "30";
        three.stages.push({ id: "synopsis", order: "3", scored: true, marks: "20", weightage: "20", qualifyingScore: "10" });
        expect(selectionSchema.safeParse(three).success).toBe(true);
    });
});

describe("controlled activation and revision", () => {
    it("enforces permission, approval, active locking and revision replacement with audit entries", () => {
        const form = valid(); form.university = "ravenshaw"; form.academicSession = "2027-28";
        expect(() => saveSelectionDraft(form, null, "OES Officer")).toThrow();
        const record = saveSelectionDraft(form, null, "University Authority");
        expect(selectionWorkflowsFor(form.university, form.academicSession)).toHaveLength(0);
        expect(() => transitionSelection(record.id, "Active", "University Authority")).toThrow();
        expect(() => transitionSelection(record.id, "Approved", "OES Officer")).toThrow();
        transitionSelection(record.id, "Approved", "University Authority");
        expect(selectionWorkflowsFor(form.university, form.academicSession)).toHaveLength(0);
        transitionSelection(record.id, "Active", "University Authority");
        expect(selectionWorkflowsFor(form.university, form.academicSession)[0].configuration.stages.map((stage) => stage.id)).toEqual(["written", "interview"]);
        expect(selectionWorkflowsFor(form.university, "2026-27")).toHaveLength(0);
        expect(() => saveSelectionDraft(form, record.id, "University Authority")).toThrow(/locked/);
        const revised = reviseSelection(record.id, "University Authority");
        expect(revised.version).toBe(2);
        expect(reviseSelection(record.id, "University Authority").id).toBe(revised.id);
        const changed = structuredClone(revised.configuration); changed.stages[0].qualifyingScore = "60";
        saveSelectionDraft(changed, revised.id, "University Authority");
        expect(readSelectionRecords().find((item) => item.id === record.id)?.configuration.stages[0].qualifyingScore).toBe("50");
        transitionSelection(revised.id, "Approved", "University Authority");
        transitionSelection(revised.id, "Active", "University Authority");
        const active = selectionWorkflowsFor(form.university, form.academicSession);
        expect(active).toHaveLength(1); expect(active[0].id).toBe(revised.id);
        expect(readSelectionChanges(record.id).at(-1)?.action).toBe("Replaced by approved revision");
        expect(readSelectionChanges(revised.id).at(-1)?.status).toBe("Active");
    });
});

it("allows the selection administrator and records the acting role", () => {
    const record = saveSelectionDraft(valid(), null, "Scrutiny / Selection / Research Committee");
    expect(readSelectionChanges(record.id).at(-1)?.role).toBe("Scrutiny / Selection / Research Committee");
    transitionSelection(record.id, "Approved", "Scrutiny / Selection / Research Committee");
    expect(readSelectionChanges(record.id).at(-1)?.role).toBe("Scrutiny / Selection / Research Committee");
    const revision = reviseSelection(record.id, "Scrutiny / Selection / Research Committee");
    expect(readSelectionChanges(revision.id).at(-1)?.role).toBe("Scrutiny / Selection / Research Committee");
});
