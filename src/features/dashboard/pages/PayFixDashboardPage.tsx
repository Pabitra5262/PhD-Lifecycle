import { useState } from "react";
import { CircleCheck, ClipboardCheck, FilePen, Files, Hourglass, IndianRupee, Timer, Undo2 } from "lucide-react";
import { Alert, Button, Card, CardBody, DataTable, KpiCard, Progress, Select, useAppNavigate, type TableColumnDef } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { CADRES, DemoRoleSwitcher, INSTITUTIONS, ProposalStatusBadge, STAGE_ROLE, canOpen, rupees, useCurrentUser, usePayFix, type Proposal } from "../../shared";
import { PERIODS, useDashboardSummary, type DashboardFilters } from "../hooks/useDashboardSummary";

const all = (values: string[], label: string) => [{ value: "", label }, ...values.map((v) => ({ value: v, label: v }))];

const recentColumns: TableColumnDef<Proposal>[] = [
    { accessorKey: "id", header: "Proposal No.", Cell: ({ row }) => <strong className="whitespace-nowrap">{row.original.id}</strong> },
    { accessorKey: "officerName", header: "Officer" },
    { accessorKey: "type", header: "Type", hideBelow: "md" },
    { accessorKey: "status", header: "Status", Cell: ({ row }) => <ProposalStatusBadge status={row.original.status} /> },
    { accessorKey: "pendingWith", header: "Pending With", hideBelow: "lg" },
    { id: "updated", header: "Last Action", accessorFn: (r) => r.movement.at(-1)?.date ?? "", hideBelow: "md" },
];

/** SRS 1.1 — Pay Fixation / Protection Dashboard. */
const PayFixDashboardPage = () => {
    const navigate = useAppNavigate();
    const { role, roleKey, officerCode } = useCurrentUser();
    const { data } = usePayFix();
    const [filters, setFilters] = useState<DashboardFilters>({ period: "all", cadre: "", institution: "" });
    const { counters: c, byStatus, pendingWith, recent, approvedValue } = useDashboardSummary(filters);
    const myPending = data.proposals.filter((p) => STAGE_ROLE[p.status] === roleKey).length;
    const me = officerCode ? data.officers.find((o) => o.code === officerCode) : undefined;
    const drill = (status: string) => navigate(`/proposals?status=${status}`);
    const isFiltered = filters.period !== "all" || filters.cadre || filters.institution;

    return (
        <>
            <PageHeader
                title="Pay Fixation & Protection Dashboard"
                
                actions={
                    <div className="flex flex-wrap items-end gap-2">
                        <DemoRoleSwitcher />
                        {canOpen(role, "verification") && (
                            <Button variant={myPending ? "primary" : "outline"} icon={<ClipboardCheck size={16} />} label={`Pending my action (${myPending})`} onClick={() => navigate("/verification")} />
                        )}
                    </div>
                }
            />

            <Card className="mb-4">
                <CardBody>
                    <div className="flex flex-wrap items-end gap-3">
                        <Select label="Period" options={PERIODS} value={filters.period} onChange={(v) => setFilters((f) => ({ ...f, period: v as DashboardFilters["period"] }))} wrapperClassName="w-48" />
                        <Select label="Cadre" options={all(CADRES, "All cadres")} value={filters.cadre} onChange={(v) => setFilters((f) => ({ ...f, cadre: String(v) }))} wrapperClassName="w-56" />
                        {roleKey !== "officer" && roleKey !== "college" && (
                            <Select label="Institution" options={all(INSTITUTIONS, "All institutions")} value={filters.institution} onChange={(v) => setFilters((f) => ({ ...f, institution: String(v) }))} wrapperClassName="w-72" />
                        )}
                        {isFiltered && <Button variant="ghost" size="sm" label="Clear filters" onClick={() => setFilters({ period: "all", cadre: "", institution: "" })} />}
                    </div>
                </CardBody>
            </Card>

            {c.total === 0 && (
                <Alert tone="info" className="mb-4" title="No data available">
                    No proposals match the selected period / cadre / institution.
                </Alert>
            )}

            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard label="Total Proposals" value={c.total} note="All pay fixation / protection" icon={Files} onClick={() => drill("all")} />
                <KpiCard label="Pending Submission / Draft" value={c.draft} note="Not yet submitted" icon={FilePen} tone="neutral" onClick={() => drill("draft")} />
                <KpiCard label="Under Verification" value={c.verification} note="At Accounts / Establishment" icon={Hourglass} tone="info" onClick={() => drill("process")} />
                <KpiCard label="Pending Approval" value={c.approval} note="At FO / Competent Authority" icon={Timer} tone="warning" onClick={() => drill("process")} />
                <KpiCard label="Approved / Sanctioned" value={c.approved} note="Orders issued" icon={CircleCheck} tone="success" onClick={() => drill("closed")} />
                <KpiCard label="Rejected / Returned" value={c.rejected} note="Rejected or returned for correction" icon={Undo2} tone="danger" onClick={() => drill("returned")} />
                <KpiCard label="Avg. Processing Days" value={c.avgDays} note="Submission to decision" icon={Timer} tone="primary" />
                {me ? (
                    <KpiCard label="My Current Basic Pay" value={rupees(me.current.basic)} note={`${me.current.level} · Cell ${me.current.cell} · next increment ${me.nextIncrement}`} icon={IndianRupee} tone="success" />
                ) : (
                    <KpiCard label="Monthly Impact Approved" value={`₹${approvedValue.toLocaleString("en-IN")}`} note="Increase in basic, approved cases" icon={IndianRupee} tone="success" />
                )}
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <Card title="Proposals by Status">
                    {byStatus.length ? (
                        <div className="flex flex-col gap-3">
                            {byStatus.map((s) => (
                                <Progress key={s.status} label={s.label} value={s.value} max={c.total} count={s.value} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No proposals.</p>
                    )}
                </Card>
                <Card title="Pending With (by authority)">
                    <div className="flex flex-col gap-3">
                        {pendingWith.map((p) => (
                            <Progress key={p.who} label={p.who} value={p.value} max={Math.max(1, ...pendingWith.map((x) => x.value))} count={p.value} tone="warning" />
                        ))}
                    </div>
                </Card>
            </div>

            <DataTable
                caption="Recent Activity"
                data={recent}
                columns={recentColumns}
                getRowId={(r) => r.id}
                renderPreview={null}
                allowFullscreen={false}
                exportFileName="recent_proposals"
                emptyTitle="No recent activity"
                actions={{ onView: (r) => navigate(`/proposals/${r.id}`) }}
                toolbarActions={<Button variant="outline" size="sm" label="View all proposals" onClick={() => navigate("/proposals")} />}
            />
        </>
    );
};

export default PayFixDashboardPage;
