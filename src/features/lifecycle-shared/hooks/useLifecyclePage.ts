import { createElement, useEffect, useState, useSyncExternalStore, type ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Checkbox, showToast } from "@mfe/components";
import { useAppSelector } from "@/app/hooks";
import { useRole } from "@/features/shared/store/PayFixStore";
import { deriveValues, recordOptions, resolveLifecycleActor, scopedScholars, subscribeLifecycle, lifecycleSnapshot, dateToday, selectionResults, summarizeLifecycleIndicators } from "../service/lifecycleStore";
import { validateLifecycle } from "../validation/lifecycleValidation";
import type { Actor, Definition, FeatureService, FieldContext, RecordRow, Values } from "../types";
import type { FormField } from "@/shared/components/ui/Forms";

export function useLifecyclePage(def: Definition, service: FeatureService, buildFields: (context: FieldContext) => FormField[]) {
    const { role: selectedRole } = useRole();
    const identity: unknown = useAppSelector((state) => state.auth.user);
    const actor: Actor = resolveLifecycleActor(selectedRole, identity, def.key);
    const role = actor.role;
    useSyncExternalStore(subscribeLifecycle, lifecycleSnapshot);
    const [generatedRows, setGeneratedRows] = useState<RecordRow[] | null>(null);
    const [editingId, setEditingId] = useState<string | undefined>();
    const [viewed, setViewed] = useState<RecordRow | null>(null);
    const [grids, setGrids] = useState<Record<string, Values[]>>({});
    const [pending, setPending] = useState<Values | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [filters, setFilters] = useState({ search: "", status: "" });
    const [applied, setApplied] = useState(filters);
    const initialValues: Values = { academicSession: "2026-27", university: actor.universities[0] ?? "", department: actor.departments[0] ?? "", duration: "6", status: "Draft", approvalStatus: "Pending", courseStatus: "Not Started", reportingPeriod: "July - December 2026", approval: "Pending", archive: "", dispatchDate: dateToday(), approvalDate: dateToday() };
    const methods = useForm<Values>({ defaultValues: initialValues });
    const values = useWatch({ control: methods.control }) as Values;
    const options = recordOptions(actor, def.key, values);
    const context = { actor, values, options, scholars: scopedScholars(actor, def.key) };
    const locked = viewed !== null || !def.readOnly && !def.writers.includes(role);
    const fields = buildFields(context).map((field): FormField => ({ ...field, disabled: field.disabled || locked,
        ...(field.type === "checkbox-group" ? { render: (value, onChange, error) => createElement("fieldset", { className: "space-y-2" },
            createElement("legend", { className: "ui-label" }, field.label, field.required ? " *" : ""),
            createElement("div", { className: "flex flex-wrap gap-4" }, ...(field.options ?? []).map((option) => createElement(Checkbox, { key: option.value, label: option.label, disabled: locked || field.disabled, checked: Array.isArray(value) && value.includes(option.value), onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked ? [...(Array.isArray(value) ? value : []), option.value] : (Array.isArray(value) ? value : []).filter((item) => item !== option.value)) }))),
            error ? createElement("p", { role: "alert", className: "ui-error" }, error) : null,
        ) } : {}),
    }));
    const rows = generatedRows ?? service.read(actor);
    const indicatorSummary = def.key === "reportsAnalytics" ? summarizeLifecycleIndicators(rows) : "";
    useEffect(() => {
        if (def.key === "reportsAnalytics" && methods.getValues("indicators") !== indicatorSummary) methods.setValue("indicators", indicatorSummary);
    }, [def.key, indicatorSummary, methods, values.indicators]);
    const shown = rows.filter((row) => (!applied.status || row.status === applied.status) && (!applied.search || [row.owner, row.status, ...Object.values(row.values).filter((value) => typeof value === "string")].join(" ").toLowerCase().includes(applied.search.toLowerCase())));
    const derived = deriveValues(def, actor, values);
    useEffect(() => {
        if (viewed) return;
        Object.entries(derived).forEach(([key, value]) => { if (methods.getValues(key) !== value) methods.setValue(key, value); });
    }, [derived, methods, viewed]);
    const scholar = context.scholars.find((row) => row.id === values.scholar);
    const displayRows = (name: string): Values[] => {
        const grid = def.grids.find((item) => item.name === name);
        if (name === "completionChecklist") return ["Academic Requirements", "Thesis Submission", "Thesis Evaluation", "Viva-Voce", "Administrative Conditions"].map((condition) => ({ condition, status: scholar && scholar.level >= 6 ? "Completed" : "Pending" }));
        if (grid?.mode === "display" && name === "courses") return options.subjects.map((item) => ({ course: item.label, credits: "4" }));
        if (name === "candidateList") return selectionResults(actor, values);
        if (grid?.mode === "display") return options.candidates.map((item) => ({ candidate: item.label, status: "Eligible", stageOutcome: "Qualified" }));
        if (grid?.mode === "enrollment") return context.scholars.map((item) => ({ scholar: item.id, name: item.name, department: item.department, ...(grids[name] ?? []).find((row) => row.scholar === item.id) }));
        return grids[name] ?? [];
    };
    const updateGrid = (name: string, index: number, key: string, value: unknown) => { setGrids((current) => ({ ...current, [name]: (current[name] ?? []).map((row, i) => (def.grids.find((grid) => grid.name === name)?.mode === "enrollment" ? row.scholar === displayRows(name)[index]?.scholar : i === index) ? { ...row, [key]: value } : row) })); setErrors({}); };
    const submit = (event?: React.FormEvent) => {
        event?.preventDefault();
        const data = { ...methods.getValues(), ...deriveValues(def, actor, methods.getValues()) };
        const submittedGrids = { ...grids, ...Object.fromEntries(def.grids.filter((grid) => grid.mode === "checklist").map((grid) => [grid.name, displayRows(grid.name)])) };
        const next = validateLifecycle(def, data, submittedGrids, fields, actor);
        setErrors(next); methods.clearErrors();
        Object.entries(next).forEach(([key, message]) => methods.setError(key, { message }));
        if (!Object.keys(next).length) {
            if (def.key === "reportsAnalytics" && service.generate) { const report = service.generate(actor, data); setGeneratedRows(report); return; }
            setPending(data);
        }
    };
    const confirm = () => {
        if (!pending) return;
        try {
            service.save(actor, pending, { ...grids, ...Object.fromEntries(def.grids.filter((grid) => grid.mode === "checklist").map((grid) => [grid.name, displayRows(grid.name)])) }, fields, editingId);
            showToast.success(def.title + " submitted"); setPending(null); setEditingId(undefined); setViewed(null); methods.reset(initialValues); setGrids({}); setErrors({});
        } catch (error) { showToast.error("Cannot submit record", error instanceof Error ? error.message : "Submission failed"); setPending(null); }
    };
    const reset = () => { setEditingId(undefined); setGeneratedRows(null); setViewed(null); methods.reset(initialValues); setErrors({}); setGrids({}); };
    const view = (row: RecordRow) => { setViewed(row); methods.reset(row.values); setGrids(row.grids); setErrors({}); window.scrollTo({ top: 0, behavior: "smooth" }); };
    const edit = (row: RecordRow) => { if (!def.writers.includes(role) || row.archived) return; methods.reset(row.values); setGrids(row.grids); setEditingId(row.id); setViewed(null); setErrors({}); };
    const changeAccountStatus = (row: RecordRow) => { try { service.changeAccountStatus?.(actor, row.id, row.status !== "Active"); showToast.success("User account updated"); } catch (error) { showToast.error("Cannot update account", error instanceof Error ? error.message : "Update failed"); } };
    const approveNomination = (row: RecordRow) => { try { service.approveNomination?.(actor, row.id); showToast.success("Examiner nomination approved"); } catch (error) { showToast.error("Cannot approve nomination", error instanceof Error ? error.message : "Approval failed"); } };
    return { approveNomination, changeAccountStatus, edit, def, actor, context, fields, values, methods, locked, viewed, grids, setGrids, errors, displayRows, updateGrid, submit, confirm, pending, setPending, reset, view, rows, shown, filters, setFilters, applied, applyFilters: () => setApplied({ ...filters }), resetFilters: () => { setFilters({ search: "", status: "" }); setApplied({ search: "", status: "" }); } };
}
export type LifecycleController = ReturnType<typeof useLifecyclePage>;
