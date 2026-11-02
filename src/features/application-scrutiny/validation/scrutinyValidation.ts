import type { PhdApplication } from "@/features/phd-application/types/application.types";
import { candidateSchema } from "@/features/candidate-profile/model/candidateProfile";
import { SCRUTINY_ROLES, VERIFICATION_STATUSES, DECISIONS } from "../form-config/scrutinyConfig";
import { scrutinyDocuments } from "../form-config/scrutinyDocuments";
import type { ScrutinyActor, ScrutinyForm, VerificationStatus, ScrutinyDecision } from "../types";

export const inScrutinyScope = (application: PhdApplication, actor: ScrutinyActor) => SCRUTINY_ROLES.includes(actor.role) && !!actor.userId && !!actor.university && application.advertisement.university === actor.university && (actor.role !== "Department Authority / Course Coordinator" || actor.departments.includes(application.advertisement.department));
export const validateScrutiny = (application: PhdApplication, actor: ScrutinyActor, form: ScrutinyForm, action: "Forward" | "Return") => {
    const errors: Record<string, string> = {};
    if (!inScrutinyScope(application, actor)) errors.permission = "You are not assigned to this university / department";
    if (!["Submitted", "Under Scrutiny"].includes(application.status) || application.pendingWith !== actor.role) errors.status = "This application is not pending with your role";
    if (form.revision !== (application.scrutinyHistory?.length ?? 0)) errors.revision = "The application has changed. Reopen it before recording scrutiny";
    if (!VERIFICATION_STATUSES.includes(form.netVerification as VerificationStatus)) errors.netVerification = "Select NET / URET verification status";
    if (application.advertisement.requirement !== "None" && form.netVerification === "Not Applicable") errors.netVerification = "NET / URET verification is required for this advertisement";
    for (const document of scrutinyDocuments(application)) {
        const status = form.documents[document.id];
        if (!VERIFICATION_STATUSES.includes(status as VerificationStatus)) errors[`document.${document.id}`] = "Select a verification status";
        else if (document.required && status === "Not Applicable") errors[`document.${document.id}`] = "This document is mandatory and cannot be marked Not Applicable";
        else if (status === "Verified" && !(document.file instanceof File)) errors[`document.${document.id}`] = "A missing document cannot be verified";
    }
    if (!DECISIONS.includes(form.decision as ScrutinyDecision)) errors.decision = "Select a scrutiny decision";
    const deficient = form.netVerification === "Deficient" || Object.values(form.documents).includes("Deficient");
    if ((deficient || form.decision === "Ineligible" || form.decision === "Deficient" || action === "Return") && !form.remarks.trim()) errors.remarks = "Remarks are required for deficiencies, ineligibility and returns";
    if (form.remarks.length > 3000) errors.remarks = "Maximum 3,000 characters";
    if (action === "Return" && form.decision !== "Deficient") errors.decision = "Select Deficient when returning an application for clarification";
    if (action === "Forward" && actor.role === "Scrutiny / Selection / Research Committee" && form.decision === "Deficient") errors.decision = "Return unresolved deficiencies for clarification";
    if (form.decision === "Eligible") {
        if (deficient) errors.decision = "An application with deficient verifications cannot be marked Eligible";
        if (!application.profile || !candidateSchema.safeParse(application.profile).success) errors.decision = "Mandatory candidate profile details are incomplete";
        if (application.paymentStatus === "Pending") errors.decision = "The mandatory application fee has not been paid";
    }
    return errors;
};
