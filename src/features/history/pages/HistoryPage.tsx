import { useState } from "react";
import { ExternalLink, Lock } from "lucide-react";
import { Button, Card, CardBody, Modal, ModalFooter, Select, useAppNavigate } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { Fields, PanelCard, PayComparison, ProposalStatusBadge, payText, useCurrentUser, type HistoryRecord } from "../../shared";
import { HistoryGrid } from "../components/HistoryGrid";
import { useOfficerHistory } from "../hooks/useOfficerHistory";

/** SRS 1.5 — View Pay Fixation / Protection History (read-only: nothing is modified here). */
const HistoryPage = () => {
    const navigate = useAppNavigate();
    const { officerCode: ownCode, roleKey } = useCurrentUser();
    const [code, setCode] = useState(roleKey === "officer" ? (ownCode ?? "") : "");
    const { officerOptions, officer, records, open, proposalOf, locked } = useOfficerHistory(code);
    const [viewing, setViewing] = useState<HistoryRecord | null>(null);
    const linked = viewing && viewing.proposalId !== "Legacy" ? proposalOf(viewing.proposalId) : undefined;

    return (
        <>
            <PageHeader
                title="History / Revisions"
                
            />

            <Card className="mb-4" title="Officer Search">
                <div className="flex flex-wrap items-end gap-3">
                    <Select
                        label="Officer (name or employee code)"
                        placeholder="Search officer"
                        options={officerOptions}
                        value={code}
                        onChange={(v) => setCode(String(v))}
                        readOnly={locked}
                        wrapperClassName="w-full max-w-xl"
                        helpText={locked ? "OES Officers can view their own record only." : undefined}
                    />
                </div>
            </Card>

            {!officer ? (
                <Card>
                    <CardBody>
                        <p className="text-sm text-muted-foreground">Search and select an officer to view the pay fixation / protection history.</p>
                    </CardBody>
                </Card>
            ) : (
                <>
                    <PanelCard title={officer.name} actions={<span className="flex items-center gap-1 text-xs text-muted-foreground"><Lock size={12} /> Read-only</span>}>
                        <Fields
                            cols={4}
                            items={[
                                { label: "Cadre", value: officer.cadre },
                                { label: "Institution", value: officer.institution },
                                { label: "Date of Joining", value: officer.dateOfJoining },
                                { label: "Current Pay", value: payText(officer.current) },
                                { label: "Next Increment", value: officer.nextIncrement },
                                { label: "Decisions on record", value: records.length },
                                {
                                    label: "Open proposals",
                                    value: open.length ? (
                                        <span className="flex flex-wrap gap-2">
                                            {open.map((p) => (
                                                <button key={p.id} type="button" className="text-primary underline-offset-2 hover:underline" onClick={() => navigate(`/proposals/${p.id}`)}>
                                                    {p.id}
                                                </button>
                                            ))}
                                        </span>
                                    ) : (
                                        "None"
                                    ),
                                },
                            ]}
                        />
                        {/* History list inside the officer card. */}
                        <div className="mt-6">
                            <HistoryGrid rows={records} officerName={officer.name} onOpen={setViewing} />
                        </div>
                    </PanelCard>
                </>
            )}

            <Modal
                isOpen={!!viewing}
                onClose={() => setViewing(null)}
                size="3xl"
                title={viewing ? `Revision Details — ${viewing.event} (${viewing.effectiveDate})` : ""}
                footer={
                    <ModalFooter onClose={() => setViewing(null)} cancelText="Close" showConfirm={!!linked} confirmText="Open full proposal" onConfirm={() => linked && navigate(`/proposals/${linked.id}`)} />
                }
            >
                {viewing && (
                    <div className="flex flex-col gap-5">
                        <Fields
                            items={[
                                { label: "Proposal No.", value: viewing.proposalId === "Legacy" ? "Legacy record (pre-system)" : viewing.proposalId },
                                { label: "Type", value: viewing.type },
                                { label: "Event", value: viewing.event },
                                { label: "Effective Date", value: viewing.effectiveDate },
                                { label: "Order Reference", value: viewing.orderNo },
                                { label: "Order Date", value: viewing.orderDate },
                                { label: "Approved / Sanctioned By", value: viewing.sanctionedBy },
                                { label: "Status", value: linked ? <ProposalStatusBadge status={linked.status} /> : "Final" },
                            ]}
                        />
                        <PayComparison existing={viewing.from} proposed={viewing.to} />
                        {viewing.remarks && (
                            <div>
                                <p className="text-xs text-muted-foreground">Remarks</p>
                                <p className="mt-0.5 text-sm">{viewing.remarks}</p>
                            </div>
                        )}
                        {linked && (
                            <Button variant="ghost" size="sm" icon={<ExternalLink size={14} />} label={`Justification: ${linked.justification.slice(0, 80)}…`} onClick={() => navigate(`/proposals/${linked.id}`)} className="justify-start text-left" />
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default HistoryPage;
