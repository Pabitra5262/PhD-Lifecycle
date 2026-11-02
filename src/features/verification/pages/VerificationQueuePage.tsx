import { useState } from "react";
import { AlarmClock, ClipboardCheck, Inbox } from "lucide-react";
import { Badge, DataTable, SummaryTile, useAppNavigate, type TableColumnDef } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { ProposalStatusBadge, TabsCard, rupees, useCurrentUser, usePayFix, type Proposal } from "../../shared";
import { WorkflowSummaryTable } from "../components/WorkflowSummaryTable";
import { useVerificationQueue } from "../hooks/useVerificationQueue";

type Row = Proposal & { waitingDays: number };

const ROLE_ROW: Record<string, string> = {
    accounts: "Accounts / Establishment Officer",
    fo: "Finance Officer (FO)",
    dhe: "DHE / Competent Authority",
};

/** SRS 1.4 — Verification & Approval queue for the signed-in authority. */
const VerificationQueuePage = () => {
    const navigate = useAppNavigate();
    const { roleKey } = useCurrentUser();
    const { data } = usePayFix();
    const { pending, actioned, slaDays } = useVerificationQueue();
    const [tab, setTab] = useState("pending");
    const overdue = pending.filter((p) => p.waitingDays > slaDays).length;

    const columns: TableColumnDef<Row>[] = [
        { accessorKey: "id", header: "Proposal No.", Cell: ({ row }) => <strong className="whitespace-nowrap">{row.original.id}</strong> },
        {
            id: "officer",
            header: "Officer",
            accessorFn: (r) => r.officerName,
            Cell: ({ row }) => (
                <span>
                    <span className="block font-medium">{row.original.officerName}</span>
                    <span className="block text-xs text-muted-foreground">{row.original.officerCode} · {row.original.institution}</span>
                </span>
            ),
        },
        { accessorKey: "type", header: "Type" },
        { accessorKey: "event", header: "Event", hideBelow: "md" },
        { id: "pay", header: "Existing → Proposed", accessorFn: (r) => r.proposed.basic, align: "right", hideBelow: "lg", Cell: ({ row }) => <span className="whitespace-nowrap tabular-nums">{rupees(row.original.existing.basic)} → {rupees(row.original.proposed.basic)}</span> },
        { accessorKey: "status", header: "Status", Cell: ({ row }) => <ProposalStatusBadge status={row.original.status} /> },
        ...(tab === "pending"
            ? [
                  {
                      accessorKey: "waitingDays",
                      header: "Waiting",
                      align: "right" as const,
                      Cell: ({ row }: { row: { original: Row } }) =>
                          row.original.waitingDays > slaDays ? (
                              <Badge variant="danger" size="sm">{row.original.waitingDays} d · SLA</Badge>
                          ) : (
                              <span className="tabular-nums">{row.original.waitingDays} d</span>
                          ),
                  },
              ]
            : [{ accessorKey: "pendingWith", header: "Now With" }]),
    ];

    return (
        <>
            <PageHeader
                title="Verification & Approval"
                
            />

            <div className="mb-4 grid gap-4 sm:grid-cols-3">
                <SummaryTile icon={Inbox} label="Pending my action" value={pending.length} tone="info" onClick={() => setTab("pending")} selected={tab === "pending"} />
                <SummaryTile icon={AlarmClock} label={`Beyond SLA (${slaDays} days)`} value={overdue} tone={overdue ? "danger" : "neutral"} />
                <SummaryTile icon={ClipboardCheck} label="Actioned by me" value={actioned.length} tone="success" onClick={() => setTab("actioned")} selected={tab === "actioned"} />
            </div>

            <div className="flex flex-col gap-4">
                <TabsCard
                    className="w-full"
                    label="Queue"
                    activeTab={tab}
                    onChange={setTab}
                    tabs={[
                        { key: "pending", label: "Pending My Action", count: pending.length },
                        { key: "actioned", label: "Actioned", count: actioned.length },
                    ]}
                >
                    <DataTable
                        caption={tab === "pending" ? "Proposals pending my action" : "Proposals I have actioned"}
                        data={tab === "pending" ? pending : actioned}
                        columns={columns}
                        getRowId={(r) => r.id}
                        rowLabel={(r) => r.id}
                        searchPlaceholder="Search proposal no. or officer"
                        exportFileName="verification_queue"
                        emptyTitle={tab === "pending" ? "Nothing pending" : "No actions yet"}
                        emptyDescription={tab === "pending" ? "No proposals are waiting at your stage." : "Proposals you verify or decide appear here."}
                        renderPreview={null}
                        actions={{ onView: (r) => navigate(tab === "pending" ? `/verification/${r.id}` : `/proposals/${r.id}`) }}
                    />
                </TabsCard>
                <WorkflowSummaryTable stages={data.config.workflow} currentRole={ROLE_ROW[roleKey]} />
            </div>
        </>
    );
};

export default VerificationQueuePage;
