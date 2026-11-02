import { useMemo } from "react";
import { OPEN_STATUSES, useCurrentUser, usePayFix } from "../../shared";

/** SRS 1.5 — officers the role may look up, and the selected officer's decisions (read-only). */
export const useOfficerHistory = (officerCode: string) => {
    const { data } = usePayFix();
    const { roleKey, officerCode: ownCode } = useCurrentUser();

    return useMemo(() => {
        // OES Officer: own record only.
        const officers = roleKey === "officer" ? data.officers.filter((o) => o.code === ownCode) : data.officers;
        const officer = officers.find((o) => o.code === officerCode);
        const records = officer ? data.history.filter((h) => h.officerCode === officer.code).sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate)) : [];
        const open = officer ? data.proposals.filter((p) => p.officerCode === officer.code && OPEN_STATUSES.includes(p.status) && p.status !== "Draft") : [];
        return {
            officers,
            officerOptions: officers.map((o) => ({ value: o.code, label: `${o.name} (${o.code}) — ${o.institution}` })),
            officer,
            records,
            open,
            proposalOf: (id: string) => data.proposals.find((p) => p.id === id),
            locked: roleKey === "officer",
        };
    }, [data.officers, data.history, data.proposals, roleKey, ownCode, officerCode]);
};
