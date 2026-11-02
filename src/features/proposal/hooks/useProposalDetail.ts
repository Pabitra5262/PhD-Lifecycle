import { useCurrentUser, usePayFix } from "../../shared";

/** One proposal by number; `forbidden` when it exists but the role has no view rights (E2). */
export const useProposalDetail = (id: string | undefined) => {
    const { data } = usePayFix();
    const { canSee } = useCurrentUser();
    const proposal = data.proposals.find((p) => p.id === id);
    return { proposal: proposal && canSee(proposal) ? proposal : undefined, forbidden: !!proposal && !canSee(proposal) };
};
