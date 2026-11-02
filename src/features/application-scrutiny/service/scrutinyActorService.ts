import { SCRUTINY_ROLES, DEMO_SCRUTINY_ACTORS } from "../form-config/scrutinyConfig";
import type { ScrutinyRole, ScrutinyActor } from "../types";

export const resolveScrutinyActor = (role: string, identity: unknown): ScrutinyActor | null => {
    if (!SCRUTINY_ROLES.includes(role as ScrutinyRole)) return null;
    const base = DEMO_SCRUTINY_ACTORS[role as ScrutinyRole];
    const user = identity && typeof identity === "object" ? identity as Record<string, unknown> : {};
    // When the host supplies assignments, use them as supplied; never broaden a missing department.
    const hasAssignment = Object.hasOwn(user, "universityId") || Object.hasOwn(user, "departmentNames");
    return {
        ...base,
        userId: typeof user.loginUserName === "string" ? user.loginUserName : base.userId,
        name: typeof user.userName === "string" ? user.userName : base.name,
        university: hasAssignment ? typeof user.universityId === "string" ? user.universityId : "" : base.university,
        departments: hasAssignment ? Array.isArray(user.departmentNames) ? user.departmentNames.filter((value): value is string => typeof value === "string") : [] : [...base.departments],
    };
};
