/**
 * Header data — Pay Fixation roles (src/features/shared/roles.ts) and the HIMS Plus applications list.
 * Replace each block with the real API response when it exists.
 */
import { ROLES } from "@/features/shared/roles";

/** Module this app is: shown in the header and marked as "Current application" in the launcher. */
export const MODULE = { appId: "phd", name: "PhD Life Cycle" };

/* ---- Languages -------------------------------------------------------- */
export interface Language {
    code: string;
    label: string;
}

export const LANGUAGES: Language[] = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "or", label: "ଓଡ଼ିଆ" },
];

/* ---- Roles ------------------------------------------------------------ */
export const USER_ROLES = ROLES.map((r) => r.label);

export const ROLE_DESCRIPTIONS: Record<string, string> = Object.fromEntries(ROLES.map((r) => [r.label, r.description]));

/* ---- Notifications ---------------------------------------------------- */
export type NotificationTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface AppNotification {
    id: string;
    title: string;
    body?: string;
    /** ISO timestamp */
    createdAt: string;
    read: boolean;
    category: string;
    tone?: NotificationTone;
}


/* ---- Applications ----------------------------------------------------- */
export interface HimsApp {
    id: string;
    name: string;
    /** In-app route, or an absolute URL (opens in a new tab). */
    url: string;
}

export const APPS: HimsApp[] = [{ id: "phd", name: "PhD Life Cycle", url: "/phd/dashboard" }];

/** Which applications each role may open ("all" = everything). */
export const ROLE_APPS: Record<string, string[] | "all"> = Object.fromEntries(ROLES.map((r) => [r.label, "all"]));

export const appsForRole = (role: string): HimsApp[] => {
    const allowed = ROLE_APPS[role] ?? ["phd"];
    return allowed === "all" ? APPS : APPS.filter((a) => allowed.includes(a.id));
};

export const DEFAULT_PINNED = ["phd"];


