import { useState } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showToast } from "@mfe/components";
import { useRole } from "@/features/shared/store/PayFixStore";
import { EMPTY_CONFIGURATION, UNIVERSITY_RULES } from "../form-config/selectionConfigurationConfig";
import { selectionSchema } from "../validation/selectionConfigurationSchema";
import { readSelectionDraft, readSelectionDraftRecord, readSelectionRecords, saveSelectionDraft, readSelectionChanges, reviseSelection, transitionSelection } from "../service/selectionConfigurationService";
import type { SelectionConfiguration, SelectionRecord, ConfigurationChange, StageId } from "../types/selectionConfiguration.types";

export function useSelectionConfiguration() {
    const { workflowRole: role } = useRole();
    const [records, setRecords] = useState(readSelectionRecords);
    const [editingId, setEditingId] = useState<string | null>(() => readSelectionDraftRecord()?.id ?? null);
    const [viewing, setViewing] = useState(false);
    const [pending, setPending] = useState<{ row: SelectionRecord; status: "Approved" | "Active" } | null>(null);
    const [history, setHistory] = useState<ConfigurationChange[] | null>(null);
    const selectedRecord = records.find((row) => row.id === editingId);
    const locked = viewing || (selectedRecord !== undefined && selectedRecord.status !== "Draft");
    const load = (record: SelectionRecord, view = false) => { setForm(structuredClone(record.configuration)); setEditingId(record.id); setViewing(view); setErrors({}); window.scrollTo({ top: 0, behavior: "smooth" }); };
    const methods = useForm<SelectionConfiguration>({ defaultValues: readSelectionDraft(), resolver: zodResolver(selectionSchema) });
    const form = useWatch({ control: methods.control }) as SelectionConfiguration;
    const setForm = (next: SelectionConfiguration | ((current: SelectionConfiguration) => SelectionConfiguration)) => methods.reset(typeof next === "function" ? next(methods.getValues()) : next);
    const [errors, updateErrors] = useState<Record<string, string>>({});
    const setErrors = (next: Record<string, string>) => {
        updateErrors(next);
        methods.clearErrors();
        Object.entries(next).forEach(([path, message]) => methods.setError(path as FieldPath<SelectionConfiguration>, { message }));
    };
    const rules = UNIVERSITY_RULES.find((item) => item.universityId === form.university);
    const weighted = form.meritMethod === "weighted";
    const scoredStages = form.stages.filter((stage) => stage.scored);
    const tieBreakers = rules?.tieBreakers.filter((rule) => !rule.stage || scoredStages.some((stage) => stage.id === rule.stage)) ?? [];
    const setField = <K extends keyof SelectionConfiguration>(key: K, value: SelectionConfiguration[K]) => {
        setForm((current) => ({ ...current, [key]: value }));
        setErrors({});
    };
    const toggleStage = (id: StageId, selected: boolean) => {
        setForm((current) => ({
            ...current,
            stages: selected
                ? [...current.stages, { id, order: String(current.stages.length + 1), scored: true, marks: "", weightage: "", qualifyingScore: "" }]
                : current.stages.filter((stage) => stage.id !== id).sort((a, b) => Number(a.order) - Number(b.order)).map((stage, index) => ({ ...stage, order: String(index + 1) })),
            firstTieBreaker: current.firstTieBreaker === id && !selected ? "" : current.firstTieBreaker,
            secondTieBreaker: current.secondTieBreaker === id && !selected ? "" : current.secondTieBreaker,
            exemptionRule: id === "written" && !selected ? "" : current.exemptionRule,
        }));
        setErrors({});
    };
    const changeStage = (index: number, change: Partial<SelectionConfiguration["stages"][number]>) => {
        setForm((current) => ({ ...current, stages: current.stages.map((stage, i) => i === index ? { ...stage, ...change } : stage) }));
        setErrors({});
    };
    const save = () => {
        const result = selectionSchema.safeParse(form);
        if (!result.success) {
            const next: Record<string, string> = {};
            result.error.issues.forEach((issue) => { next[issue.path.join(".")] ??= issue.message; });
            setErrors(next);
            return;
        }
        try {
            const record = saveSelectionDraft(result.data, editingId, role);
            setEditingId(record.id); setRecords(readSelectionRecords());
        } catch (error) { showToast.error("Cannot save configuration", error instanceof Error ? error.message : "Save failed"); return; }
        setErrors({});
        showToast.success("Selection configuration saved", "Draft and change history retained for this browser session.");
    };
    const revise = (row: SelectionRecord) => {
        try { const draft = reviseSelection(row.id, role); setRecords(readSelectionRecords()); load(draft); }
        catch (error) { showToast.error("Cannot create revision", error instanceof Error ? error.message : "Revision failed"); }
    };
    const confirmTransition = () => {
        if (!pending) return;
        try { transitionSelection(pending.row.id, pending.status, role); setRecords(readSelectionRecords()); setPending(null); showToast.success("Configuration updated"); }
        catch (error) { showToast.error("Cannot update configuration", error instanceof Error ? error.message : "Update failed"); setPending(null); }
    };
    const changeUniversity = (value: string | number) => { setForm((current) => ({ ...current, university: String(value), meritMethod: "", firstTieBreaker: "", secondTieBreaker: "", exemptionRule: "" })); setErrors({}); };
    const showHistory = (row: SelectionRecord) => setHistory(readSelectionChanges(row.id));
    const resetForm = () => { methods.reset(structuredClone(selectedRecord?.configuration ?? EMPTY_CONFIGURATION)); setErrors({}); };
    return { methods, role, records, selectedRecord, locked, pending, setPending, history, setHistory, form, errors, rules, weighted, scoredStages, tieBreakers, setField, toggleStage, changeStage, save, load, revise, confirmTransition, changeUniversity, showHistory, resetForm };
}
