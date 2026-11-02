import { useState } from "react";
import { CheckCircle2, History, Pencil } from "lucide-react";
import { CONTROL_FIELDS } from "../form-config/selectionConfigurationFilters.fields";
import { configuredFieldProps } from "@/features/shared/formFields";
import { Badge, Card, CardBody, CardHeader, DataTable, FilterPanel, type TableColumnDef, type TableMenuItem } from "@mfe/components";
import { SearchableSelect } from "@/shared/components/ui/Forms";
import { admissionConfig } from "@/features/shared/admissionMasters";
import { STAGES, UNIVERSITY_RULES } from "../form-config/selectionConfigurationConfig";
import type { SelectionRecord, SelectionConfigurationListProps } from "../types/selectionConfiguration.types";
import { useSelectionConfigurationFilters } from "../hooks/useSelectionConfigurationFilters";

const columns: TableColumnDef<SelectionRecord>[] = [
    { id: "university", header: "University", accessorFn: (row) => admissionConfig.universities.find((item) => item.id === row.configuration.university)?.label ?? row.configuration.university },
    { id: "session", header: "Academic Session", accessorFn: (row) => row.configuration.academicSession },
    { accessorKey: "version", header: "Version" },
    { id: "stages", header: "Selection Stages (in order)", accessorFn: (row) => [...row.configuration.stages].sort((a, b) => Number(a.order) - Number(b.order)).map((stage) => STAGES.find((item) => item.id === stage.id)?.label).join(" \u2192 ") },
    { id: "merit", header: "Merit Rule", accessorFn: (row) => UNIVERSITY_RULES.find((item) => item.universityId === row.configuration.university)?.meritMethods.find((rule) => rule.id === row.configuration.meritMethod)?.label ?? row.configuration.meritMethod },
    { accessorKey: "status", header: "Approval Status", Cell: ({ row }) => <Badge variant={row.original.status === "Active" ? "success" : row.original.status === "Approved" ? "primary" : "secondary"}>{row.original.status}</Badge> },
    { accessorKey: "updatedAt", header: "Last Updated", Cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString("en-IN") },
];
export const SelectionConfigurationList = ({ records, onView, onEdit, onApprove, onActivate, onRevise, onHistory }: SelectionConfigurationListProps) => {
    const [filtersHidden, setFiltersHidden] = useState(false);
    const { filters, setFilters, applied, shown, apply, reset } = useSelectionConfigurationFilters(records);
    return <>
    <FilterPanel hidden={filtersHidden} onHiddenChange={setFiltersHidden} floatingButton={false} title="Selection Configuration Filters" className="mt-4 mb-4" appliedCount={Object.values(applied).filter(Boolean).length} onSubmit={apply} onReset={reset}>
        <div className="grid grid-cols-12 gap-4">
            <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.university)} value={filters.university} options={[{ value: "", label: "All Universities" }, ...admissionConfig.universities.map((item) => ({ value: item.id, label: item.label }))]} onChange={(value) => setFilters({ ...filters, university: String(value) })} />
            <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.academicSession)} value={filters.academicSession} options={[{ value: "", label: "All Sessions" }, ...admissionConfig.sessions.map((value) => ({ value, label: value }))]} onChange={(value) => setFilters({ ...filters, academicSession: String(value) })} />
            <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.selectionStage)} value={filters.stage} options={[{ value: "", label: "All Stages" }, ...STAGES.map((item) => ({ value: item.id, label: item.label }))]} onChange={(value) => setFilters({ ...filters, stage: String(value) })} />
            <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.approvalStatus)} value={filters.status} options={[{ value: "", label: "All Statuses" }, ...["Draft", "Approved", "Active"].map((value) => ({ value, label: value }))]} onChange={(value) => setFilters({ ...filters, status: String(value) })} />
        </div>
    </FilterPanel>
    <Card>
        <CardHeader title="Selection Configuration List" divider />
        <CardBody>
        <DataTable filterToggle={{ hidden: filtersHidden, onToggle: () => setFiltersHidden(!filtersHidden), appliedCount: Object.values(applied).filter(Boolean).length }} data={shown} columns={columns} getRowId={(row) => row.id} caption="Selection configurations" searchPlaceholder="Search university, session, stage or status" emptyTitle="No selection configurations" emptyDescription="Save a configuration to add it to this list." renderPreview={null} exportFileName="selection_configurations" actions={{
            onView,
            more: (row): TableMenuItem[] => [
                ...(row.status === "Draft" ? [
                    { id: "edit", label: "Edit Draft", icon: Pencil, onSelect: () => onEdit(row) },
                    { id: "approve", label: "Approve Configuration", icon: CheckCircle2, onSelect: () => onApprove(row) },
                ] : []),
                ...(row.status === "Approved" ? [{ id: "activate", label: "Activate Configuration", icon: CheckCircle2, onSelect: () => onActivate(row) }] : []),
                ...(row.status !== "Draft" ? [{ id: "revise", label: "Create Draft Revision", icon: Pencil, onSelect: () => onRevise(row) }] : []),
                { id: "history", label: "View Change Log", icon: History, onSelect: () => onHistory(row) },
            ],
        }} />
        </CardBody>
    </Card>
    </>;
};
