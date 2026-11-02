import { DataTable, type TableColumnDef } from "@mfe/components";
import type { AuditEntry } from "../../shared";

const columns: TableColumnDef<AuditEntry>[] = [
    { accessorKey: "dt", header: "Date / Time", Cell: ({ row }) => <span className="whitespace-nowrap tabular-nums">{row.original.dt}</span> },
    { accessorKey: "user", header: "User" },
    { accessorKey: "role", header: "Role", hideBelow: "md" },
    { accessorKey: "action", header: "Action" },
    { accessorKey: "ref", header: "Reference", hideBelow: "md" },
];

/** Audit trail of submissions, workflow actions, report access and configuration changes. */
export const AuditTrailTable = ({ entries }: { entries: AuditEntry[] }) => (
    <DataTable
        caption="Audit trail"
        data={entries}
        columns={columns}
        getRowId={(r) => r.id}
        searchPlaceholder="Search user, action or reference"
        exportFileName="pay_fixation_audit_trail"
        emptyTitle="No audit entries"
    />
);

export default AuditTrailTable;
