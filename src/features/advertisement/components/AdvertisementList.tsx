import { ArrowRight, History, Pencil, X } from "lucide-react";
import { CONTROL_FIELDS } from "../form-config/advertisementFilters.fields";
import { configuredFieldProps } from "@/features/shared/formFields";
import { useState } from "react";
import { Badge, Card, CardHeader, CardBody, DataTable, FilterPanel, Modal, type TableColumnDef } from "@mfe/components";
import { SearchableSelect } from "@/shared/components/ui/Forms";
import { admissionConfig } from "../form-config/advertisementConfig";
import { ADVERTISEMENT_STATUSES, type AdvertisementRecord, type AdvertisementStatus } from "../model/advertisementRecords";

const columns: TableColumnDef<AdvertisementRecord>[] = [
    { id: "number", header: "Advertisement Number", accessorFn: (row) => row.form.advertisementNumber },
    { id: "date", header: "Advertisement Date", accessorFn: (row) => new Date(`${row.form.advertisementDate}T00:00:00`).toLocaleDateString("en-GB") },
    { id: "session", header: "Academic Session", accessorFn: (row) => row.form.academicSession },
    { id: "university", header: "University", accessorFn: (row) => admissionConfig.universities.find((u) => u.id === row.form.university)?.label ?? row.form.university },
    { id: "department", header: "Department", accessorFn: (row) => row.form.department },
    { id: "area", header: "Research Area / Subject", accessorFn: (row) => row.form.researchArea },
    { id: "seats", header: "Number of Seats", accessorFn: (row) => row.form.seatsApplicable ? row.form.seats : "Not Applicable" },
    { id: "start", header: "Application Start Date", accessorFn: (row) => new Date(`${row.form.applicationStart}T00:00:00`).toLocaleDateString("en-GB") },
    { id: "end", header: "Application End Date", accessorFn: (row) => new Date(`${row.form.applicationEnd}T00:00:00`).toLocaleDateString("en-GB") },
    { accessorKey: "status", header: "Status", Cell: ({ row }) => <Badge variant={row.original.status === "Published" ? "success" : "secondary"}>{row.original.status}</Badge> },
];
interface Props { records: AdvertisementRecord[]; onView: (row: AdvertisementRecord) => void; onEdit: (row: AdvertisementRecord) => void; onTransition: (row: AdvertisementRecord, status: AdvertisementStatus) => void }
export function AdvertisementList({ records, onView, onEdit, onTransition }: Props) {
    const [filtersHidden, setFiltersHidden] = useState(false);
    const empty = { academicSession: "", university: "", department: "", status: "" };
    const [filters, setFilters] = useState(empty);
    const [applied, setApplied] = useState(empty);
    const [history, setHistory] = useState<AdvertisementRecord | null>(null);
    const rows = records.filter((row) => (!applied.academicSession || row.form.academicSession === applied.academicSession) && (!applied.university || row.form.university === applied.university) && (!applied.department || row.form.department === applied.department) && (!applied.status || row.status === applied.status));
    const next = { Draft: "Submitted", Submitted: "Approved", Approved: "Published", Published: "Closed" } as const;
    const labels = { Submitted: "Submit for Approval", Approved: "Approve", Published: "Publish", Closed: "Close" };
    return <>
        <FilterPanel hidden={filtersHidden} onHiddenChange={setFiltersHidden} floatingButton={false} title="Advertisement Filters" className="mt-4 mb-4" appliedCount={Object.values(applied).filter(Boolean).length} onSubmit={() => setApplied({ ...filters })} onReset={() => { setFilters(empty); setApplied(empty); }}>
            <div className="grid grid-cols-12 gap-4">
                <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.academicSession)} value={filters.academicSession} options={[{ value: "", label: "All Sessions" }, ...admissionConfig.sessions.map((value) => ({ value, label: value }))]} onChange={(value) => setFilters({ ...filters, academicSession: String(value) })} />
                <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.university)} value={filters.university} options={[{ value: "", label: "All Universities" }, ...admissionConfig.universities.map((u) => ({ value: u.id, label: u.label }))]} onChange={(value) => setFilters({ ...filters, university: String(value), department: "" })} />
                <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.department)} value={filters.department} disabled={!filters.university} options={[{ value: "", label: "All Departments" }, ...(admissionConfig.universities.find((u) => u.id === filters.university)?.departments ?? []).map((value) => ({ value, label: value }))]} onChange={(value) => setFilters({ ...filters, department: String(value) })} />
                <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.status)} value={filters.status} options={[{ value: "", label: "All Statuses" }, ...ADVERTISEMENT_STATUSES.map((value) => ({ value, label: value }))]} onChange={(value) => setFilters({ ...filters, status: String(value) })} />
            </div>
        </FilterPanel>
        <Card><CardHeader title="Advertisement List" divider /><CardBody>
            <DataTable filterToggle={{ hidden: filtersHidden, onToggle: () => setFiltersHidden(!filtersHidden), appliedCount: Object.values(applied).filter(Boolean).length }} data={rows} columns={columns} getRowId={(row) => row.id} caption="Advertisements" renderPreview={null} actions={{ onView, more: (row) => {
                const status = next[row.status as keyof typeof next];
                return [
                    ...(row.status === "Draft" ? [{ id: "edit", label: "Edit Draft", icon: Pencil, onSelect: () => onEdit(row) }] : []),
                    ...(status ? [{ id: "transition", label: labels[status], icon: ArrowRight, onSelect: () => onTransition(row, status) }] : []),
                    ...(["Draft", "Submitted", "Approved"].includes(row.status) ? [{ id: "cancel", label: "Cancel Advertisement", icon: X, onSelect: () => onTransition(row, "Cancelled") }] : []),
                    { id: "history", label: "View History", icon: History, onSelect: () => setHistory(row) },
                ];
            } }} />
        </CardBody></Card>
        <Modal isOpen={history !== null} title="Advertisement History" onClose={() => setHistory(null)} size="lg"><DataTable data={history?.history ?? []} columns={[{ accessorKey: "action", header: "Action" }, { accessorKey: "date", header: "Date / Time", accessorFn: (row) => new Date(row.date).toLocaleString("en-IN") }, { accessorKey: "role", header: "User Role" }]} getRowId={(_, index) => String(index)} caption="Advertisement History" renderPreview={null} /></Modal>
    </>;
}
