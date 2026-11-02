import { ClipboardCheck, UserRound, GraduationCap, Megaphone, FilePlus2, LayoutDashboard, Settings2, type LucideIcon } from "lucide-react";
import { PAGE_PATH, ROLES, ROLE_NAV, type PageKey } from "@/features/shared/roles";
import { lifecycleFeatures } from "@/features/lifecycle-shared/featureRegistry";
export interface MenuItem { icon?: LucideIcon; label: string; path?: string; submenu?: MenuItem[] }
const metadata: Partial<Record<PageKey, { label: string; icon: LucideIcon }>> = {
    phdDashboard: { label: "Dashboard", icon: LayoutDashboard }, advertisements: { label: "Advertisement Mgmt", icon: Megaphone }, selectionConfiguration: { label: "Selection Configuration", icon: Settings2 },
    myProfile: { label: "My Profile", icon: UserRound }, apply: { label: "Apply", icon: FilePlus2 }, applicationScrutiny: { label: "Application Scrutiny", icon: ClipboardCheck },
    ...Object.fromEntries(lifecycleFeatures.map((feature) => [feature.key, { label: feature.title, icon: GraduationCap }])),
};
const item = (key: PageKey): MenuItem => ({ label: metadata[key]?.label ?? key, icon: metadata[key]?.icon ?? GraduationCap, path: PAGE_PATH[key] });
export const ALL_MENU_ITEMS: MenuItem[] = [
    { label: "PhD Life Cycle Management", icon: GraduationCap, submenu: [item("phdDashboard"), { label: "Admission", submenu: [item("advertisements")] }, { label: "Masters", submenu: [item("selectionConfiguration")] },
        { label: "Coursework", submenu: [item("coursework"), item("courseworkExams")] }, { label: "Research Registration", submenu: [item("researchRegistration")] },
        { label: "Research", submenu: [item("progressMonitoring")] }, { label: "Thesis", submenu: [item("preSubmissionSeminar"), item("thesisSubmission"), item("examinerManagement")] },
        item("vivaVoce"), item("degreeAward"), item("reportsAnalytics")] },
    { label: "Public Portal", icon: UserRound, submenu: [{ label: "Register / Login", submenu: [item("myProfile")] }] },
    { label: "PhD Admissions", icon: GraduationCap, submenu: [{ label: "Active Advertisements", submenu: [item("apply")] }, item("applicationScrutiny"), item("selectionSchedule"), item("resultsAdmission")] },
    item("notifications"),
    { label: "Administration", icon: Settings2, submenu: [item("adminManagement"), item("auditTrail")] },
];
const prune = (items: MenuItem[], allowed: string[]): MenuItem[] => items.flatMap((entry) => {
    if (entry.submenu) { const submenu = prune(entry.submenu, allowed); return submenu.length ? [{ ...entry, submenu }] : []; }
    return entry.path && allowed.includes(entry.path) ? [entry] : [];
});
export const getMenuItemsForRole = (role?: string): MenuItem[] => {
    let label = role;
    if (!label && typeof window !== "undefined") { try { label = localStorage.getItem("arf.activeRole") ?? undefined; } catch { /* storage unavailable */ } }
    const active = ROLES.find((value) => value.label === label) ?? ROLES[0];
    if (active.key === "selectionAdmin") return [item("selectionConfiguration")];
    const entries = prune(ALL_MENU_ITEMS, ROLE_NAV[active.key].map((key) => PAGE_PATH[key]));
    if (ROLE_NAV[active.key].includes("scholarRequests")) {
        const scholar = active.key === "scholar";
        entries.push({ label: scholar ? "Scholar Portal" : "Authority Portal", icon: UserRound, submenu: [{ ...item("scholarRequests"), label: scholar ? "My Requests / Issues" : "Request Management" }] });
    }
    return entries;
};
export const ROLE_MENU_MAP: Record<string, string[]> = Object.fromEntries(ROLES.map((role) => [role.label, getMenuItemsForRole(role.label).map((entry) => entry.label)]));
export const MENU_ITEMS = getMenuItemsForRole();
export interface MenuLeaf { label: string; path: string; icon?: LucideIcon; trail: string[] }
export const flattenMenu = (items?: MenuItem[], trail: string[] = [], icon?: LucideIcon): MenuLeaf[] => (items ?? getMenuItemsForRole()).flatMap((entry) => entry.submenu ? flattenMenu(entry.submenu, [...trail, entry.label], entry.icon ?? icon) : entry.path ? [{ label: entry.label, path: entry.path, icon: entry.icon ?? icon, trail }] : []);
