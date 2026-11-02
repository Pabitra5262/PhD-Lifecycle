import { useState } from "react";
import { Card, CardBody, CardHeader, DataTable, Input, Modal, TextArea, type TableColumnDef } from "@mfe/components";
import type { LifecycleController } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import type { RecordRow } from "@/features/lifecycle-shared/types";

const displayChanges = (value: unknown): string => {
    const text = String(value ?? "");
    try { return JSON.stringify(JSON.parse(text), null, 2); } catch { return text; }
};
const displayTimestamp = (value: unknown): string => {
    const text = String(value ?? "");
    const separator = text.lastIndexOf(" / ");
    if (separator < 0) return text;
    const rawDate = text.slice(separator + 3);
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return text;
    const formatted = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) : date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    return text.slice(0, separator) + " / " + formatted;
};
export function AuditTrailList({ controller }: { controller: LifecycleController }) {
    const [selected, setSelected] = useState<RecordRow | null>(null);
    const columns: TableColumnDef<RecordRow>[] = controller.def.columns.map((column) => ({
        id: column.name,
        header: column.label,
        accessorFn: (row) => column.name === "userTimestamp" ? displayTimestamp(row.values[column.name]) : String(row.values[column.name] ?? ""),
        ...(column.name === "changeDetails" ? { Cell: ({ row }: { row: { original: RecordRow } }) => <p className="max-w-lg truncate" title={String(row.original.values.changeDetails ?? "")}>{String(row.original.values.changeDetails ?? "")}</p> } : {}),
    }));
    return <>
        <Card><CardHeader title="Audit Trail" divider /><CardBody>
            <DataTable data={controller.rows} columns={columns} getRowId={(row) => row.id} rowLabel={(row) => String(row.values.recordReference ?? row.id)} caption="Audit Trail" searchPlaceholder="Audit Search" exportFileName="audit_trail" emptyTitle="No audit records" renderPreview={null} actions={{ onView: setSelected }} />
        </CardBody></Card>
        <Modal isOpen={selected !== null} title="Audit Record Details" onClose={() => setSelected(null)} size="lg">
            <div className="grid grid-cols-12 gap-4">
                <Input label="Action Type" readOnly value={String(selected?.values.actionType ?? "")} wrapperClassName="col-span-12 sm:col-span-6" />
                <Input label="Record Reference" readOnly value={String(selected?.values.recordReference ?? "")} wrapperClassName="col-span-12 sm:col-span-6" />
                <Input label="User Timestamp" readOnly value={displayTimestamp(selected?.values.userTimestamp)} wrapperClassName="col-span-12" />
                <TextArea label="Change Details" readOnly rows={1} value={displayChanges(selected?.values.changeDetails)} wrapperClassName="col-span-12" />
            </div>
        </Modal>
    </>;
}
