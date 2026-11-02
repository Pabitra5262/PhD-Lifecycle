import { Eye, FileSpreadsheet, FileText, Pencil, UserCheck, CheckCircle2 } from "lucide-react";
import { Badge, Button, Card, CardBody, CardHeader, DataTable, Input, Modal, type TableColumnDef } from "@mfe/components";
import { exportToExcel, exportToPDF } from "@mfe/utils";
import { useState } from "react";
import type { LifecycleController } from "../hooks/useLifecyclePage";
import type { RecordRow } from "../types";

export function LifecycleList({ controller: c }: { controller: LifecycleController }) {
    const [filtersHidden, setFiltersHidden] = useState(false);
    const appliedCount = Number(!!c.applied.search) + Number(!!c.applied.status);
    const [preview, setPreview] = useState<RecordRow | null>(null);
    const format = (value: unknown) => value instanceof File ? value.name : Array.isArray(value) ? value.join(", ") : /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? "")) ? String(value).split("-").reverse().join("/") : String(value ?? "");
    const displayValue = (name: string, value: unknown) => c.fields.find((field) => field.name === name)?.options?.find((option) => option.value === value)?.label ?? format(value);
    const columns: TableColumnDef<RecordRow>[] = c.def.columns.map((column) => ({ id: column.name, header: column.label, accessorFn: (row) => { return displayValue(column.name, row.values[column.name]); },
        ...(c.def.key === "scholarRequests" && column.name === "status" ? {
            Cell: ({ row }: { row: { original: RecordRow } }) => {
                const status = displayValue(column.name, row.original.values[column.name]);
                return <Badge variant={["Approved", "Resolved", "Completed"].includes(status) ? "success" : ["Rejected", "Returned"].includes(status) ? "danger" : status === "Pending" ? "warning" : status === "Submitted" ? "info" : "secondary"}>{status}</Badge>;
            },
        } : {}),
    }));
    const exportRows = () => c.shown.map((row) => Object.fromEntries(c.def.columns.map((column) => [column.name, displayValue(column.name, row.values[column.name])])));
    const exportColumns = c.def.columns.map((column) => ({ accessorKey: column.name, header: column.label }));
    return <>
        {/* <FilterPanel hidden={filtersHidden} onHiddenChange={setFiltersHidden} floatingButton={false} title="Filters" className="my-4" onSubmit={c.applyFilters} onReset={c.resetFilters} appliedCount={Number(!!c.applied.search) + Number(!!c.applied.status)}>
            <Input label={c.def.key === "auditTrail" ? "Audit Search" : "Search"} value={c.filters.search} onChange={(event) => c.setFilters({ ...c.filters, search: event.target.value })} />
            <SearchableSelect label="Status" value={c.filters.status} options={[{ value: "", label: "All Statuses" }, ...[...new Set(c.rows.map((row) => row.status))].map((value) => ({ value, label: value }))]} onChange={(value) => c.setFilters({ ...c.filters, status: String(value) })} />
        </FilterPanel> */}
        <Card><CardHeader title={c.def.key === "notifications" ? "Notification History" : c.def.title} divider /><CardBody>
            <DataTable filterToggle={{ hidden: filtersHidden, onToggle: () => setFiltersHidden(!filtersHidden), appliedCount }} data={c.shown} columns={columns} getRowId={(row) => row.id} caption={c.def.title} renderPreview={null} actions={{ onView: (row) => c.def.readOnly ? setPreview(row) : c.view(row), more: (row) => [...(c.def.key === "examinerManagement" && ["University Authority", "University Authority"].includes(c.actor.role) && row.values.approvalStatus !== "Approved" ? [{ id: "approve-nomination", label: "Approve Nomination", icon: CheckCircle2, onSelect: () => c.approveNomination(row) }] : []), ...(c.def.key === "adminManagement" && c.def.writers.includes(c.actor.role) ? [{ id: "account-status", label: row.status === "Active" ? "Deactivate Account" : "Activate Account", icon: UserCheck, onSelect: () => c.changeAccountStatus(row) }] : []), ...(!c.def.readOnly && !row.archived && c.def.writers.includes(c.actor.role) ? [{ id: "review", label: "Review / Update", icon: Pencil, onSelect: () => c.edit(row) }] : []), { id: "details", label: "View Details", icon: Eye, onSelect: () => setPreview(row) }] }} />
            {c.def.key === "reportsAnalytics" && <div className="mt-5 flex justify-start gap-2 border-t border-border pt-5">
                <Button icon={<FileSpreadsheet size={16} />} variant="outline" label="Export Excel" onClick={() => void exportToExcel(exportColumns, exportRows(), "phd_lifecycle_report", "Lifecycle Report")} />
                <Button icon={<FileText size={16} />} variant="outline" label="Export PDF" onClick={() => void exportToPDF(exportColumns, exportRows(), "phd_lifecycle_report", c.def.title)} />
            </div>}
        </CardBody></Card>
        <Modal isOpen={preview !== null} title="Record Details" onClose={() => setPreview(null)} size="lg"><div className="grid grid-cols-12 gap-4">{c.def.columns.map((column) => <Input key={column.name} label={column.label} readOnly value={displayValue(column.name, preview?.values[column.name])} wrapperClassName="col-span-12 sm:col-span-6" />)}</div></Modal>
    </>;
}
