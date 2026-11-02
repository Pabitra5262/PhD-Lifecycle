import { lifecycleFeatures } from "@/features/lifecycle-shared/featureRegistry";
import { PAGE_PATH } from "@/features/shared/roles";

/* Implemented PhD SRS routes. */
export const routes = {
    ...Object.fromEntries(lifecycleFeatures.map((feature) => [feature.key, { path: feature.path, label: feature.title, protected: true }])),
    phdDashboard: { path: PAGE_PATH.phdDashboard, label: "Dashboard", protected: true },
    applicationScrutiny: { path: PAGE_PATH.applicationScrutiny, label: "Application Scrutiny", protected: true },
    apply: { path: PAGE_PATH.apply, label: "Apply", protected: true },
    myProfile: { path: PAGE_PATH.myProfile, label: "My Profile", protected: true },
    selectionConfiguration: { path: PAGE_PATH.selectionConfiguration, label: "Selection Configuration", protected: true },
    advertisements: { path: PAGE_PATH.advertisements, label: "Advertisement Mgmt", protected: true },
    login: { path: "/login", label: "Login", protected: false },



};


