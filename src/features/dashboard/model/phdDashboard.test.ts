import { describe, expect, it } from "vitest";
import { dashboardScope, scopedDashboardRecords, type DashboardRecord } from "./phdDashboard";
import { dashboardDemoRecords } from "./phdDashboardData";

describe("PhD dashboard scope", () => {
    it("provides at least five scoped dummy rows for each summary and both dashboard roles", () => {
        const rows = dashboardDemoRecords().filter((row) => row.academicSession === "2026-27" && row.university === "utkal" && row.department === "Computer Science");
        expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
        expect(rows.filter((row) => row.stage === "Admission").length).toBeGreaterThanOrEqual(5);
        expect(rows.filter((row) => row.admitted).length).toBeGreaterThanOrEqual(5);
        expect(rows.filter((row) => row.degreeAwarded).length).toBeGreaterThanOrEqual(5);
        for (const role of ["University Authority", "Authorized HED Official / Auditor"]) {
            expect(rows.filter((row) => row.pendingWith === role).length).toBeGreaterThanOrEqual(5);
        }
        expect(rows.filter((row) => row.stage === "Research" && row.dueDate).length).toBeGreaterThanOrEqual(5);
    });
    it("does not grant access to unrelated roles", () => {
        expect(dashboardScope("candidate", { universityId: "utkal" }).universities).toEqual([]);
    });
    it("uses host assignments without falling back to demo universities", () => {
        expect(dashboardScope("university", { departmentNames: ["Physics"] }).universities).toEqual([]);
        expect(dashboardScope("university", { universityId: "ravenshaw" }).universities).toEqual(["ravenshaw"]);
    });
    it("excludes other universities and departments before counts or details", () => {
        const base: DashboardRecord = { id: "1", reference: "APP-1", name: "Candidate", academicSession: "2026-27", university: "utkal", department: "Physics", stage: "Admission", status: "Submitted" };
        expect(scopedDashboardRecords([base, { ...base, id: "2", university: "ravenshaw" }, { ...base, id: "3", department: "Chemistry" }], { universities: ["utkal"], departments: ["Physics"] })).toEqual([base]);
    });
});

