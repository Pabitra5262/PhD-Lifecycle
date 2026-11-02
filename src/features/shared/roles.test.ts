import { lifecyclePagePaths } from "@/features/lifecycle-shared/pages";
import { describe, expect, it } from "vitest";
import { canOpen, homeOf, ROLES } from "./roles";
import { flattenMenu, getMenuItemsForRole } from "@/shared/components/layout/Sidebar/menuItems";
import { routes } from "@/app/routes/routeConfig";

describe("PhD SRS navigation", () => {
    it("offers only the six opening-diagram actor groups", () => {
        expect(ROLES.map((role) => role.label)).toEqual(["University Authority", "Department Authority / Committees", "Student / PhD Scholar", "Supervisor", "Examiner / Viva Panel", "HED Official"]);
        expect(canOpen("Student / PhD Scholar", "apply")).toBe(true);
        expect(canOpen("Student / PhD Scholar", "progressMonitoring")).toBe(true);
        expect(canOpen("Department Authority / Committees", "applicationScrutiny")).toBe(true);
        expect(canOpen("Department Authority / Committees", "resultsAdmission")).toBe(true);
        expect(canOpen("Examiner / Viva Panel", "examinerManagement")).toBe(true);
        expect(canOpen("Examiner / Viva Panel", "vivaVoce")).toBe(true);
        expect(canOpen("Examiner / Viva Panel", "degreeAward")).toBe(false);
        expect(canOpen("HED Official", "auditTrail")).toBe(true);
    });
    it("only offers implemented PhD pages in menus and route configuration", () => {
        const allowed = ["/phd/dashboard", "/phd/admissions/application-scrutiny", "/phd/admissions/apply", "/public-portal/my-profile", "/phd/admission/advertisements", "/phd/masters/selection-configuration", ...Object.values(lifecyclePagePaths)];
        for (const role of ROLES) {
            expect(flattenMenu(getMenuItemsForRole(role.label)).every((page) => allowed.includes(page.path))).toBe(true);
        }
        expect(Object.values(routes).every((route) => !route.protected || allowed.includes(route.path))).toBe(true);
    });
    it("removes legacy roles and denies their former pages", () => {
        for (const label of ["OES Officer", "College / University Admin", "Accounts / Establishment Officer", "Finance Officer (FO)"]) {
            expect(ROLES.some((role) => role.label === label)).toBe(false);
            expect(canOpen(label, "proposals")).toBe(false);
            expect(canOpen(label, "phdDashboard")).toBe(false);
        }
        expect(ROLES.some((role) => role.label === "HED Official")).toBe(true);
        expect(canOpen("System Administrator", "adminManagement")).toBe(false);
        expect(homeOf("University Authority")).toBe("/phd/dashboard");
    });
});
