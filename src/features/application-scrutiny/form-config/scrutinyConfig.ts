import type { ScrutinyRole, ScrutinyActor } from "../types";

export const SCRUTINY_ROLES = ["Department Authority / Course Coordinator", "Scrutiny / Selection / Research Committee"] as const;
export const VERIFICATION_STATUSES = ["Verified", "Deficient", "Not Applicable"] as const;
export const DECISIONS = ["Eligible", "Deficient", "Ineligible"] as const;
// Wireframe assignments and routing. Production assignments must come from authenticated-user services.
export const DEMO_SCRUTINY_ACTORS: Record<ScrutinyRole, ScrutinyActor> = {
    "Department Authority / Course Coordinator": { userId: "DEPT-DEMO-CS", name: "Department Scrutiny Officer", role: "Department Authority / Course Coordinator", university: "utkal", departments: ["Computer Science"] },
    "Scrutiny / Selection / Research Committee": { userId: "COMMITTEE-DEMO-UTKAL", name: "University Scrutiny Committee Member", role: "Scrutiny / Selection / Research Committee", university: "utkal", departments: [] },
};
export const scrutinyPolicy = { correctionDays: 7, departmentNext: "Scrutiny / Selection / Research Committee" };
