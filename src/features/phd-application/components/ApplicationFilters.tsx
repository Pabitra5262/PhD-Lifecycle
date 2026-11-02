import { CONTROL_FIELDS } from "../form-config/apply.fields";
import { configuredFieldProps } from "@/features/shared/formFields";
import { FilterPanel } from "@mfe/components";
import { SearchableSelect } from "@/shared/components/ui/Forms";
import { admissionConfig } from "@/features/shared/admissionMasters";
import type { PhdApplication } from "../types/application.types";

import type { ApplicationFiltersValue } from "../types/applicationFilters.types";
interface Props {
    hidden: boolean; onHiddenChange: (hidden: boolean) => void;
    value: ApplicationFiltersValue; applied: ApplicationFiltersValue; rows: PhdApplication[];
    onChange: (value: ApplicationFiltersValue) => void; onApply: () => void; onReset: () => void;
}
export function ApplicationFilters({ value, applied, rows, onChange, onApply, onReset, hidden, onHiddenChange }: Props) {
    const advertisements = [...new Map(rows.map((row) => [row.advertisement.id, row.advertisement])).values()];
    return <FilterPanel hidden={hidden} onHiddenChange={onHiddenChange} floatingButton={false} title="Application Filters" className="mt-4 mb-4" appliedCount={Object.values(applied).filter(Boolean).length} onSubmit={onApply} onReset={onReset}>
        <div className="grid grid-cols-12 gap-4">
            <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.advertisementFilter)} value={value.advertisement} options={[{ value: "", label: "All Advertisements" }, ...advertisements.map((row) => ({ value: row.id, label: row.number }))]} onChange={(selected) => onChange({ ...value, advertisement: String(selected) })} />
            <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.university)} value={value.university} options={[{ value: "", label: "All Universities" }, ...admissionConfig.universities.map((row) => ({ value: row.id, label: row.label }))]} onChange={(selected) => onChange({ ...value, university: String(selected), department: "" })} />
            <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.department)} value={value.department} disabled={!value.university} options={[{ value: "", label: "All Departments" }, ...(admissionConfig.universities.find((row) => row.id === value.university)?.departments ?? []).map((label) => ({ value: label, label }))]} onChange={(selected) => onChange({ ...value, department: String(selected) })} />
            <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.applicationStatus)} value={value.status} options={[{ value: "", label: "All Statuses" }, ...["Draft", "Submitted", "Under Scrutiny", "Returned", "Eligible", "Ineligible"].map((label) => ({ value: label, label }))]} onChange={(selected) => onChange({ ...value, status: String(selected) })} />
        </div>
    </FilterPanel>;
}
