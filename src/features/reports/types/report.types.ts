import type { ProposalStatus, ProposalType } from "../../shared";

/** SRS 1.6 Available Report Types. */
export type ReportType = "status" | "pending" | "timeline" | "approved" | "rejected" | "history" | "institution";

export const REPORT_TYPES: { value: ReportType; label: string }[] = [
    { value: "status", label: "Proposal Status Summary Report" },
    { value: "pending", label: "Pending Proposals by Authority Report" },
    { value: "timeline", label: "Processing Timeline / Delay Analysis Report" },
    { value: "approved", label: "Approved / Sanctioned Proposals Report" },
    { value: "rejected", label: "Rejected / Returned Proposals Report" },
    { value: "history", label: "Officer-wise Pay Fixation / Protection History Report" },
    { value: "institution", label: "Institution / Cadre-wise Activity Report" },
];

export interface ReportFilters {
    reportType: ReportType | "";
    proposalType: ProposalType | "";
    status: ProposalStatus | "";
    from: string;
    to: string;
    institution: string;
    cadre: string;
}

export type ReportRow = Record<string, string | number>;

export interface ReportColumn {
    accessorKey: string;
    header: string;
    align?: "left" | "right";
}

export interface ReportResult {
    title: string;
    columns: ReportColumn[];
    rows: ReportRow[];
    /** Totals line under the table (e.g. counts). */
    summary?: string;
    generatedAt: string;
}
