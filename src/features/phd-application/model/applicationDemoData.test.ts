import { describe, expect, it } from "vitest";
import { demoApplications } from "./applicationDemoData";
import { activeAdvertisements } from "./advertisements";
import { readMyApplications } from "./applicationStore";

describe("application wireframe examples", () => {
    it("provides five unique preview rows for the current candidate", () => {
        const rows = demoApplications("CANDIDATE-DEMO-1");
        expect(rows).toHaveLength(5);
        expect(new Set(rows.map((row) => row.id)).size).toBe(5);
        expect(new Set(rows.map((row) => row.advertisement.id)).size).toBe(5);
        expect(rows.every((row) => row.profile?.candidateId === "CANDIDATE-DEMO-1")).toBe(true);
    });
    it("does not create submitted records or selectable dummy advertisements", () => {
        const previews = demoApplications("CANDIDATE-DEMO-2");
        expect(readMyApplications("CANDIDATE-DEMO-2")).toEqual([]);
        expect(activeAdvertisements().some((ad) => previews.some((row) => row.advertisement.id === ad.id))).toBe(false);
    });
});
