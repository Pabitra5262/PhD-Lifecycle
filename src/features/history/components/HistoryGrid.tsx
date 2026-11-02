import { DataTable, type TableColumnDef } from "@mfe/components";
import { payText, rupees, type HistoryRecord } from "../../shared";

const columns: TableColumnDef<HistoryRecord>[] = [
    { accessorKey: "effectiveDate", header: "Effective Date", Cell: ({ row }) => <span className="whitespace-nowrap">{row.original.effectiveDate}</span> },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "event", header: "Event" },
    { id: "from", header: "From (Basic · Level · Cell)", accessorFn: (r) => r.from.basic, hideBelow: "lg", Cell: ({ row }) => (row.original.from.basic ? payText(row.original.from) : "—") },
    { id: "to", header: "To (Basic · Level · Cell)", accessorFn: (r) => r.to.basic, Cell: ({ row }) => <strong className="whitespace-nowrap">{payText(row.original.to)}</strong> },
    { id: "diff", header: "Change", align: "right", hideBelow: "md", accessorFn: (r) => r.to.basic - r.from.basic, Cell: ({ row }) => (row.original.from.basic ? `+${rupees(row.original.to.basic - row.original.from.basic)}` : "Initial") },
    { accessorKey: "orderNo", header: "Order Reference", hideBelow: "md" },
    { accessorKey: "orderDate", header: "Order Date", hideBelow: "xl" },
    { accessorKey: "sanctionedBy", header: "Approved By", hideBelow: "xl" },
    { accessorKey: "proposalId", header: "Proposal No.", defaultHidden: true },
];

/** SRS 1.5 History Grid: past fixation / protection events with dates, pay particulars and order references. */
export const HistoryGrid = ({ rows, officerName, onOpen }: { rows: HistoryRecord[]; officerName: string; onOpen: (r: HistoryRecord) => void }) => (
    <DataTable
        caption={`Pay fixation / protection history — ${officerName}`}
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        rowLabel={(r) => `${r.effectiveDate} ${r.event}`}
        exportFileName="pay_fixation_history"
        emptyTitle="No history found"
        emptyDescription="No approved or sanctioned pay fixation / protection exists for this officer."
        renderPreview={null}
        actions={{ onView: onOpen }}
    />
);

export default HistoryGrid;
