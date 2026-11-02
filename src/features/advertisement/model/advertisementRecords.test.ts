import { describe, expect, it } from "vitest";
import { readAdvertisementRecords, saveAdvertisementRecord, transitionAdvertisement } from "./advertisementRecords";

describe("advertisement workflow", () => {
    it("provides five unique dummy advertisements", () => {
        const rows = readAdvertisementRecords();
        expect(rows.length).toBeGreaterThanOrEqual(5);
        expect(new Set(rows.map((row) => row.form.advertisementNumber)).size).toBe(rows.length);
    });
    it("blocks unauthorized actions and skipping approval", () => {
        const draft = readAdvertisementRecords().find((row) => row.status === "Draft")!;
        expect(() => transitionAdvertisement(draft.id, "Published", "University Authority")).toThrow();
        expect(() => transitionAdvertisement(draft.id, "Submitted", "Student / Candidate / Scholar")).toThrow();
        expect(() => saveAdvertisementRecord(draft.form, "Student / Candidate / Scholar")).toThrow();
    });
    it("locks submitted records and records each authorized transition", () => {
        const draft = readAdvertisementRecords().find((row) => row.status === "Draft")!;
        transitionAdvertisement(draft.id, "Submitted", "University Authority");
        expect(() => saveAdvertisementRecord(draft.form, "University Authority")).toThrow();
        transitionAdvertisement(draft.id, "Approved", "University Authority");
        const published = transitionAdvertisement(draft.id, "Published", "University Authority");
        expect(published.status).toBe("Published");
        expect(published.history.at(-1)?.action).toBe("Published");
        expect(transitionAdvertisement(draft.id, "Closed", "University Authority").status).toBe("Closed");
        expect(() => transitionAdvertisement(draft.id, "Published", "University Authority")).toThrow();
    });
});
