import { useCallback } from "react";
import {
    PENDING_WITH,
    STAGE_ROLE,
    historyFromProposal,
    matrixMismatch,
    today,
    useCurrentUser,
    usePayFix,
    type PayParticulars,
    type ProposalStatus,
    type RoleKey,
} from "../../shared";

export type WorkflowAction = "verify" | "approve" | "forward" | "sanction" | "return" | "reject";

/** Action buttons per stage (SRS 1.4 Workflow Summary). */
export const ACTIONS_FOR: Partial<Record<RoleKey, WorkflowAction[]>> = {
    accounts: ["verify", "return", "reject"],
    fo: ["approve", "forward", "return", "reject"],
    dhe: ["sanction", "return", "reject"],
};

export const ACTION_META: Record<WorkflowAction, { label: string; status: ProposalStatus; log: string; needsRemarks: boolean }> = {
    verify: { label: "Verify & Forward to FO", status: "Verified", log: "Verified", needsRemarks: false },
    approve: { label: "Approve (Finalise)", status: "Approved", log: "Approved (Finalised)", needsRemarks: false },
    forward: { label: "Approve & Forward to Competent Authority", status: "Forwarded", log: "Forwarded to Competent Authority", needsRemarks: false },
    sanction: { label: "Sanction", status: "Sanctioned", log: "Sanctioned", needsRemarks: false },
    return: { label: "Return for Correction", status: "Returned", log: "Returned for Correction", needsRemarks: true },
    reject: { label: "Reject", status: "Rejected", log: "Rejected", needsRemarks: true },
};

const ROLE_STAGE: Partial<Record<RoleKey, string>> = { accounts: "Accounts / Establishment", fo: "Finance Officer", dhe: "Competent Authority" };

export interface ActResult {
    ok: boolean;
    error?: string;
    status?: ProposalStatus;
}

/** Verify / Approve / Forward / Sanction / Return / Reject with the SRS 1.4 exceptions E1–E3. */
export const useVerificationActions = () => {
    const { data, update, addLog, notify } = usePayFix();
    const user = useCurrentUser();

    const act = useCallback(
        (id: string, action: WorkflowAction, remarks: string, verified?: PayParticulars): ActResult => {
            const p = data.proposals.find((x) => x.id === id);
            if (!p) return { ok: false, error: "Proposal not found." };
            const meta = ACTION_META[action];
            if (STAGE_ROLE[p.status] !== user.roleKey || !ACTIONS_FOR[user.roleKey]?.includes(action))
                return { ok: false, error: STAGE_ROLE[p.status] ? "You are not authorised for the current stage of this proposal." : `Proposal is ${p.status}; this action is not allowed.` };
            if (meta.needsRemarks && remarks.trim().length < 10) return { ok: false, error: "Remarks (at least 10 characters) are mandatory to Reject or Return." };
            if (verified && data.config.rules.ruleEngine) {
                const mismatch = matrixMismatch(verified, data.config.payLevels);
                if (mismatch) return { ok: false, error: `Verified pay: ${mismatch}` };
            }

            const date = today();
            const closes = meta.status === "Approved" || meta.status === "Sanctioned";
            update((d) => {
                const r = d.proposals.find((x) => x.id === id)!;
                if (verified && (verified.basic !== r.proposed.basic || verified.level !== r.proposed.level || verified.cell !== r.proposed.cell)) r.verified = verified;
                r.status = meta.status;
                r.pendingWith = PENDING_WITH[meta.status];
                r.movement.push({ date, by: user.name, role: ROLE_STAGE[user.roleKey] ?? user.role, action: meta.log, remarks: remarks.trim() || "—" });
                if (closes || meta.status === "Rejected") r.decisionDate = date;
                if (closes) {
                    r.orderNo = `HE-PF-${r.id.slice(-4)}/${date.slice(0, 4)}`;
                    d.history.unshift(historyFromProposal(r));
                    // Approved pay becomes the officer's current pay.
                    const o = d.officers.find((x) => x.code === r.officerCode);
                    if (o) {
                        o.current = { ...(r.verified ?? r.proposed) };
                        if (r.nextIncrement && r.nextIncrement !== "—") o.nextIncrement = r.nextIncrement;
                    }
                }
            });
            addLog({ user: user.name, role: user.role, action: `${meta.log} proposal`, ref: id });
            notify(`${id} ${meta.log.toLowerCase()} by ${ROLE_STAGE[user.roleKey]}${meta.status === "Returned" || meta.status === "Rejected" ? ": " + remarks.trim() : ""}`);
            return { ok: true, status: meta.status };
        },
        [data, update, addLog, notify, user],
    );

    return { act, actions: ACTIONS_FOR[user.roleKey] ?? [], canEditPay: user.roleKey === "accounts" && data.config.rules.verifierCanEdit };
};
