import { recordApplicationScrutiny, scrutinyApplications } from "@/features/phd-application/service/applicationService";
import { activeAdvertisements } from "@/features/phd-application/service/advertisementService";
import type { PhdApplication } from "@/features/phd-application/types/application.types";
import { emptyScrutiny } from "../form-config/scrutinyDefaults";
import type { ScrutinyActor, ScrutinyForm } from "../types";
import { ensureScrutinyDemoApplications } from "../model/scrutinyDemoData";

export const canScrutinize = (application: PhdApplication, actor: ScrutinyActor) => ["Submitted", "Under Scrutiny"].includes(application.status) && application.pendingWith === actor.role;
export const initialReview = (application: PhdApplication, actor: ScrutinyActor): ScrutinyForm => {
    const last = [...(application.scrutinyHistory ?? [])].reverse().find((event) => event.action !== "Resubmitted");
    if (canScrutinize(application, actor) || !last) return emptyScrutiny(application);
    return { netVerification: last.netVerification ?? "", documents: { ...last.documents }, remarks: last.remarks, decision: last.decision ?? "", revision: application.scrutinyHistory?.length ?? 0 };
};
export const readScrutinyApplications = (actor: ScrutinyActor, demo = false) => {
    if (demo) ensureScrutinyDemoApplications(actor);
    return scrutinyApplications(actor);
};
export const recordScrutinyDecision = (id: string, actor: ScrutinyActor, form: ScrutinyForm, action: "Forward" | "Return") => recordApplicationScrutiny(id, actor, form, action);
export const assignedAdvertisements = (actor: ScrutinyActor) => activeAdvertisements().filter((item) => item.university === actor.university && (actor.role !== "Department Authority / Course Coordinator" || actor.departments.includes(item.department)));
