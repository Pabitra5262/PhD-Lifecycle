import { useCallback } from "react";
import {
    CLOSED_OK,
    IN_PROCESS,
    INSTITUTIONS,
    STATUS_LABEL,
    daysBetween,
    payText,
    today,
    useCurrentUser,
    usePayFix,
    type Proposal,
    type ProposalStatus,
} from "../../shared";
import { REPORT_TYPES, type ReportColumn, type ReportFilters, type ReportResult, type ReportRow } from "../types/report.types";

const col = (accessorKey: string, header: string, align?: "right"): ReportColumn => ({ accessorKey, header, align });

/** Date the proposal reached a stage, from its movement history. */
const dateOf = (p: Proposal, action: string) => p.movement.find((m) => m.action.startsWith(action))?.date ?? "";

/** SRS 1.6 — compile the selected report from the proposals the role may see; access is audited. */
export const useReport = () => {
    const { data, addLog } = usePayFix();
    const user = useCurrentUser();

    const generate = useCallback(
        (f: ReportFilters): { ok: true; result: ReportResult } | { ok: false; error: string } => {
            if (!f.reportType) return { ok: false, error: "Select a report type." };
            if (!f.from || !f.to) return { ok: false, error: "Select the reporting period (From and To)." };
            if (f.from > f.to) return { ok: false, error: "Invalid date range: From date must be on or before To date." };

            const base = data.proposals.filter((p) => {
                const date = p.submittedDate !== "—" ? p.submittedDate : p.createdDate;
                return (
                    user.canSee(p) &&
                    p.status !== "Draft" &&
                    date >= f.from &&
                    date <= f.to &&
                    (!f.proposalType || p.type === f.proposalType) &&
                    (!f.status || p.status === f.status) &&
                    (!f.institution || p.institution === f.institution) &&
                    (!f.cadre || p.cadre === f.cadre)
                );
            });
            const now = today();
            let columns: ReportColumn[] = [];
            let rows: ReportRow[] = [];
            let summary: string | undefined;

            switch (f.reportType) {
                case "status": {
                    const statuses = (Object.keys(STATUS_LABEL) as ProposalStatus[]).filter((s) => s !== "Draft");
                    columns = [col("status", "Status"), col("fixation", "Pay Fixation", "right"), col("protection", "Pay Protection", "right"), col("total", "Total", "right")];
                    rows = statuses.map((s) => {
                        const ofStatus = base.filter((p) => p.status === s);
                        return { status: STATUS_LABEL[s], fixation: ofStatus.filter((p) => p.type === "Pay Fixation").length, protection: ofStatus.filter((p) => p.type === "Pay Protection").length, total: ofStatus.length };
                    });
                    summary = `Total proposals: ${base.length}`;
                    break;
                }
                case "pending": {
                    columns = [col("id", "Proposal No."), col("officer", "Officer"), col("type", "Type"), col("pendingWith", "Pending With"), col("since", "Pending Since"), col("days", "Days Pending", "right")];
                    rows = base
                        .filter((p) => IN_PROCESS.includes(p.status) || p.status === "Returned")
                        .map((p) => {
                            const since = p.movement.at(-1)?.date ?? p.submittedDate;
                            return { id: p.id, officer: `${p.officerName} (${p.officerCode})`, type: p.type, pendingWith: p.pendingWith, since, days: daysBetween(since, now) };
                        })
                        .sort((a, b) => String(a.pendingWith).localeCompare(String(b.pendingWith)) || Number(b.days) - Number(a.days));
                    const by = ["Accounts / Establishment", "Finance Officer", "Competent Authority", "Initiator"].map((w) => `${w}: ${rows.filter((r) => r.pendingWith === w).length}`);
                    summary = by.join(" · ");
                    break;
                }
                case "timeline": {
                    const sla = Object.fromEntries(data.config.workflow.map((w) => [w.order, w.slaDays]));
                    columns = [col("id", "Proposal No."), col("officer", "Officer"), col("submitted", "Submitted"), col("atAccounts", "Days at Accounts", "right"), col("atFo", "Days at FO", "right"), col("atCa", "Days at CA", "right"), col("total", "Total Days", "right"), col("sla", "SLA")];
                    rows = base.map((p) => {
                        const verified = dateOf(p, "Verified");
                        const forwarded = dateOf(p, "Forwarded");
                        const end = p.decisionDate !== "—" ? p.decisionDate : now;
                        const atAccounts = daysBetween(p.submittedDate, verified || (p.status === "Submitted" ? now : end));
                        const atFo = verified ? daysBetween(verified, forwarded || end) : 0;
                        const atCa = forwarded ? daysBetween(forwarded, end) : 0;
                        const breached = atAccounts > sla[2] || atFo > sla[3] || atCa > sla[4];
                        return { id: p.id, officer: p.officerName, submitted: p.submittedDate, atAccounts, atFo, atCa, total: daysBetween(p.submittedDate, end), sla: breached ? "Delayed" : "Within SLA" };
                    });
                    const avg = rows.length ? Math.round(rows.reduce((n, r) => n + Number(r.total), 0) / rows.length) : 0;
                    summary = `Average processing time: ${avg} days · Delayed: ${rows.filter((r) => r.sla === "Delayed").length} of ${rows.length}`;
                    break;
                }
                case "approved": {
                    columns = [col("id", "Proposal No."), col("officer", "Officer"), col("type", "Type"), col("event", "Event"), col("existing", "Existing Pay"), col("approved", "Approved Pay"), col("orderNo", "Order No."), col("date", "Decision Date"), col("status", "Status")];
                    rows = base
                        .filter((p) => CLOSED_OK.includes(p.status))
                        .map((p) => ({ id: p.id, officer: `${p.officerName} (${p.officerCode})`, type: p.type, event: p.event, existing: payText(p.existing), approved: payText(p.verified ?? p.proposed), orderNo: p.orderNo, date: p.decisionDate, status: STATUS_LABEL[p.status] }));
                    summary = `Approved / sanctioned: ${rows.length}`;
                    break;
                }
                case "rejected": {
                    columns = [col("id", "Proposal No."), col("officer", "Officer"), col("type", "Type"), col("status", "Status"), col("by", "Decided By"), col("date", "Date"), col("remarks", "Remarks")];
                    rows = base
                        .filter((p) => p.status === "Rejected" || p.status === "Returned")
                        .map((p) => {
                            const last = p.movement.at(-1);
                            return { id: p.id, officer: p.officerName, type: p.type, status: STATUS_LABEL[p.status], by: last?.role ?? "", date: last?.date ?? "", remarks: last?.remarks ?? "" };
                        });
                    summary = `Rejected: ${rows.filter((r) => r.status === "Rejected").length} · Returned: ${rows.filter((r) => r.status === "Returned").length}`;
                    break;
                }
                case "history": {
                    const officers = new Map(data.officers.map((o) => [o.code, o]));
                    columns = [col("officer", "Officer"), col("institution", "Institution"), col("effective", "Effective Date"), col("type", "Type"), col("event", "Event"), col("from", "From"), col("to", "To"), col("orderNo", "Order Reference")];
                    rows = data.history
                        .filter((h) => {
                            const o = officers.get(h.officerCode);
                            return (
                                !!o &&
                                h.effectiveDate >= f.from &&
                                h.effectiveDate <= f.to &&
                                (!f.proposalType || h.type === f.proposalType) &&
                                (!f.institution || o.institution === f.institution) &&
                                (!f.cadre || o.cadre === f.cadre) &&
                                (user.roleKey !== "college" || o.institution === user.institution)
                            );
                        })
                        .sort((a, b) => a.officerCode.localeCompare(b.officerCode) || b.effectiveDate.localeCompare(a.effectiveDate))
                        .map((h) => {
                            const o = officers.get(h.officerCode)!;
                            return { officer: `${o.name} (${o.code})`, institution: o.institution, effective: h.effectiveDate, type: h.type, event: h.event, from: h.from.basic ? payText(h.from) : "—", to: payText(h.to), orderNo: h.orderNo };
                        });
                    summary = `Decisions: ${rows.length}`;
                    break;
                }
                case "institution": {
                    columns = [col("institution", "Institution"), col("total", "Total", "right"), col("process", "In Process", "right"), col("approved", "Approved / Sanctioned", "right"), col("returned", "Returned / Rejected", "right"), col("avg", "Avg. Days", "right")];
                    rows = INSTITUTIONS.map((inst) => {
                        const r = base.filter((p) => p.institution === inst);
                        const decided = r.filter((p) => p.decisionDate !== "—");
                        return {
                            institution: inst,
                            total: r.length,
                            process: r.filter((p) => IN_PROCESS.includes(p.status)).length,
                            approved: r.filter((p) => CLOSED_OK.includes(p.status)).length,
                            returned: r.filter((p) => p.status === "Returned" || p.status === "Rejected").length,
                            avg: decided.length ? Math.round(decided.reduce((n, p) => n + daysBetween(p.submittedDate, p.decisionDate), 0) / decided.length) : "—",
                        };
                    }).filter((r) => r.total > 0);
                    summary = `Institutions: ${rows.length} · Proposals: ${base.length}`;
                    break;
                }
            }

            const title = REPORT_TYPES.find((r) => r.value === f.reportType)!.label;
            addLog({ user: user.name, role: user.role, action: `Generated report: ${title}`, ref: `${f.from} to ${f.to}` });
            return { ok: true, result: { title, columns, rows, summary, generatedAt: new Date().toLocaleString("en-IN") } };
        },
        [data, addLog, user],
    );

    const logExport = useCallback((title: string, format: string) => addLog({ user: user.name, role: user.role, action: `Exported report (${format}): ${title}`, ref: "—" }), [addLog, user]);

    return { generate, logExport };
};
