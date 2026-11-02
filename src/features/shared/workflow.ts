import type { PayLevel, PayParticulars, Proposal, ProposalStatus } from "./types/payfix.types";
import type { RoleKey } from "./roles";

/* Workflow and pay-matrix rules shared by every Pay Fixation page. */

/** Who the proposal waits on at each status (SRS 1.4 Workflow Summary). */
export const PENDING_WITH: Record<ProposalStatus, string> = {
    Draft: "Initiator",
    Submitted: "Accounts / Establishment",
    Verified: "Finance Officer",
    Forwarded: "Competent Authority",
    Approved: "—",
    Sanctioned: "—",
    Returned: "Initiator",
    Rejected: "—",
};

/** The role that acts on a proposal at this status in the Verification & Approval queue. */
export const STAGE_ROLE: Partial<Record<ProposalStatus, RoleKey>> = {
    Submitted: "accounts",
    Verified: "fo",
    Forwarded: "dhe",
};

export const OPEN_STATUSES: ProposalStatus[] = ["Draft", "Submitted", "Verified", "Forwarded", "Returned"];
export const IN_PROCESS: ProposalStatus[] = ["Submitted", "Verified", "Forwarded"];
export const CLOSED_OK: ProposalStatus[] = ["Approved", "Sanctioned"];
export const CLOSED_NOT_OK: ProposalStatus[] = ["Rejected", "Returned"];

/** Status names in lists and tags: "Submitted" reads as "Under Verification" once it sits with Accounts. */
export const STATUS_LABEL: Record<ProposalStatus, string> = {
    Draft: "Draft",
    Submitted: "Under Verification",
    Verified: "Pending Approval",
    Forwarded: "Pending Sanction",
    Approved: "Approved",
    Sanctioned: "Sanctioned",
    Returned: "Returned",
    Rejected: "Rejected",
};

/** Initiator may edit a Draft or a Returned proposal. */
export const isEditable = (p: Proposal) => p.status === "Draft" || p.status === "Returned";

/* ---- Pay matrix ---------------------------------------------------------- */

/** Basic pay at a cell: entry pay, then +3 % per cell rounded to the nearest ₹100 (7th CPC / ORSP matrix). */
export const payAt = (level: PayLevel | undefined, cell: number): number => {
    if (!level || cell < 1) return 0;
    let pay = level.entryPay;
    for (let i = 1; i < cell; i++) pay = Math.round((pay * 1.03) / 100) * 100;
    return pay;
};

/** First cell of the level whose pay is at least `amount` (the cell pay is fixed in). */
export const cellAtOrAbove = (level: PayLevel, amount: number): number => {
    for (let c = 1; c <= level.cells; c++) if (payAt(level, c) >= amount) return c;
    return level.cells;
};

/**
 * Suggested proposed pay:
 *  Pay Fixation (promotion)  — one notional increment in the present level, then the next cell ≥ that in the new level.
 *  Pay Protection            — the first cell in the new level ≥ the last pay drawn.
 */
export const suggestPay = (type: Proposal["type"], existing: PayParticulars, newLevel: PayLevel, levels: PayLevel[]): PayParticulars => {
    const current = levels.find((l) => l.level === existing.level);
    const base = type === "Pay Fixation" && current ? payAt(current, existing.cell + 1) || existing.basic : existing.basic;
    const cell = cellAtOrAbove(newLevel, base);
    return { level: newLevel.level, cell, basic: payAt(newLevel, cell) };
};

/** E2: proposed basic must match the matrix value of the chosen level / cell. */
export const matrixMismatch = (p: PayParticulars, levels: PayLevel[]): string | null => {
    const level = levels.find((l) => l.level === p.level);
    if (!level) return "Select a pay level.";
    if (p.cell < 1 || p.cell > level.cells) return `Cell must be between 1 and ${level.cells} for ${level.level}.`;
    const expected = payAt(level, p.cell);
    return expected === p.basic ? null : `Basic pay for ${p.level} cell ${p.cell} is ₹${expected.toLocaleString("en-IN")} as per the pay matrix.`;
};

export const rupees = (n: number | undefined) => (n ? `₹${n.toLocaleString("en-IN")}` : "—");
export const payText = (p?: PayParticulars) => (p ? `${rupees(p.basic)} · ${p.level} · Cell ${p.cell}` : "—");

/** Days between two yyyy-mm-dd dates (0 when either is missing). */
export const daysBetween = (from: string, to: string) => {
    if (!from || !to || from === "—" || to === "—") return 0;
    return Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000));
};

export const today = () => new Date().toISOString().slice(0, 10);
