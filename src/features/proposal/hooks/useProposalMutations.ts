import { useCallback } from "react";
import {
    OPEN_STATUSES,
    PENDING_WITH,
    matrixMismatch,
    today,
    useCurrentUser,
    usePayFix,
    type Proposal,
    type ProposalType,
    type EventReason,
} from "../../shared";
import type { ProposalFormData, SaveResult } from "../types/proposal.types";
import { validateProposal } from "../validation/proposalSchema";

const nextId = (proposals: Proposal[]) => {
    const max = proposals.reduce((m, p) => Math.max(m, Number(p.id.slice(-4)) || 0), 0);
    return `PFP-${new Date().getFullYear()}-${String(max + 1).padStart(4, "0")}`;
};

/** Proposal → form values (Edit of a Draft / Returned proposal). */
export const toForm = (p: Proposal): ProposalFormData => ({
    type: p.type,
    officerCode: p.officerCode,
    designation: p.designation,
    cadre: p.cadre,
    institution: p.institution,
    event: p.event,
    eventDate: p.eventDate,
    existingBasic: String(p.existing.basic || ""),
    existingLevel: p.existing.level,
    existingCell: String(p.existing.cell || ""),
    proposedBasic: String(p.proposed.basic || ""),
    proposedLevel: p.proposed.level,
    proposedCell: String(p.proposed.cell || ""),
    nextIncrement: p.nextIncrement,
    justification: p.justification,
    documents: Object.fromEntries(p.documents.map((d) => [d.kind, d.fileName])),
    declaration: p.declaration,
});

/** Save as Draft and Submit (SRS 1.2 logic steps 5–7). */
export const useProposalMutations = () => {
    const { data, update, addLog, notify } = usePayFix();
    const user = useCurrentUser();

    const save = useCallback(
        (form: ProposalFormData, mode: "draft" | "submit", editingId?: string): SaveResult => {
            const { config, officers, proposals } = data;
            const officer = officers.find((o) => o.code === form.officerCode);

            if (mode === "submit") {
                const errors = validateProposal(form, config.documents);
                if (Object.keys(errors).length) return { ok: false, errors };

                // E5: officer must be the user's own record (OES Officer) or of the admin's institution.
                const allowed = user.roleKey === "officer" ? form.officerCode === user.officerCode : officer?.institution === user.institution;
                if (!allowed || (user.roleKey === "college" && !config.rules.allowAdminOnBehalf))
                    return { ok: false, blocker: "You are not authorised to submit a proposal for the selected officer." };

                // E2: proposed pay must match the pay matrix when the rule engine is active.
                if (config.rules.ruleEngine) {
                    const mismatch = matrixMismatch({ basic: Number(form.proposedBasic), level: form.proposedLevel, cell: Number(form.proposedCell) }, config.payLevels);
                    if (mismatch) return { ok: false, errors: { proposedBasic: mismatch }, blocker: `Proposed pay is inconsistent with the configured rules. ${mismatch}` };
                }

                // E4: one open proposal per officer and event.
                if (config.rules.blockDuplicateOpen) {
                    const dup = proposals.find(
                        (p) => p.id !== editingId && p.officerCode === form.officerCode && p.event === form.event && OPEN_STATUSES.includes(p.status) && p.status !== "Draft",
                    );
                    if (dup) return { ok: false, blocker: `An open proposal (${dup.id}) already exists for this officer and event (${form.event}).` };
                }
            } else if (!form.type || !form.officerCode) {
                return { ok: false, errors: { type: form.type ? undefined : "Select the proposal type", officerCode: form.officerCode ? undefined : "Select the officer" } };
            }

            const id = editingId ?? nextId(proposals);
            const status = mode === "submit" ? "Submitted" : "Draft";
            const date = today();
            const existingProposal = proposals.find((p) => p.id === editingId);
            const resubmit = existingProposal?.status === "Returned";

            update((d) => {
                const record: Proposal = {
                    ...(existingProposal ?? {
                        movement: [{ date, by: user.name, role: "Initiator", action: "Created (Draft)", remarks: "—" }],
                        createdDate: date,
                        decisionDate: "—",
                        orderNo: "—",
                        createdBy: user.roleKey,
                    }),
                    id,
                    type: form.type as ProposalType,
                    officerCode: form.officerCode,
                    officerName: officer?.name ?? "",
                    designation: form.designation,
                    cadre: form.cadre,
                    institution: form.institution,
                    event: (form.event || "Other") as EventReason,
                    eventDate: form.eventDate,
                    existing: { basic: Number(form.existingBasic) || 0, level: form.existingLevel, cell: Number(form.existingCell) || 0 },
                    proposed: { basic: Number(form.proposedBasic) || 0, level: form.proposedLevel, cell: Number(form.proposedCell) || 0 },
                    verified: undefined,
                    nextIncrement: form.nextIncrement,
                    justification: form.justification,
                    documents: Object.entries(form.documents).map(([kind, fileName], i) => ({ id: `${id}-D${i + 1}`, kind, fileName, uploadedOn: date })),
                    declaration: form.declaration,
                    status,
                    pendingWith: PENDING_WITH[status],
                    submittedDate: mode === "submit" ? date : "—",
                } as Proposal;
                record.movement = [...record.movement];
                if (mode === "submit")
                    record.movement.push({ date, by: user.name, role: "Initiator", action: resubmit ? "Re-submitted after correction" : "Submitted", remarks: "Submitted for verification" });
                const i = d.proposals.findIndex((p) => p.id === id);
                if (i >= 0) d.proposals[i] = record;
                else d.proposals.unshift(record);
            });
            addLog({ user: user.name, role: user.role, action: mode === "submit" ? "Submitted proposal" : "Saved proposal as draft", ref: id });
            if (mode === "submit") notify(`${id} submitted for ${officer?.name}; pending with Accounts / Establishment`);
            return { ok: true, id, status };
        },
        [data, update, addLog, notify, user],
    );

    const remove = useCallback(
        (id: string) => {
            update((d) => {
                d.proposals = d.proposals.filter((p) => p.id !== id || p.status !== "Draft");
            });
            addLog({ user: user.name, role: user.role, action: "Deleted draft proposal", ref: id });
        },
        [update, addLog, user],
    );

    return { save, remove };
};
