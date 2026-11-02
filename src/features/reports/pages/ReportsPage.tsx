import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Button, DataTable, StatusModal, showToast, type TableColumnDef } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { exportToExcel, exportToPDF } from "@mfe/utils";
import { useCurrentUser } from "../../shared";
import { ReportFilterForm } from "../components/ReportFilterForm";
import { useReport } from "../hooks/useReport";
import type { ReportFilters, ReportResult, ReportRow } from "../types/report.types";

const initial = (): ReportFilters => ({ reportType: "", proposalType: "", status: "", from: `${new Date().getFullYear()}-01-01`, to: new Date().toISOString().slice(0, 10), institution: "", cadre: "" });

/** SRS 1.6 — Reports and Monitoring: generate, review and export (PDF / Excel). */
const ReportsPage = () => {
    const { roleKey } = useCurrentUser();
    const { generate, logExport } = useReport();
    const [filters, setFilters] = useState<ReportFilters>(initial);
    const [errors, setErrors] = useState<Partial<Record<keyof ReportFilters, string>>>({});
    const [result, setResult] = useState<ReportResult | null>(null);
    const [failure, setFailure] = useState<string | null>(null);

    const onChange = <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => {
        setFilters((f) => ({ ...f, [key]: value }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    };

    const onGenerate = () => {
        const e: typeof errors = {};
        if (!filters.reportType) e.reportType = "Select a report type";
        if (!filters.from) e.from = "From date is required";
        if (!filters.to) e.to = "To date is required";
        if (filters.from && filters.to && filters.from > filters.to) e.to = "To date must be on or after From date";
        setErrors(e);
        if (Object.keys(e).length) return;
        const r = generate(filters);
        if (!r.ok) return setFailure(r.error);
        setResult(r.result);
        if (r.result.rows.length === 0) showToast.info("No data for the selected filters");
    };

    const exportAs = async (format: "PDF" | "Excel") => {
        if (!result) return;
        const file = result.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_");
        try {
            if (format === "PDF") await exportToPDF(result.columns, result.rows, file, result.title);
            else await exportToExcel(result.columns, result.rows, file, "Report");
            logExport(result.title, format);
            showToast.success(`${format} downloaded`, result.title);
        } catch {
            setFailure("Export failed. Please try again.");
        }
    };

    const columns: TableColumnDef<ReportRow>[] = (result?.columns ?? []).map((c) => ({ accessorKey: c.accessorKey, header: c.header, align: c.align }));

    return (
        <>
            <PageHeader
                title="Reports"
                
            />

            <div className="mb-4">
                <ReportFilterForm
                    filters={filters}
                    errors={errors}
                    onChange={onChange}
                    showInstitution={roleKey !== "college"}
                    onGenerate={onGenerate}
                    onReset={() => {
                        setFilters(initial());
                        setErrors({});
                        setResult(null);
                    }}
                />
            </div>

            {result && (
                <>
                    <DataTable
                        caption={result.title}
                        data={result.rows}
                        columns={columns}
                        getRowId={(_, i) => String(i)}
                        renderPreview={null}
                        exportFileName={result.title}
                        emptyTitle="No data"
                        emptyDescription="No records match the selected filters."
                        toolbarActions={
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" icon={<FileText size={14} />} label="Export PDF" disabled={!result.rows.length} onClick={() => void exportAs("PDF")} />
                                <Button variant="outline" size="sm" icon={<FileSpreadsheet size={14} />} label="Export Excel" disabled={!result.rows.length} onClick={() => void exportAs("Excel")} />
                            </div>
                        }
                    />
                    <p className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                        <span>{result.summary}</span>
                        <span>
                            Period {filters.from} to {filters.to} · Generated {result.generatedAt}
                        </span>
                    </p>
                </>
            )}

            <StatusModal isOpen={!!failure} type="error" title="Report" message={failure ?? ""} onClose={() => setFailure(null)} />
        </>
    );
};

export default ReportsPage;
