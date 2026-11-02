import { useState } from "react";
import { EMPTY_FILTERS } from "../form-config/selectionConfigurationConfig";
import type { SelectionRecord } from "../types/selectionConfiguration.types";

export function useSelectionConfigurationFilters(records: SelectionRecord[]) {
    const empty = EMPTY_FILTERS;
    const [filters, setFilters] = useState(empty);
    const [applied, setApplied] = useState(empty);
    const shown = records.filter((row) => (!applied.university || row.configuration.university === applied.university) && (!applied.academicSession || row.configuration.academicSession === applied.academicSession) && (!applied.stage || row.configuration.stages.some((stage) => stage.id === applied.stage)) && (!applied.status || row.status === applied.status));
    const apply = () => setApplied({ ...filters });
    const reset = () => { setFilters(empty); setApplied(empty); };
    return { filters, setFilters, applied, shown, apply, reset };
}
