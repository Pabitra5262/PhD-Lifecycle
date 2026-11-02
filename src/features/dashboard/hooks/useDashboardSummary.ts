import { useMemo } from "react";
import { CLOSED_OK, STATUS_LABEL, daysBetween, useCurrentUser, usePayFix, type Proposal, type ProposalStatus } from "../../shared";

export type Period = "all" | "month" | "quarter" | "fy" | "year";

export interface DashboardFilters {
    period: Period;
    cadre: string;
    institution: string;
}

export const PERIODS: { value: Period; label: string }[] = [
    { value: "all", label: "All time" },
    { value: "month", label: "Last 30 days" },
    { value: "quarter", label: "Last 3 months" },
    { value: "fy", label: "This financial year" },
    { value: "year", label: "This calendar year" },
];

const periodStart = (period: Period): string => {
    const now = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    switch (period) {
        case "month":
            return iso(new Date(now.getTime() - 30 * 86_400_000));
        case "quarter":
            return iso(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()));
        case "fy":
            return `${now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1}-04-01`;
        case "year":
            return `${now.getFullYear()}-01-01`;
        default:
            return "";
    }
};

/** SRS 1.1 dashboard widgets: counters by status and average processing days, for the role's visible proposals. */
export const useDashboardSummary = (filters: DashboardFilters) => {
    const { data } = usePayFix();
    const { canSee } = useCurrentUser();

    return useMemo(() => {
        const from = periodStart(filters.period);
        const rows = data.proposals.filter(
            (p) =>
                canSee(p) &&
                (!filters.cadre || p.cadre === filters.cadre) &&
                (!filters.institution || p.institution === filters.institution) &&
                (!from || p.createdDate >= from),
        );
        const count = (...s: ProposalStatus[]) => rows.filter((p) => s.includes(p.status)).length;
        const decided = rows.filter((p) => p.decisionDate !== "—" && p.submittedDate !== "—");
        const avgDays = decided.length ? Math.round(decided.reduce((n, p) => n + daysBetween(p.submittedDate, p.decisionDate), 0) / decided.length) : 0;

        const byStatus = (Object.keys(STATUS_LABEL) as ProposalStatus[])
            .map((s) => ({ status: s, label: STATUS_LABEL[s], value: count(s) }))
            .filter((x) => x.value > 0);
        const pendingWith = ["Accounts / Establishment", "Finance Officer", "Competent Authority", "Initiator"].map((who) => ({
            who,
            value: rows.filter((p) => p.pendingWith === who).length,
        }));
        const recent = [...rows].sort((a, b) => (b.movement.at(-1)?.date ?? "").localeCompare(a.movement.at(-1)?.date ?? "")).slice(0, 6);

        return {
            rows,
            counters: {
                total: rows.length,
                draft: count("Draft"),
                verification: count("Submitted"),
                approval: count("Verified", "Forwarded"),
                approved: count(...CLOSED_OK),
                rejected: count("Rejected", "Returned"),
                avgDays,
            },
            byStatus,
            pendingWith,
            recent: recent as Proposal[],
            approvedValue: rows.filter((p) => CLOSED_OK.includes(p.status)).reduce((n, p) => n + ((p.verified ?? p.proposed).basic - p.existing.basic), 0),
        };
    }, [data.proposals, canSee, filters]);
};
