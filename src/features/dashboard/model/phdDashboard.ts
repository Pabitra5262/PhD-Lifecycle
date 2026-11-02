import { admissionConfig } from "@/features/shared/admissionMasters";

export const LIFECYCLE_STAGES = ["Admission", "Coursework", "Research", "Thesis", "Viva-Voce", "Degree"] as const;
export type LifecycleStage = typeof LIFECYCLE_STAGES[number];
export interface DashboardRecord {
    id: string;
    reference: string;
    name: string;
    academicSession: string;
    university: string;
    department: string;
    stage: LifecycleStage;
    status: string;
    pendingWith?: string;
    pendingAction?: string;
    dueDate?: string;
    admitted?: boolean;
    degreeAwarded?: boolean;
}
export interface DashboardScope { universities: string[]; departments: string[] }

// Local wireframe scope follows the existing Utkal demo assignment. Host assignments take precedence.
export const dashboardScope = (role: string, identity: unknown): DashboardScope => {
    if (!["university", "dhe"].includes(role)) return { universities: [], departments: [] };
    const user = identity && typeof identity === "object" ? identity as Record<string, unknown> : {};
    const assigned = Object.hasOwn(user, "universityId") || Object.hasOwn(user, "universityIds") || Object.hasOwn(user, "departmentNames");
    const universities = assigned
        ? Array.isArray(user.universityIds) ? user.universityIds.filter((v): v is string => typeof v === "string") : typeof user.universityId === "string" ? [user.universityId] : []
        : role === "university" ? ["utkal"] : admissionConfig.universities.map((u) => u.id);
    const departments = Array.isArray(user.departmentNames) ? user.departmentNames.filter((v): v is string => typeof v === "string") : [];
    return { universities, departments };
};

export const scopedDashboardRecords = (records: DashboardRecord[], scope: DashboardScope) => records.filter((row) => scope.universities.includes(row.university) && (!scope.departments.length || scope.departments.includes(row.department)));
