import type { ReactNode } from "react";
import { ClipboardCheck, Pencil, Trash } from "lucide-react";
import { DataTable, type TableColumnDef, type TableFilterField, type TableMenuItem } from "@mfe/components";
import { ProposalStatusBadge, type Proposal } from "../../shared";
import type { ProposalRow } from "../types/proposal.types";

interface ProposalTableProps {
    rows: ProposalRow[];
    caption?: string;
    onView: (p: Proposal) => void;
    /** Draft / Returned, own proposals only. */
    canEdit: (p: Proposal) => boolean;
    onEdit: (p: Proposal) => void;
    onDelete: (p: Proposal) => void;
    /** The role acts on this proposal at its current stage (Verify / Approve / Sanction). */
    canAct: (p: Proposal) => boolean;
    onAct: (p: Proposal) => void;
    actLabel: string;
    /** Fields of the table's filter panel (SRS 1.3: Status, Type, Period, Institution). */
    filterFields?: TableFilterField[];
    toolbarActions?: ReactNode;
    /** Filter icon in the table toolbar that shows / hides the page's FilterPanel (useTableFilters().tableToggle). */
    filterToggle?: { hidden: boolean; onToggle: () => void; appliedCount?: number };
}

const columns: TableColumnDef<ProposalRow>[] = [
    { accessorKey: "id", header: "Proposal No.", Cell: ({ row }) => <strong className="whitespace-nowrap">{row.original.id}</strong> },
    {
        id: "officer",
        header: "Officer Name / Code",
        accessorFn: (r) => `${r.officerName} ${r.officerCode}`,
        Cell: ({ row }) => (
            <span>
                <span className="block font-medium">{row.original.officerName}</span>
                <span className="block text-xs text-muted-foreground">{row.original.officerCode} · {row.original.institution}</span>
            </span>
        ),
    },
    { accessorKey: "type", header: "Proposal Type" },
    { accessorKey: "event", header: "Event / Reason", hideBelow: "md" },
    { accessorKey: "status", header: "Status", Cell: ({ row }) => <ProposalStatusBadge status={row.original.status} /> },
    { accessorKey: "pendingWith", header: "Pending With", hideBelow: "lg" },
    { accessorKey: "submittedDate", header: "Submitted Date", hideBelow: "md" },
    { accessorKey: "institution", header: "Institution", defaultHidden: true },
    { accessorKey: "cadre", header: "Cadre", defaultHidden: true },
    { accessorKey: "period", header: "Period", defaultHidden: true },
];

/** SRS 1.3 Proposal List: Proposal No., Officer, Type, Event, Status, Pending With, Submitted Date, View / Action. */
export const ProposalTable = ({ rows, caption = "Pay fixation / protection proposals", onView, canEdit, onEdit, onDelete, canAct, onAct, actLabel, filterFields, toolbarActions, filterToggle }: ProposalTableProps) => (
    <DataTable
        caption={caption}
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        rowLabel={(r) => `${r.id} — ${r.officerName}`}
        searchPlaceholder="Search proposal no., officer name or code"
        exportFileName="pay_fixation_proposals"
        filterFields={filterFields}
        filterToggle={filterToggle}
        toolbarActions={toolbarActions}
        emptyTitle="No proposals found"
        emptyDescription="No proposals match the applied filters."
        renderPreview={null}
        actions={{
            onView,
            more: (r): TableMenuItem[] => [
                ...(canAct(r) ? [{ id: "act", label: actLabel, icon: ClipboardCheck, onSelect: () => onAct(r) }] : []),
                ...(canEdit(r) ? [{ id: "edit", label: r.status === "Returned" ? "Correct & Re-submit" : "Edit Draft", icon: Pencil, onSelect: () => onEdit(r) }] : []),
                ...(r.status === "Draft" && canEdit(r) ? [{ id: "delete", label: "Delete Draft", icon: Trash, danger: true, onSelect: () => onDelete(r) }] : []),
            ],
        }}
    />
);

export default ProposalTable;
