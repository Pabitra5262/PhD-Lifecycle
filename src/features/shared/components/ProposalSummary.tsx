import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import { Card } from "@mfe/components";
import type { Proposal } from "../types/payfix.types";
import { PayComparison } from "./PayComparison";
import { ProposalStatusBadge } from "./ProposalStatusBadge";

export const Fields = ({ items, cols = 3 }: { items: { label: string; value: ReactNode }[]; cols?: 2 | 3 | 4 }) => (
    <dl className={`grid gap-x-6 gap-y-4 sm:grid-cols-2 ${cols === 4 ? "lg:grid-cols-4" : cols === 3 ? "lg:grid-cols-3" : ""}`}>
        {items.map((it) => (
            <div key={it.label} className="min-w-0">
                <dt className="text-xs text-muted-foreground">{it.label}</dt>
                <dd className="mt-0.5 break-words text-sm font-medium">{it.value || "—"}</dd>
            </div>
        ))}
    </dl>
);

export const DocumentList = ({ proposal }: { proposal: Proposal }) =>
    proposal.documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents uploaded.</p>
    ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
            {proposal.documents.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                        <FileText size={16} className="shrink-0 text-primary" aria-hidden />
                        <span className="min-w-0">
                            <span className="block font-medium">{d.kind}</span>
                            <span className="block truncate text-xs text-muted-foreground">{d.fileName}</span>
                        </span>
                    </span>
                    <span className="text-xs text-muted-foreground">Uploaded {d.uploadedOn}</span>
                </li>
            ))}
        </ul>
    );

/** Read-only Proposal Summary panel (SRS 1.4): officer, type, existing & proposed pay, documents. */
/** `footer` (e.g. form buttons) goes at the bottom of the last card. */
export const ProposalSummary = ({ proposal: p, showDocuments = true, footer }: { proposal: Proposal; showDocuments?: boolean; footer?: ReactNode }) => (
    <div className="flex flex-col gap-4">
        <Card title="Officer & Proposal">
            <Fields
                items={[
                    { label: "Proposal No.", value: p.id },
                    { label: "Status", value: <ProposalStatusBadge status={p.status} /> },
                    { label: "Pending With", value: p.pendingWith },
                    { label: "Proposal Type", value: p.type },
                    { label: "Officer Name / Code", value: `${p.officerName} (${p.officerCode})` },
                    { label: "Designation / Cadre", value: `${p.designation}, ${p.cadre}` },
                    { label: "Institution / Place of Posting", value: p.institution },
                    { label: "Event / Reason", value: p.event },
                    { label: "Event Date", value: p.eventDate },
                    { label: "Date of Next Increment", value: p.nextIncrement },
                    { label: "Submitted Date", value: p.submittedDate },
                    { label: "Order No.", value: p.orderNo },
                ]}
            />
            <div className="mt-4">
                <p className="text-xs text-muted-foreground">Justification / Remarks</p>
                <p className="mt-0.5 text-sm">{p.justification}</p>
            </div>
        </Card>
        <Card title="Pay Particulars" footer={showDocuments ? undefined : footer}>
            <PayComparison existing={p.existing} proposed={p.proposed} verified={p.verified} />
        </Card>
        {showDocuments && (
            <Card title={`Supporting Documents (${p.documents.length})`} footer={footer}>
                <DocumentList proposal={p} />
            </Card>
        )}
    </div>
);

export default ProposalSummary;
