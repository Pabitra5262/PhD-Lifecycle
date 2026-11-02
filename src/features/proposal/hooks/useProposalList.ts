import { useMemo } from "react";
import { CLOSED_OK, IN_PROCESS, useCurrentUser, usePayFix, type Proposal } from "../../shared";
import type { ProposalGroup, ProposalRow } from "../types/proposal.types";

const IN_GROUP: Record<ProposalGroup, (p: Proposal) => boolean> = {
    all: () => true,
    draft: (p) => p.status === "Draft",
    process: (p) => IN_PROCESS.includes(p.status),
    closed: (p) => CLOSED_OK.includes(p.status),
    returned: (p) => p.status === "Returned" || p.status === "Rejected",
};

const QUARTERS = ["Jan–Mar", "Apr–Jun", "Jul–Sep", "Oct–Dec"];

/** Reporting period of a proposal (quarter of submission, or of creation for drafts), e.g. "Jul–Sep 2026". */
export const periodOf = (p: Proposal) => {
    const date = p.submittedDate !== "—" ? p.submittedDate : p.createdDate;
    return `${QUARTERS[Math.floor((Number(date.slice(5, 7)) - 1) / 3)]} ${date.slice(0, 4)}`;
};

/**
 * Proposals the signed-in role may view (SRS 1.3) for the chosen status tab, with a count per tab.
 * Status / Type / Period / Institution filters run in the table's filter panel (`filterFields`).
 */
export const useProposalList = (group: ProposalGroup) => {
    const { data } = usePayFix();
    const { canSee } = useCurrentUser();

    return useMemo(() => {
        const visible: ProposalRow[] = data.proposals.filter(canSee).map((p) => ({ ...p, period: periodOf(p) }));
        const counts = Object.fromEntries((Object.keys(IN_GROUP) as ProposalGroup[]).map((g) => [g, visible.filter(IN_GROUP[g]).length])) as Record<ProposalGroup, number>;
        // Newest period first in the Period dropdown.
        const periods = [...new Set(visible.map((p) => p.period))].sort((a, b) => b.slice(-4).localeCompare(a.slice(-4)) || QUARTERS.indexOf(b.slice(0, 7)) - QUARTERS.indexOf(a.slice(0, 7)));
        return { rows: visible.filter(IN_GROUP[group]), counts, periods };
    }, [data.proposals, canSee, group]);
};
