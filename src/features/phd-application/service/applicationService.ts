import type { ApplicationForm, PhdApplication, CandidateApplicationNotification } from "../types/application.types";
import type { AdmissionAdvertisement } from "../types/advertisement.types";
import type { ApplicationValidationContext } from "../types/applicationValidation.types";
import { correctionAllowed, qualifies, validateApplicationForm } from "../validation/applicationValidation";

import { inScrutinyScope, scrutinyPolicy, validateScrutiny, type ScrutinyActor, type ScrutinyForm, type ScrutinyDecision } from "@/features/application-scrutiny/model/scrutinyRules";
import { candidateForApplication, setCandidateApplicationStatus } from "@/features/candidate-profile/model/candidateStore";
import { selectionWorkflowsFor } from "@/features/selection-configuration/model/selectionConfiguration";
import { findAdvertisement, isOpenAdvertisement } from "./advertisementService";

interface Payment { reference: string; amount: number; status: "Success" }
type StoredApplication = PhdApplication & { account: string };
const applications: StoredApplication[] = [];
const payments = new Map<string, Payment>();
const cloneForm = (form: ApplicationForm) => ({ ...form, documents: { ...form.documents } });
const copy = (row: StoredApplication): PhdApplication => {
    const { account, ...visible } = row;
    void account;
    return { ...visible, form: cloneForm(row.form), advertisement: structuredClone(row.advertisement), profile: row.profile ? { ...row.profile, education: row.profile.education.map((item) => ({ ...item })) } : null, selectionStages: [...row.selectionStages], scrutinyHistory: structuredClone(row.scrutinyHistory ?? []) };
};
export const feeFor = (account: string, advertisement: AdmissionAdvertisement) => {
    const profile = candidateForApplication(account);
    if (advertisement.fee <= 0) return { status: "Not Required" as const, amount: 0, reference: undefined };
    if (profile && advertisement.exemptCategories.includes(profile.category)) return { status: "Exempt" as const, amount: 0, reference: undefined };
    const payment = payments.get(`${account}:${advertisement.id}`);
    if (payment?.status === "Success" && payment.amount === advertisement.fee) return { status: "Success" as const, amount: advertisement.fee, reference: payment.reference };
    return { status: "Pending" as const, amount: advertisement.fee, reference: undefined };
};
export const recordDemoPayment = (account: string, advertisementId: string) => {
    const advertisement = findAdvertisement(advertisementId);
    if (!advertisement || !isOpenAdvertisement(advertisement)) throw new Error("Advertisement is not open for applications.");
    if (!candidateForApplication(account)) throw new Error("Complete and submit My Profile before payment.");
    if (feeFor(account, advertisement).status !== "Pending") return;
    payments.set(`${account}:${advertisementId}`, { reference: `PAY/${new Date().getFullYear()}/${crypto.randomUUID().slice(0, 8).toUpperCase()}`, amount: advertisement.fee, status: "Success" });
};
export const correctionAdvertisementsFor = (account: string) => applications.filter((row) => row.account === account && correctionAllowed(row)).map((row) => findAdvertisement(row.form.advertisement)).filter((row): row is AdmissionAdvertisement => row !== undefined && row.published && row.status === "Published");
export const readMyApplications = (account: string) => applications.filter((row) => row.account === account).map(copy);
/** Read-only dashboard projection; never expose drafts or records outside the assigned scope. */
export const applicationsForDashboard = (role: string, universityIds: string[], departments: string[]) => {
    if (!["University Authority", "Authorized HED Official / Auditor"].includes(role)) return [];
    return applications.filter((row) => row.status !== "Draft" && universityIds.includes(row.advertisement.university) && (!departments.length || departments.includes(row.advertisement.department))).map((row) => ({
        id: row.id, reference: row.reference, name: row.profile?.fullName ?? row.reference,
        academicSession: row.advertisement.academicSession, university: row.advertisement.university,
        department: row.advertisement.department, stage: "Admission" as const, status: row.status,
        pendingWith: row.pendingWith,
        pendingAction: row.pendingWith ? "Application Scrutiny" : undefined,
    }));
};
export const saveApplication = (account: string, form: ApplicationForm, final: boolean) => {
    const advertisement = findAdvertisement(form.advertisement);
    const existing = applications.find((row) => row.account === account && row.form.advertisement === form.advertisement);
    const correcting = correctionAllowed(existing);
    if (existing?.status === "Returned" && !correcting) throw new Error("The correction period has ended.");
    if (!advertisement || (!isOpenAdvertisement(advertisement) && !(correcting && advertisement.published && advertisement.status === "Published"))) throw new Error("The advertisement is closed or not published.");
    if (!candidateForApplication(account)) throw new Error("Complete and submit My Profile first.");
    if (existing && !["Draft", "Returned"].includes(existing.status)) throw new Error("An application has already been submitted for this advertisement.");
    if (final) { const errors = validateApplication(account, form); if (Object.keys(errors).length) return { ok: false as const, errors }; }
    const fee = feeFor(account, advertisement);
    const workflow = selectionWorkflowsFor(advertisement.university, advertisement.academicSession).find((row) => row.id === advertisement.selectionConfigurationId);
    const row: StoredApplication = {
        ...existing,
        id: existing?.id ?? crypto.randomUUID(), account, reference: existing && existing.reference !== "Not submitted" ? existing.reference : final ? `PHD-APP-${crypto.randomUUID().toUpperCase()}` : "Not submitted",
        status: final ? "Submitted" : correcting ? "Returned" : "Draft", form: cloneForm(form), advertisement, profile: candidateForApplication(account),
        paymentStatus: fee.status, paymentReference: fee.reference, selectionStages: correcting ? [...existing!.selectionStages] : workflow?.configuration.stages.map((stage) => stage.id) ?? [],
        pendingWith: final ? correcting ? existing!.returnTo ?? "Department Authority / Course Coordinator" : "Department Authority / Course Coordinator" : correcting ? "Student / Candidate / Scholar" : undefined,
        scrutinyHistory: structuredClone(existing?.scrutinyHistory ?? []),
        submittedAt: existing?.submittedAt ?? (final ? new Date().toISOString() : undefined),
        resubmittedAt: final && correcting ? new Date().toISOString() : existing?.resubmittedAt,
    };
    if (final && correcting) {
        row.scrutinyHistory!.push({ id: crypto.randomUUID(), date: new Date().toISOString(), userId: row.profile!.candidateId, user: row.profile!.fullName, role: "Student / Candidate / Scholar", action: "Resubmitted", remarks: "Corrected application resubmitted", from: "Student / Candidate / Scholar", to: row.pendingWith! });
        row.correctionUntil = undefined; row.returnTo = undefined; row.scrutinyOutcome = undefined;
    }
    if (existing) applications[applications.indexOf(existing)] = row;
    else applications.push(row);
    if (final) setCandidateApplicationStatus(account, "Submitted");
    return { ok: true as const, application: copy(row) };
};
/** Available to authorized scrutiny consumers; candidate pages always use readMyApplications. */
export const applicationsForScrutiny = (role: string) => {
    if (!["University Authority", "Scrutiny / Selection / Research Committee"].includes(role)) throw new Error("Scrutiny permission is required.");
    return applications.filter((row) => row.status === "Submitted").map(copy);
};

const candidateNotifications = new Map<string, CandidateApplicationNotification[]>();
export const readApplicationNotifications = (account: string) => structuredClone(candidateNotifications.get(account) ?? []);
export const scrutinyApplications = (actor: ScrutinyActor) => applications.filter((row) => row.status !== "Draft" && row.advertisement.published && inScrutinyScope(row, actor)).map(copy);
export const recordApplicationScrutiny = (applicationId: string, actor: ScrutinyActor, form: ScrutinyForm, action: "Forward" | "Return") => {
    const row = applications.find((item) => item.id === applicationId);
    if (!row) throw new Error("Application not found.");
    const errors = validateScrutiny(copy(row), actor, form, action);
    if (form.decision === "Eligible" && row.profile) {
        if (!qualifies(row.profile, row.advertisement)) errors.decision = "The configured NET / URET requirement or approved exemption is not satisfied";
        const masters = /^(ma|msc|mcom|mtech|me|mba|mca|mphil|mastersdegree|masterof.+)$/;
        if (!row.profile.education.some((item) => masters.test(item.qualification.toLowerCase().replace(/[^a-z]/g, "")) && Number(item.marks) >= row.advertisement.minimumAcademicPercent)) errors.decision = "The university's configured academic eligibility rule is not met";
    }
    if (Object.keys(errors).length) return { ok: false as const, errors };
    const from = row.pendingWith!;
    let to: string;
    if (action === "Return") {
        row.status = "Returned"; to = "Student / Candidate / Scholar"; row.returnTo = actor.role;
        row.correctionUntil = new Date(Date.now() + scrutinyPolicy.correctionDays * 86400000).toISOString();
    } else if (actor.role === "Department Authority / Course Coordinator") {
        row.status = "Under Scrutiny"; to = scrutinyPolicy.departmentNext;
    } else {
        row.status = form.decision === "Eligible" ? "Eligible" : "Ineligible";
        to = form.decision === "Eligible" ? row.selectionStages[0] ?? "Selection scheduling" : "Scrutiny complete";
    }
    row.pendingWith = to; row.scrutinyOutcome = form.decision as ScrutinyDecision; row.scrutinyRemarks = form.remarks.trim();
    row.scrutinyHistory ??= [];
    row.scrutinyHistory.push({ id: crypto.randomUUID(), date: new Date().toISOString(), userId: actor.userId, user: actor.name, role: actor.role, action, decision: form.decision as ScrutinyDecision, remarks: form.remarks.trim(), from, to, netVerification: form.netVerification, documents: { ...form.documents } });
    const otherLocked = applications.some((item) => item.account === row.account && item.id !== row.id && ["Submitted", "Under Scrutiny", "Eligible", "Ineligible"].includes(item.status));
    setCandidateApplicationStatus(row.account, row.status === "Returned" && !otherLocked ? "Returned" : row.status === "Ineligible" ? "Rejected" : "Under Review");
    const message = action === "Return" ? row.reference + " returned for correction: " + row.scrutinyRemarks + ". Resubmit by " + new Date(row.correctionUntil!).toLocaleString("en-IN") : row.reference + ": " + row.scrutinyOutcome + ". Routed to " + to + ".";
    candidateNotifications.set(row.account, [...(candidateNotifications.get(row.account) ?? []), { id: crypto.randomUUID(), applicationId: row.id, date: new Date().toISOString(), message }]);
    return { ok: true as const, application: copy(row) };
};


export const getApplicationValidationContext = (account: string, advertisementId: string): ApplicationValidationContext => {
    const advertisement = findAdvertisement(advertisementId);
    return {
        advertisement, profile: candidateForApplication(account),
        existing: readMyApplications(account).find((row) => row.form.advertisement === advertisementId),
        paymentStatus: advertisement ? feeFor(account, advertisement).status : "Not Required",
        workflowActive: !!advertisement && selectionWorkflowsFor(advertisement.university, advertisement.academicSession).some((row) => row.id === advertisement.selectionConfigurationId),
    };
};
export const validateApplication = (account: string, form: ApplicationForm) => validateApplicationForm(form, getApplicationValidationContext(account, form.advertisement));
