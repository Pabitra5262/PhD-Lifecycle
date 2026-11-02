import { srsActors } from "./srsActors";
import { lifecyclePagePaths } from "@/features/lifecycle-shared/pages";
/* PhD SRS actors and currently implemented pages. Legacy type keys remain for unrouted source compatibility. */

export type RoleKey = typeof srsActors[number]["key"] | "scholar" | "selectionCommittee" | "resultCommittee" | "courseCoordinator" | "researchCommittee" | "examinerApprover" | "vivaPanel" | "degreeApprover" | "auditor" | "officer" | "college" | "accounts" | "fo" | "dhe" | "admin" | "university" | "selectionAdmin" | "candidate" | "departmentAuthority" | "scrutinyCommittee";

export type PageKey = keyof typeof lifecyclePagePaths | "phdDashboard" | "dashboard" | "submit" | "proposals" | "verification" | "history" | "reports" | "configuration" | "advertisements" | "selectionConfiguration" | "myProfile" | "apply" | "applicationScrutiny";

/** Header role names, in the order they are listed. The first one is the default. */
export const ROLES: { key: RoleKey; label: string; short: string; description: string }[] = srsActors.map((actor) => ({ key: actor.key, label: actor.label, short: actor.label, description: actor.label + " lifecycle access" }));

export const ROLE_NAV = Object.fromEntries(srsActors.map((actor) => [actor.key, [...actor.pages]])) as Record<RoleKey, PageKey[]>;

/** Internal workflow categories preserve existing field and review behavior. */
export const workflowRoleOf = (label: string, page?: string): string => {
    if (label === "Department Authority / Committees" && ["selectionSchedule", "resultsAdmission", "progressMonitoring", "preSubmissionSeminar"].includes(page ?? "")) return "Scrutiny / Selection / Research Committee";
    if (label === "Examiner / Viva Panel" && page === "vivaVoce") return "Scrutiny / Selection / Research Committee";
    return srsActors.find((actor) => actor.label === label)?.workflowRole ?? label;
};

export const PAGE_PATH: Record<PageKey, string> = {
    ...lifecyclePagePaths,
    phdDashboard: "/phd/dashboard",
    applicationScrutiny: "/phd/admissions/application-scrutiny",
    apply: "/phd/admissions/apply",
    myProfile: "/public-portal/my-profile",
    advertisements: "/phd/admission/advertisements",
    selectionConfiguration: "/phd/masters/selection-configuration",
    dashboard: "/dashboard",
    submit: "/proposals/new",
    proposals: "/proposals",
    verification: "/verification",
    history: "/history",
    reports: "/reports",
    configuration: "/configuration",
};

export const roleKeyOf = (label: string): RoleKey => ROLES.find((r) => r.label === label)?.key ?? "admin";
export const roleLabelOf = (key: RoleKey) => ROLES.find((r) => r.key === key)?.label ?? key;
export const canOpen = (roleLabel: string, page: PageKey) => ROLES.some((role) => role.label === roleLabel) && ROLE_NAV[roleKeyOf(roleLabel)].includes(page);
/** First page of the role's menu: where login and blocked routes land. */
export const homeOf = (roleLabel: string) => ROLES.some((role) => role.label === roleLabel) ? PAGE_PATH[ROLE_NAV[roleKeyOf(roleLabel)][0]] ?? "/phd" : "/phd";


