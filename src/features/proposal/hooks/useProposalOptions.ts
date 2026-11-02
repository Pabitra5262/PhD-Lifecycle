import { useMemo } from "react";
import { CADRES, DESIGNATIONS, EVENTS, INSTITUTIONS, PROPOSAL_TYPES, useCurrentUser, usePayFix } from "../../shared";

const opts = (values: string[]) => values.map((v) => ({ value: v, label: v }));

/** Dropdown master data for the Submit Proposal form. Officers are limited to what the role may submit for (E5). */
export const useProposalOptions = () => {
    const { data } = usePayFix();
    const { roleKey, officerCode, institution } = useCurrentUser();

    return useMemo(() => {
        const officers = data.officers.filter((o) => (roleKey === "officer" ? o.code === officerCode : o.institution === institution));
        return {
            officers,
            officerOptions: officers.map((o) => ({ value: o.code, label: `${o.name} (${o.code})` })),
            typeOptions: opts(PROPOSAL_TYPES),
            eventOptions: opts(EVENTS),
            cadreOptions: opts(CADRES),
            designationOptions: opts(DESIGNATIONS),
            institutionOptions: opts(INSTITUTIONS),
            levelOptions: data.config.payLevels.map((l) => ({ value: l.level, label: `${l.level} (entry ₹${l.entryPay.toLocaleString("en-IN")})` })),
            payLevels: data.config.payLevels,
            documents: data.config.documents,
            rules: data.config.rules,
        };
    }, [data.officers, data.config, roleKey, officerCode, institution]);
};
