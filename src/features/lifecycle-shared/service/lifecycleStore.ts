import { canOpen, workflowRoleOf, ROLES, type PageKey } from "@/features/shared/roles";
import type { Actor, Definition, FeatureService, RecordRow, Scholar, Values, FieldContext } from "../types";
import { admissionConfig } from "@/features/shared/admissionMasters";
import { validateLifecycle } from "../validation/lifecycleValidation";
import { selectionWorkflowsFor } from "@/features/selection-configuration/service/selectionConfigurationService";
import { activeAdvertisements } from "@/features/phd-application/service/advertisementService";
import { scrutinyApplications } from "@/features/phd-application/service/applicationService";

export const dateToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const names = ["Ananya Das", "Rohan Mishra", "Priya Sahoo", "Arjun Nayak", "Sneha Mohanty"];
export const faculty = ["Prof. S. K. Behera", "Prof. Rajesh Sharma", "Dr. P. Mohanty", "Prof. M. Ray", "Dr. Anita Das"];
export const subjects = ["Research Methodology", "Research and Publication Ethics", "Quantitative Techniques", "Advanced Research Methods", "Research Seminar"];
export const scholars: Scholar[] = Array.from({ length: 8 }, (_, level) => names.map((name, i) => ({ id: "PHD/2026/" + String(level * 5 + i + 1).padStart(3, "0"), name, university: "utkal", department: "Computer Science", session: "2026-27", level, supervisor: faculty[i], registrationDate: String(2020 + Math.floor(level / 2)) + "-11-02", extensionYears: i % 3 }))).flat();
const data = new Map<string, RecordRow[]>();
let revision = 0;
const listeners = new Set<() => void>();
export const subscribeLifecycle = (callback: () => void) => { listeners.add(callback); return () => { listeners.delete(callback); }; };
export const lifecycleSnapshot = () => revision;
const changed = () => { revision++; listeners.forEach((callback) => callback()); };
const cloneValue = (value: unknown): unknown => {
    if (typeof File !== "undefined" && value instanceof File) return value;
    if (Array.isArray(value)) return value.map(cloneValue);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneValue(item)]));
    return value;
};
const clone = <T,>(value: T): T => cloneValue(value) as T;
export const inScope = (row: { university: string; department: string; scholarId?: string }, actor: Actor) => actor.universities.includes(row.university) && (!actor.departments.length || actor.departments.includes(row.department)) && (!actor.scholarIds.length || !!row.scholarId && actor.scholarIds.includes(row.scholarId));
export function resolveLifecycleActor(selectedRole: string, identity: unknown, page?: string): Actor {
    const role = workflowRoleOf(selectedRole, page);
    const assignmentRole = selectedRole === "Examiner / Viva Panel" ? "Thesis Examiner" : role;
    const user = identity && typeof identity === "object" ? identity as Values : {};
    const assigned = ["universityId", "universityIds", "departmentNames", "scholarIds"].some((key) => Object.hasOwn(user, key));
    const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
    const oversight = /HED|Auditor|System Administrator/.test(role);
    return {
        sourceRole: ROLES.some((item) => item.label === selectedRole) ? selectedRole : undefined, role, userId: String(user.loginUserName ?? role),
        universities: assigned ? typeof user.universityId === "string" ? [user.universityId] : strings(user.universityIds) : oversight ? admissionConfig.universities.map((item) => item.id) : ["utkal"],
        departments: assigned ? /Department|Coordinator|Supervisor|Assessor|Committee/.test(assignmentRole) && !strings(user.departmentNames).length ? ["__unassigned__"] : strings(user.departmentNames) : /Department|Coordinator|Supervisor|Assessor|Committee/.test(assignmentRole) ? ["Computer Science"] : [],
        scholarIds: assigned ? /Scholar|Supervisor|Thesis Examiner/.test(assignmentRole) && !strings(user.scholarIds).length ? ["__unassigned__"] : strings(user.scholarIds) : /Scholar/.test(role) ? [scholars[10].id] : /Supervisor/.test(role) ? scholars.filter((row) => row.supervisor === faculty[0]).map((row) => row.id) : /Thesis Examiner/.test(assignmentRole) ? scholars.filter((row) => (row.level === 4 || selectedRole === "Examiner / Viva Panel" && row.level === 5)).map((row) => row.id) : [],
    };
}
const minimumLevel: Record<string, number> = { coursework: 0, courseworkExams: 0, researchRegistration: 1, progressMonitoring: 2, scholarRequests: 0, preSubmissionSeminar: 2, thesisSubmission: 3, examinerManagement: 4, vivaVoce: 5, degreeAward: 6 };
export const scopedScholars = (actor: Actor, key: string) => scholars.filter((row) => inScope({ ...row, scholarId: row.id }, actor) && row.level >= (minimumLevel[key] ?? 0) && row.level < 7);
export function recordOptions(actor: Actor, key: string, values: Values): FieldContext["options"] {
    const available = scopedScholars(actor, key);
    const options = (items: readonly string[]) => items.map((value) => ({ value, label: value }));
    const ads = activeAdvertisements().filter((row) => inScope(row, { ...actor, scholarIds: [] }));
    const advertisement = ads.find((row) => row.id === values.advertisement);
    const workflow = advertisement ? selectionWorkflowsFor(advertisement.university, advertisement.academicSession).find((row) => row.id === advertisement.selectionConfigurationId) : undefined;
    const applicationActor = { role: "Scrutiny / Selection / Research Committee" as const, userId: actor.userId, name: actor.role, university: actor.universities[0] ?? "", departments: [] };
    const realCandidates = /Authority|Assessor|Committee/.test(actor.role) ? scrutinyApplications(applicationActor).filter((row) => row.status === "Eligible" && (!advertisement || row.advertisement.id === advertisement.id) && inScope({ ...row.advertisement, scholarId: "" }, { ...actor, scholarIds: [] })).map((row) => ({ value: row.id, label: row.reference + ": " + row.profile?.fullName })) : [];
    return {
        scholars: available.map((row) => ({ value: row.id, label: row.id + ": " + row.name + " (" + row.department + ")" })),
        candidates: [...realCandidates, ...(advertisement && advertisement.university === "utkal" && advertisement.department === "Computer Science" ? names.map((name, i) => ({ value: "APP/2027/" + String(i + 1).padStart(3, "0"), label: "APP/2027/" + String(i + 1).padStart(3, "0") + ": " + name })) : [])],
        advertisements: ads.map((row) => ({ value: row.id, label: row.number })),
        stages: workflow?.configuration.stages.map((row) => ({ value: row.id, label: ({ written: "Written Examination", interview: "Viva-Voce / Interview", synopsis: "Synopsis Presentation" })[row.id] })) ?? [],
        faculty: options(faculty), subjects: options(subjects), sessions: options(admissionConfig.sessions),
        universities: admissionConfig.universities.filter((row) => actor.universities.includes(row.id)).map((row) => ({ value: row.id, label: row.label })),
        departments: options((admissionConfig.universities.find((row) => row.id === (values.university || actor.universities[0]))?.departments ?? []).filter((name) => !actor.departments.length || actor.departments.includes(name))),
    };
}
export function deriveValues(def: Definition, actor: Actor, values: Values): Values {
    const scholar = scholars.find((row) => row.id === values.scholar);
    const result: Values = {};
    if (scholar) Object.assign(result, { registrationNumber: scholar.id, department: scholar.department, courseworkStatus: scholar.level >= 1 ? "Completed" : "Pending", reportingPeriod: "July - December 2026", specialization: "Computer Science", workload: scholars.filter((row) => row.supervisor === values.supervisor && row.level < 7).length });
    const options = recordOptions(actor, def.key, values);
    if (def.key === "selectionSchedule") {
        const stages = options.stages;
        const completed = new Set((data.get("selectionSchedule") ?? []).filter((row) => row.values.advertisement === values.advertisement && row.status !== "Draft").map((row) => row.values.stage));
        result.stage = (stages.find((stage) => !completed.has(stage.label)) ?? stages[stages.length - 1])?.label ?? "";
        const advertisement = activeAdvertisements().find((row) => row.id === values.advertisement);
        const configuration = advertisement && selectionWorkflowsFor(advertisement.university, advertisement.academicSession).find((row) => row.id === advertisement.selectionConfigurationId);
        const stage = configuration?.configuration.stages.find((item) => options.stages.find((option) => option.value === item.id)?.label === result.stage);
        result.maximumMarks = stage?.marks ?? "100";
    }
    if (def.key === "resultsAdmission") { const row = selectionResults(actor, values).find((item) => item.candidateId === values.candidate); result.meritScore = row?.meritScore ?? ""; result.meritRank = row?.meritRank ?? ""; result.assessmentsComplete = row?.complete ?? false; }


    if (def.key === "courseworkExams" && values.marks !== undefined && values.marks !== "") { result.result = Number(values.marks) >= 50 ? "Passed" : "Failed"; result.completionStatus = result.result === "Passed" ? "Completed" : "Failed"; }
    if (def.key === "degreeAward") result.awardRecommendation = scholar && scholar.level >= 6 ? "Recommended for award" : "Pending viva-voce completion";
    return result;
}
export function selectionResults(actor: Actor, values: Values): Values[] {
    const options = recordOptions(actor, "selectionSchedule", values);
    const advertisement = activeAdvertisements().find((row) => row.id === values.advertisement);
    const config = advertisement && selectionWorkflowsFor(advertisement.university, advertisement.academicSession).find((row) => row.id === advertisement.selectionConfigurationId)?.configuration;
    if (!config) return [];
    const assessments = (data.get("selectionSchedule") ?? []).filter((row) => row.values.advertisement === values.advertisement && inScope(row, actor)).flatMap((row) => (row.grids.assessments?.length ? row.grids.assessments : [row.values]).map((item): Values => ({ ...item, stage: row.values.stage })));
    const result = options.candidates.map((candidate) => {
        const stages = config.stages.map((stage) => ({ config: stage, assessment: assessments.find((item) => item.candidate === candidate.value && item.stage === options.stages.find((option) => option.value === stage.id)?.label) }));
        const complete = stages.every(({ config: stage, assessment }) => assessment && assessment.attendance === "Present" && assessment.outcome === "Qualified" && Number(assessment.marks) >= Number(stage.qualifyingScore));
        const score = complete ? stages.reduce((sum, { config: stage, assessment }) => sum + (config.meritMethod === "weighted" ? Number(assessment?.marks) / Number(stage.marks) * Number(stage.weightage) : Number(assessment?.marks)), 0) : null;
        return { candidateId: candidate.value, candidate: candidate.label, stageOutcome: complete ? "Completed" : "Pending Assessments", meritScore: score === null ? "" : score.toFixed(2), meritRank: "", complete };
    }).sort((a, b) => Number(b.meritScore || -1) - Number(a.meritScore || -1));
    return result.map((row, index) => ({ ...row, meritRank: row.complete ? String(index + 1) : "" }));
}
export function readFeatureRows(def: Definition, actor: Actor) {
    if (!actor.userId || !def.roles.includes(actor.role) || actor.sourceRole && !canOpen(actor.sourceRole, def.key as PageKey)) return [];
    ensureRecords(def);
    return clone((data.get(def.key) ?? []).filter((row) => inScope(row, actor)));
}
export function documentFile(title: string) {
    const safe = title.replace(/[^a-zA-Z0-9 /.-]/g, " ");
    const stream = "BT /F1 12 Tf 30 80 Td (" + safe + ") Tj ET";
    const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 140] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream"];
    let result = "%PDF-1.4\n"; const offsets = [0];
    objects.forEach((object, i) => { offsets.push(result.length); result += (i + 1) + " 0 obj\n" + object + "\nendobj\n"; });
    const start = result.length;
    result += "xref\n0 6\n0000000000 65535 f \n" + offsets.slice(1).map((offset) => String(offset).padStart(10, "0") + " 00000 n \n").join("") + "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" + start + "\n%%EOF";
    return new File([result], title.replace(/[^a-zA-Z0-9]+/g, "_") + ".pdf", { type: "application/pdf" });
}
function ensureRecords(def: Definition) {
    if (data.has(def.key)) return;
    data.set(def.key, names.map((name, i) => {
        const scholar = scholars[(def.key === "degreeAward" ? 7 : minimumLevel[def.key] ?? 0) * 5 + i];
        const values: Values = {
            reference: "PHD/" + def.uc + "/2026/" + String(i + 1).padStart(3, "0"), scholar: scholar.id, registrationNumber: scholar.id,
            name, academicSession: scholar.session, department: scholar.department, university: scholar.university,
            researchTopic: "Advanced Research in " + ["Artificial Intelligence", "Data Science", "Cyber Security", "Machine Learning", "Computer Networks"][i],
            thesisTitle: "Advanced Studies in " + ["Artificial Intelligence", "Data Science", "Cyber Security", "Machine Learning", "Computer Networks"][i],
            candidate: "APP/2027/" + String(i + 1).padStart(3, "0"), advertisement: "PHD-DEMO-CS", stage: "Written Examination", attendance: "Present", marks: String(80 + i), outcome: "Qualified", selectionStatus: "Selected", acceptance: "Accepted",
            course: subjects[i], credits: "4", duration: "6", faculty: faculty[i], supervisor: faculty[i], courseStatus: "In Progress", result: "Passed", completionStatus: "Completed", certificateNumber: "CW-CERT-2026-" + String(89 + i),
            requestType: "Topic Change", description: "Request to update the approved research topic.", assignedAuthority: "Department Authority / Committees",
            eventType: ["Selection Schedule", "Progress Submission", "Examiner Report", "Viva-Voce", "Registration Expiry"][i], recipient: name, message: "Review the assigned lifecycle activity before the due date.", deliveryChannel: "In-application", deliveryStatus: "Delivered", dueDate: dateToday(),
            username: name.toLowerCase().replace(" ", "."), email: name.toLowerCase().replace(" ", ".") + "@scholars.example", mobile: "900000000" + (i + 1), role: "Student / PhD Scholar", permissions: ["View"],
            approvalStatus: "Approved", approvalDate: dateToday(), examinerName: faculty[i], affiliation: "Utkal University", evaluationStatus: "Completed", approvalDecision: "Approved", archive: "Archived", finalDegreeNumber: "PHD-DEG-2026-" + String(i + 1).padStart(3, "0"), provisionalNumber: "PHD-PROV-2026-" + String(i + 1).padStart(3, "0"),
            actionType: "Submitted", recordReference: scholar.id, userTimestamp: faculty[i] + " / " + dateToday(), changeDetails: "Lifecycle record submitted for review.", status: def.key === "degreeAward" ? "Completed" : "Submitted",
        };
        def.columns.forEach((column) => { values[column.name] ??= /Date|schedule/i.test(column.name) ? dateToday() : /remarks|recommend|proceeding/i.test(column.name) ? "Reviewed according to configured university requirements." : ""; });
        const grids: Record<string, Values[]> = def.key === "examinerManagement" ? { nominations: faculty.slice(0, 2).map((examinerName, index) => ({ examinerName, affiliation: "Utkal University", email: "examiner" + (index + 1) + "@research.example", mobile: "900000001" + index })) } : {};
        if (def.key === "coursework") grids.enrollment = [{ scholar: scholar.id, name: scholar.name, department: scholar.department, attendance: i % 2 ? "Absent" : "Present" }];
        return { id: def.key + "-" + i, scholarId: scholar.id, university: scholar.university, department: scholar.department, owner: name, status: String(values.status), date: new Date().toISOString(), values, grids, archived: def.key === "degreeAward" };
    }));
}
export function makeFeatureService(def: Definition): FeatureService {
    return {
        read: (actor) => readFeatureRows(def, actor),
        approveNomination: (actor, id) => {
            if (def.key !== "examinerManagement" || !["University Authority", "University Authority"].includes(actor.role) || actor.sourceRole && !canOpen(actor.sourceRole, "examinerManagement")) throw new Error("Nomination approval permission is required");
            const row = (data.get(def.key) ?? []).find((item) => item.id === id);
            if (!row || !inScope(row, actor) || row.values.approvalStatus === "Approved" || (row.grids.nominations?.length ?? 0) < 2) throw new Error("Only pending valid nominations can be approved");
            row.values.approvalStatus = "Approved"; row.values.approvalDate = dateToday(); row.status = "Approved"; row.values.status = row.status;
            const audit = data.get("auditTrail") ?? []; audit.unshift({ ...clone(row), id: crypto.randomUUID(), archived: true, date: new Date().toISOString(), values: { actionType: "Examiner nomination approved", recordReference: row.values.reference, userTimestamp: actor.userId + " / " + new Date().toISOString(), changeDetails: "Pending -> Approved" } }); data.set("auditTrail", audit); changed(); return clone(row);
        },
        changeAccountStatus: (actor, id, active) => {
            if (def.key !== "adminManagement" || !def.writers.includes(actor.role) || actor.sourceRole && !canOpen(actor.sourceRole, "adminManagement")) throw new Error("User administration permission is required");
            const row = (data.get(def.key) ?? []).find((item) => item.id === id);
            if (!row || !inScope(row, actor)) throw new Error("User account is outside your scope");
            const before = row.status; row.status = active ? "Active" : "Inactive"; row.values.status = row.status;
            const audit = data.get("auditTrail") ?? []; audit.unshift({ ...clone(row), id: crypto.randomUUID(), archived: true, date: new Date().toISOString(), values: { actionType: active ? "Activated" : "Deactivated", recordReference: row.values.username, userTimestamp: actor.userId + " / " + new Date().toISOString(), changeDetails: before + " -> " + row.status } }); data.set("auditTrail", audit); changed(); return clone(row);
        },
        save: (actor, values, grids, fields, id) => {
            if (!actor.userId || !def.writers.includes(actor.role) || actor.sourceRole && !canOpen(actor.sourceRole, def.key as PageKey)) throw new Error("This role cannot submit this lifecycle record.");
            ensureRecords(def);
            const previous = data.get(def.key)!.find((row) => row.id === id);
            if (id && !previous) throw new Error("Record no longer exists.");
            if (previous && (!inScope(previous, actor) || previous.archived)) throw new Error("Record is outside your scope or archived.");
            const derived = deriveValues(def, actor, values);
            const normalized = { ...values, ...derived };
            fields.filter((field) => field.readOnly && !Object.hasOwn(derived, field.name)).forEach((field) => { if (previous && Object.hasOwn(previous.values, field.name)) normalized[field.name] = previous.values[field.name]; else delete normalized[field.name]; });
            if (def.key === "examinerManagement") { normalized.approvalStatus ??= "Pending"; if (actor.role === "Thesis Examiner" && previous) grids = previous.grids; }
            const errors = validateLifecycle(def, normalized, grids, fields, actor);
            if (def.key === "selectionSchedule") {
                const candidates = recordOptions(actor, def.key, normalized).candidates.map((item) => item.value);
                if ((grids.assessments ?? []).some((row) => !candidates.includes(String(row.candidate)))) errors.assessments = "Assess only eligible candidates belonging to this advertisement and scope";
                if (new Set((grids.assessments ?? []).map((row) => row.candidate)).size !== (grids.assessments ?? []).length) errors.assessments = "Duplicate candidate assessments are not allowed";
            }
            if (def.key === "coursework" && (grids.enrollment ?? []).some((row) => !scopedScholars(actor, def.key).some((scholar) => scholar.id === row.scholar))) errors.enrollment = "Enroll only admitted scholars within your department";
            if (normalized.scholar && !scopedScholars(actor, def.key).some((row) => row.id === normalized.scholar)) errors.scholar = "The scholar does not satisfy this stage prerequisite or assignment";
            if (def.key === "adminManagement" && (data.get(def.key) ?? []).some((row) => row.id !== id && row.values.username === normalized.username)) errors.username = "Username must be unique";
            if (def.key === "degreeAward" && (data.get(def.key) ?? []).some((row) => row.id !== id && row.values.finalDegreeNumber === normalized.finalDegreeNumber)) errors.finalDegreeNumber = "Final degree number must be unique";
            if (Object.keys(errors).length) throw new Error(Object.values(errors).join(" "));
            const scholar = scholars.find((row) => row.id === normalized.scholar);
            const university = scholar?.university ?? String(normalized.university || actor.universities[0] || "");
            const department = scholar?.department ?? String(normalized.department || actor.departments[0] || "Computer Science");
            if (!inScope({ university, department, scholarId: scholar?.id ?? "" }, actor)) throw new Error("Record is outside your assigned scope.");
            const record: RecordRow = { id: previous?.id ?? crypto.randomUUID(), university, department, scholarId: scholar?.id ?? "", owner: scholar?.name ?? actor.userId, date: new Date().toISOString(), status: "Submitted", values: normalized, grids: clone(grids), archived: false };
            Object.assign(record.values, { reference: previous?.values.reference ?? "PHD/" + def.uc + "/" + new Date().getFullYear() + "/" + crypto.randomUUID().slice(0, 8).toUpperCase(), submissionDate: dateToday() });
            if (def.key === "coursework") record.values.attendance = (grids.enrollment ?? []).map((row) => row.name + ": " + row.attendance).join(", ");
            if (def.key === "selectionSchedule" && grids.assessments?.length) for (const name of ["candidate", "attendance", "marks", "outcome"]) record.values[name] = grids.assessments.map((row) => row[name]).join(", ");
            if (def.key === "resultsAdmission" && actor.role === "University Authority") {
                record.status = normalized.selectionStatus === "Selected" && normalized.acceptance === "Accepted" ? "Admitted" : "Approved";
                if (record.status === "Admitted") { const candidate = recordOptions(actor, def.key, normalized).candidates.find((item) => item.value === normalized.candidate); const identifier = "PHD/" + new Date().getFullYear() + "/" + crypto.randomUUID().slice(0, 8).toUpperCase(); scholars.push({ id: identifier, name: candidate?.label.split(": ").slice(1).join(": ") ?? "", university, department, session: "2027-28", level: 0, supervisor: "" }); record.scholarId = identifier; }
            }
            if (def.key === "courseworkExams" && normalized.result === "Failed") { delete record.values.certificateNumber; record.values.issueDate = ""; }
            if (def.key === "courseworkExams" && normalized.result === "Passed") { record.values.certificateNumber = "CW-CERT/" + crypto.randomUUID().slice(0, 8).toUpperCase(); if (scholar) scholar.level = Math.max(scholar.level, 1); }
            if (def.key === "researchRegistration" && normalized.approval === "Approved" && scholar) { scholar.level = Math.max(scholar.level, 2); scholar.supervisor = String(normalized.supervisor); record.values.allocationDate = dateToday(); }
            if (def.key === "progressMonitoring") record.status = actor.role === "Scrutiny / Selection / Research Committee" ? String(normalized.committeeEvaluation) : "Under Review";
            if (def.key === "scholarRequests") { record.status = String(normalized.decision || "Submitted"); record.values.assignedAuthority = "Department Authority / Course Coordinator"; if (["Approved", "Rejected"].includes(record.status)) record.values.resolutionDate = dateToday(); }
            if (def.key === "preSubmissionSeminar" && normalized.outcome === "Approved" && scholar) scholar.level = Math.max(scholar.level, 3);
            if (def.key === "thesisSubmission" && normalized.departmentVerification === "Verified" && scholar) { scholar.level = Math.max(scholar.level, 4); record.values.submissionStatus = "Accepted for Evaluation"; }
            if (def.key === "examinerManagement" && normalized.approvalStatus === "Approved" && normalized.appointmentDate) record.values.dispatchDate = dateToday();
            if (def.key === "examinerManagement" && normalized.recommendation === "Accepted" && scholar) scholar.level = Math.max(scholar.level, 5);
            if (def.key === "vivaVoce" && normalized.recommendation === "Award Recommended" && scholar) scholar.level = Math.max(scholar.level, 6);
            if (def.key === "degreeAward" && normalized.approvalDecision === "Approved" && scholar) { scholar.level = 7; record.archived = true; record.status = "Completed"; record.values.provisionalNumber = "PHD-PROV/" + crypto.randomUUID().slice(0, 8).toUpperCase(); record.values.archive = "Archived"; }
            if (def.key === "adminManagement") record.status = previous?.status ?? "Active";
            record.values.status = record.status;
            const rows = data.get(def.key)!; if (previous) rows[rows.indexOf(previous)] = record; else rows.unshift(record);
            const audit = data.get("auditTrail") ?? []; audit.unshift({ ...clone(record), id: crypto.randomUUID(), archived: true, values: { actionType: previous ? "Updated" : "Submitted", recordReference: String(record.values.reference), userTimestamp: actor.userId + " / " + record.date, changeDetails: JSON.stringify({ before: previous?.values ?? null, after: record.values }) } }); data.set("auditTrail", audit);
            if (def.key !== "notifications") { const notices = data.get("notifications") ?? []; notices.unshift({ ...clone(record), id: crypto.randomUUID(), values: { eventType: def.title, recipient: record.owner, message: def.title + " submitted for review.", dueDate: String(normalized.dueDate ?? ""), deliveryChannel: "In-application", deliveryStatus: "Delivered" } }); data.set("notifications", notices); }
            changed(); return clone(record);
        },
    };
}
export function readLifecycleReport(actor: Actor, criteria: Values, definitions: Definition[]) {
    if (actor.sourceRole && !canOpen(actor.sourceRole, "reportsAnalytics")) return [];
    if (!["University Authority", "Department Authority / Course Coordinator", "Authorized HED Official / Auditor"].includes(actor.role)) return [];
    const stages: Record<string, string> = { selectionSchedule: "Admission", resultsAdmission: "Admission", coursework: "Coursework", courseworkExams: "Coursework", researchRegistration: "Research", progressMonitoring: "Research", scholarRequests: "Research", preSubmissionSeminar: "Thesis", thesisSubmission: "Thesis", examinerManagement: "Thesis", vivaVoce: "Viva-Voce", degreeAward: "Degree" };
    const result: RecordRow[] = [];
    if (criteria.reportType === "Registration Period") return scholars.filter((row) => row.level >= 2 && inScope({ ...row, scholarId: row.id }, actor)).map((row) => {
        const date = new Date((row.registrationDate ?? "2026-11-02") + "T12:00:00"); date.setFullYear(date.getFullYear() + 5 + Math.min(2, row.extensionYears ?? 0));
        const due = date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
        const status = due < dateToday() ? "Registration Expired" : row.extensionYears ? "Approved Extension: " + row.extensionYears + " Year(s)" : "Active Registration";
        return { id: row.id, scholarId: row.id, university: row.university, department: row.department, owner: row.name, date: new Date().toISOString(), status, grids: {}, values: { recordReference: row.id, scholar: row.name, university: row.university, department: row.department, lifecycleStage: "Research", status, dueDate: due } };
    });
    definitions.filter((def) => stages[def.key]).forEach((def) => {
        ensureRecords(def);
        (data.get(def.key) ?? []).filter((row) => inScope(row, actor)).forEach((row) => {
            const stage = stages[def.key];
            if (criteria.university && criteria.university !== row.university || criteria.department && criteria.department !== row.department || criteria.academicSession && row.values.academicSession && criteria.academicSession !== row.values.academicSession || criteria.lifecycleStage && criteria.lifecycleStage !== stage) return;
            if (criteria.reportType && !["Pending Tasks", "Overdue Tasks"].includes(String(criteria.reportType)) && criteria.reportType !== stage) return;
            if (criteria.fromDate && row.date.slice(0, 10) < String(criteria.fromDate) || criteria.toDate && row.date.slice(0, 10) > String(criteria.toDate)) return;
            if (criteria.reportType === "Pending Tasks" && row.status === "Completed" || criteria.reportType === "Overdue Tasks" && (!row.values.dueDate || String(row.values.dueDate) >= dateToday())) return;
            result.push({ ...row, id: def.key + ":" + row.id, values: { recordReference: row.values.reference, scholar: row.scholarId, university: admissionConfig.universities.find((item) => item.id === row.university)?.label ?? row.university, department: row.department, lifecycleStage: stage, status: row.status, dueDate: row.values.dueDate ?? "" } });
        });
    });
    return clone(result);
}

/** Counts report records and statuses within the caller's scoped result set. */
export function lifecycleIndicatorSummaries(rows: RecordRow[]) {
    return [["Admissions", "Admission"], ["Coursework", "Coursework"], ["Progress", "Research"], ["Thesis", "Thesis"], ["Degree Award", "Degree"]].map(([label, stage]) => {
        const records = rows.filter((row) => row.values.lifecycleStage === stage);
        const statuses = new Map<string, number>();
        records.forEach((row) => statuses.set(row.status, (statuses.get(row.status) ?? 0) + 1));
        return { label, count: records.length, statusSummary: [...statuses].map(([status, count]) => status + ": " + count).join(", ") };
    });
}
export function summarizeLifecycleIndicators(rows: RecordRow[]): string {
    return lifecycleIndicatorSummaries(rows).map(({ label, count, statusSummary }) => label + ": " + count + (statusSummary ? " (" + statusSummary + ")" : "")).join("; ");
}
