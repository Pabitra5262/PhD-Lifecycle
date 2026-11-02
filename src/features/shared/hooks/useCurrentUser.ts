import { useMemo } from "react";
import { CURRENT_USER } from "../data/payfixData";
import { useRole } from "../store/PayFixStore";
import type { Proposal } from "../types/payfix.types";

/** Signed-in user for the active role, and which proposals that user may see (SRS: "view rights"). */
export const useCurrentUser = () => {
    const { role, roleKey } = useRole();
    return useMemo(() => {
        const user = CURRENT_USER[roleKey];
        const canSee = (p: Proposal) => {
            if (roleKey === "officer") return p.officerCode === user.officerCode;
            if (roleKey === "college") return p.institution === user.institution;
            // Approving authorities never see another initiator's unsubmitted drafts.
            return p.status !== "Draft";
        };
        return { role, roleKey, name: user.name, officerCode: user.officerCode, institution: user.institution, canSee };
    }, [role, roleKey]);
};
