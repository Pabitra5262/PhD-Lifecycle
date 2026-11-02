import { useState } from "react";
import { useParams } from "react-router-dom";
import { ClipboardCheck, FileText, FileClock, Paperclip, Pencil, Printer } from "lucide-react";
import { Button, Card, useAppNavigate } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import {
    DocumentList,
    MovementHistory,
    ProposalStatusBadge,
    ProposalSummary,
    STAGE_ROLE,
    TabsCard,
    WorkflowTrack,
    canOpen,
    isEditable,
    useCurrentUser,
} from "../../shared";
import { useProposalDetail } from "../hooks/useProposalDetail";

const TABS = [
    { key: "summary", label: "Summary & Pay", icon: FileText },
    { key: "documents", label: "Documents", icon: Paperclip },
    { key: "movement", label: "Remarks & Movement", icon: FileClock },
];

/** SRS 1.3 — proposal detail: pay particulars, documents, remarks and movement history; allowed actions by role. */
const ProposalDetailPage = () => {
    const navigate = useAppNavigate();
    const { proposalId } = useParams();
    const { proposal: p, forbidden } = useProposalDetail(proposalId);
    const { role, roleKey } = useCurrentUser();
    const [tab, setTab] = useState("summary");

    if (!p) {
        return (
            <>
                <PageHeader title="Proposal"  />
                <Card title={forbidden ? "Not authorised" : "Proposal not found"}>
                    <p className="text-sm">{forbidden ? "You are not authorised to view this proposal." : `No proposal with number ${proposalId} exists.`}</p>
                    <Button className="mt-4" action="back" label="Back to proposals" onClick={() => navigate("/proposals")} />
                </Card>
            </>
        );
    }

    const canAct = STAGE_ROLE[p.status] === roleKey;
    const canEdit = canOpen(role, "submit") && isEditable(p);

    return (
        <>
            <PageHeader
                title={`Proposal ${p.id}`}
                
                actions={
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" icon={<Printer size={16} />} label="Print" onClick={() => window.print()} />
                        {canEdit && <Button variant="secondary" icon={<Pencil size={16} />} label={p.status === "Returned" ? "Correct & Re-submit" : "Edit Draft"} onClick={() => navigate(`/proposals/${p.id}/edit`)} />}
                        {canAct && <Button icon={<ClipboardCheck size={16} />} label="Take Action" onClick={() => navigate(`/verification/${p.id}`)} />}
                    </div>
                }
            />

            <Card className="mb-4" title="Workflow Status" actions={<ProposalStatusBadge status={p.status} />}>
                <WorkflowTrack status={p.status} />
                <p className="mt-3 text-sm text-muted-foreground">
                    Pending with: <strong className="text-foreground">{p.pendingWith}</strong>
                    {p.orderNo !== "—" && (
                        <>
                            {" "}· Order No.: <strong className="text-foreground">{p.orderNo}</strong> dated {p.decisionDate}
                        </>
                    )}
                </p>
            </Card>

            <TabsCard label="Proposal sections" activeTab={tab} onChange={setTab} tabs={TABS.map((t) => (t.key === "documents" ? { ...t, count: p.documents.length } : t))}>
                {tab === "summary" && <ProposalSummary proposal={p} showDocuments={false} />}
                {tab === "documents" && (
                    <Card title="Supporting Documents">
                        <DocumentList proposal={p} />
                    </Card>
                )}
                {tab === "movement" && (
                    <Card title="Remarks & Movement History">
                        <MovementHistory items={p.movement} />
                    </Card>
                )}
            </TabsCard>
        </>
    );
};

export default ProposalDetailPage;
