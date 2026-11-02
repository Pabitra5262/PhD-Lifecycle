import { useMemo } from "react";
import { PENDING_WITH, STAGE_ROLE, daysBetween, today, useCurrentUser, usePayFix, type ProposalStatus } from "../../shared";

/** Proposals waiting at the signed-in role's stage, and the ones this user has already acted on. */
export const useVerificationQueue = () => {
    const { data } = usePayFix();
    const { roleKey } = useCurrentUser();

    return useMemo(() => {
        const pending = data.proposals
            .filter((p) => STAGE_ROLE[p.status] === roleKey)
            .map((p) => {
                const arrived = p.movement.at(-1)?.date ?? p.submittedDate;
                return { ...p, waitingDays: daysBetween(arrived, today()) };
            })
            .sort((a, b) => b.waitingDays - a.waitingDays);
        // The stage this role works at, e.g. "Finance Officer" (movement entries carry it as their role).
        const stageStatus = (Object.keys(STAGE_ROLE) as ProposalStatus[]).find((s) => STAGE_ROLE[s] === roleKey);
        const stageLabel = stageStatus ? PENDING_WITH[stageStatus] : "";
        const actioned = data.proposals
            .filter((p) => p.status !== stageStatus && p.movement.some((m) => m.role === stageLabel))
            .map((p) => ({ ...p, waitingDays: 0 }));
        const stage = data.config.workflow.find((w) => w.order === { accounts: 2, fo: 3, dhe: 4 }[roleKey as "accounts" | "fo" | "dhe"]);
        return { pending, actioned, slaDays: stage?.slaDays ?? 7 };
    }, [data.proposals, data.config.workflow, roleKey]);
};
