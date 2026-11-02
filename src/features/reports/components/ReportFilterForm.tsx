import { FileChartColumn, RotateCcw } from "lucide-react";
import { Button, Card, DatePicker, Select } from "@mfe/components";
import { CADRES, INSTITUTIONS, PROPOSAL_TYPES, STATUS_LABEL, type ProposalStatus } from "../../shared";
import { REPORT_TYPES, type ReportFilters } from "../types/report.types";

const all = (values: string[], label = "All") => [{ value: "", label }, ...values.map((v) => ({ value: v, label: v }))];
const STATUS_OPTIONS = [{ value: "", label: "All" }, ...(Object.keys(STATUS_LABEL) as ProposalStatus[]).filter((s) => s !== "Draft").map((s) => ({ value: s, label: STATUS_LABEL[s] }))];

interface ReportFilterFormProps {
    filters: ReportFilters;
    errors: Partial<Record<keyof ReportFilters, string>>;
    onChange: <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => void;
    /** College Admin reports cover their own institution only. */
    showInstitution: boolean;
    onGenerate: () => void;
    onReset: () => void;
}

/** SRS 1.6 Generate Report fields. */
export const ReportFilterForm = ({ filters, errors, onChange, showInstitution, onGenerate, onReset }: ReportFilterFormProps) => (
    <Card title="Generate Report">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
                label="Report Type"
                required
                placeholder="Select report"
                options={REPORT_TYPES}
                value={filters.reportType}
                onChange={(v) => onChange("reportType", v as ReportFilters["reportType"])}
                error={errors.reportType}
                wrapperClassName="sm:col-span-2"
            />
            <DatePicker label="From Date" required value={filters.from} onChange={(e) => onChange("from", e.target.value)} error={errors.from} />
            <DatePicker label="To Date" required value={filters.to} onChange={(e) => onChange("to", e.target.value)} error={errors.to} minDate={filters.from || undefined} />
            <Select label="Proposal Type" options={[{ value: "", label: "Both" }, ...PROPOSAL_TYPES.map((t) => ({ value: t, label: t }))]} value={filters.proposalType} onChange={(v) => onChange("proposalType", v as ReportFilters["proposalType"])} />
            <Select label="Status" options={STATUS_OPTIONS} value={filters.status} onChange={(v) => onChange("status", v as ReportFilters["status"])} />
            {showInstitution && <Select label="Institution" options={all(INSTITUTIONS)} value={filters.institution} onChange={(v) => onChange("institution", String(v))} />}
            <Select label="Cadre" options={all(CADRES)} value={filters.cadre} onChange={(v) => onChange("cadre", String(v))} />
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button variant="outline" icon={<RotateCcw size={16} />} label="Reset" onClick={onReset} />
            <Button icon={<FileChartColumn size={16} />} label="Generate" onClick={onGenerate} />
        </div>
    </Card>
);

export default ReportFilterForm;
