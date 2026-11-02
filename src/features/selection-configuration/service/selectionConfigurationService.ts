import { selectionSchema } from "../validation/selectionConfigurationSchema";
import { EMPTY_CONFIGURATION } from "../form-config/selectionConfigurationConfig";
import type { SelectionConfiguration, SelectionRecord, ConfigurationChange, ConfigurationStatus, StageId } from "../types/selectionConfiguration.types";

let draftId: string | undefined;
const records: SelectionRecord[] = [];
const changes: ConfigurationChange[] = [];
const requirePermission = (role: string) => { if (!["University Authority", "Scrutiny / Selection / Research Committee"].includes(role)) throw new Error("You do not have permission to configure selection rules."); };
export const readSelectionRecords = () => structuredClone(records);
export const readSelectionDraftRecord = () => structuredClone(records.find((record) => record.id === draftId && record.status === "Draft"));
export const readSelectionDraft = () => structuredClone(readSelectionDraftRecord()?.configuration ?? EMPTY_CONFIGURATION);
const log = (record: SelectionRecord, action: string, before: SelectionConfiguration | null, previousStatus?: ConfigurationStatus, role = "University Authority") => {
    changes.push({ recordId: record.id, action, date: record.updatedAt, role, before: before ? structuredClone(before) : null, after: structuredClone(record.configuration), previousStatus, status: record.status });
};
export const saveSelectionDraft = (value: SelectionConfiguration, id: string | null | undefined = draftId, role = "University Authority") => {
    requirePermission(role);
    const validated = selectionSchema.parse(value);
    let record = id ? records.find((item) => item.id === id) : undefined;
    if (id && !record) throw new Error("Configuration no longer exists.");
    if (record && record.status !== "Draft") throw new Error("Approved and active configurations are locked. Create a revision to make changes.");
    if (record?.revisionOf) {
        const revisionOf = record.revisionOf;
        const source = records.find((item) => item.id === revisionOf)!;
        if (source.configuration.university !== validated.university || source.configuration.academicSession !== validated.academicSession) throw new Error("A revision must keep the original university and academic session.");
    }
    const before = record ? structuredClone(record.configuration) : null;
    if (!record) {
        record = { id: crypto.randomUUID(), version: 1, status: "Draft", configuration: validated, updatedAt: new Date().toISOString() };
        records.push(record);
    } else { record.configuration = validated; record.updatedAt = new Date().toISOString(); }
    draftId = record.id;
    log(record, before ? "Draft updated" : "Draft created", before, undefined, role);
    return structuredClone(record);
};
export const transitionSelection = (id: string, status: "Approved" | "Active", role: string) => {
    requirePermission(role);
    const record = records.find((item) => item.id === id);
    if (!record || (status === "Approved" ? record.status !== "Draft" : record.status !== "Approved")) throw new Error("Invalid configuration status transition.");
    selectionSchema.parse(record.configuration);
    const active = records.find((item) => item.id !== id && item.status === "Active" && item.configuration.university === record.configuration.university && item.configuration.academicSession === record.configuration.academicSession);
    if (status === "Active" && active && record.revisionOf === active.id) {
        active.status = "Approved"; active.updatedAt = new Date().toISOString();
        log(active, "Replaced by approved revision", active.configuration, "Active", role);
    }
    if (status === "Active" && records.some((item) => item.id !== id && item.status === "Active" && item.configuration.university === record.configuration.university && item.configuration.academicSession === record.configuration.academicSession)) throw new Error("An active configuration already exists for this university and session. Keep the existing active workflow until a replacement process is approved.");
    const previous = record.status;
    record.status = status; record.updatedAt = new Date().toISOString();
    log(record, status === "Approved" ? "Configuration approved" : "Configuration activated", record.configuration, previous, role);
    return structuredClone(record);
};
export const reviseSelection = (id: string, role: string) => {
    requirePermission(role);
    const source = records.find((record) => record.id === id);
    if (!source || source.status === "Draft") throw new Error("Only approved or active configurations need a revision.");
    const existing = records.find((record) => record.revisionOf === id && record.status === "Draft");
    if (existing) return structuredClone(existing);
    const record: SelectionRecord = { ...structuredClone(source), id: crypto.randomUUID(), version: source.version + 1, revisionOf: source.id, status: "Draft", updatedAt: new Date().toISOString() };
    records.push(record); draftId = record.id; log(record, "Revision created", source.configuration, source.status, role);
    return structuredClone(record);
};
export const readSelectionChanges = (id?: string) => structuredClone(changes.filter((change) => !id || change.recordId === id));
/** Mapping and scheduling consume only approved, active configurations and their selected stages. */
export const selectionWorkflowsFor = (university: string, academicSession: string) => readSelectionRecords().filter((record) => record.status === "Active" && record.configuration.university === university && record.configuration.academicSession === academicSession).map((record) => ({ ...record, configuration: { ...record.configuration, stages: [...record.configuration.stages].sort((a, b) => Number(a.order) - Number(b.order)) } }));

// Initial sample records for the wireframe list (not live university approvals).
const sampleRecords: { id: string; university: string; session: string; status: ConfigurationStatus; stages: StageId[]; weights: string[] }[] = [
    { id: "SC-DEMO-001", university: "utkal", session: "2027-28", status: "Active", stages: ["written", "interview", "synopsis"], weights: ["60", "30", "10"] },
    { id: "SC-DEMO-002", university: "ravenshaw", session: "2026-27", status: "Approved", stages: ["written", "interview"], weights: ["70", "30"] },
    { id: "SC-DEMO-003", university: "sambalpur", session: "2026-27", status: "Draft", stages: ["interview"], weights: ["100"] },
    { id: "SC-DEMO-004", university: "utkal", session: "2026-27", status: "Approved", stages: ["written", "interview"], weights: ["70", "30"] },
    { id: "SC-DEMO-005", university: "ravenshaw", session: "2027-28", status: "Draft", stages: ["interview", "synopsis"], weights: ["60", "40"] },
];
for (const sample of sampleRecords) {
    const configuration = selectionSchema.parse({
        university: sample.university, academicSession: sample.session,
        stages: sample.stages.map((id, index) => ({ id, order: String(index + 1), scored: true, marks: "100", weightage: sample.weights[index], qualifyingScore: "50" })),
        meritMethod: "weighted", firstTieBreaker: sample.stages[0], secondTieBreaker: "academic", exemptionRule: "", status: "Draft",
    });
    const record: SelectionRecord = { id: sample.id, version: 1, status: sample.status, configuration, updatedAt: "2026-10-31T09:00:00+05:30" };
    records.push(record);
    log(record, "Configuration record loaded", null);
}
