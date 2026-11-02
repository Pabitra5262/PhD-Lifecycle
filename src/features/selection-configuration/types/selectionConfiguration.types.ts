import type { z } from "zod";
import type { selectionSchema } from "../validation/selectionConfigurationSchema";
import type { STAGES } from "../form-config/selectionConfigurationConfig";

export type StageId = typeof STAGES[number]["id"];
export type SelectionConfiguration = z.infer<typeof selectionSchema>;
export type ConfigurationStatus = "Draft" | "Approved" | "Active";
export interface SelectionRecord { id: string; revisionOf?: string; version: number; status: ConfigurationStatus; configuration: SelectionConfiguration; updatedAt: string }
export interface ConfigurationChange { recordId: string; action: string; date: string; role: string; before: SelectionConfiguration | null; after: SelectionConfiguration; previousStatus?: ConfigurationStatus; status: ConfigurationStatus }

export interface SelectionFilters { university: string; academicSession: string; stage: string; status: string }
export interface SelectionConfigurationListProps {
    records: SelectionRecord[];
    onView: (row: SelectionRecord) => void;
    onEdit: (row: SelectionRecord) => void;
    onApprove: (row: SelectionRecord) => void;
    onActivate: (row: SelectionRecord) => void;
    onRevise: (row: SelectionRecord) => void;
    onHistory: (row: SelectionRecord) => void;
}
