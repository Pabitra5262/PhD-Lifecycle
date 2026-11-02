import type { Values, RecordRow } from "@/features/lifecycle-shared/types";
export interface PreSubmissionSeminarValues extends Values {
    scholar: string;
    thesisTitle: string;
    schedule: string;
    venue: string;
    panel: string[];
    presentation: File | null;
    attendance: string;
    recommendations: string;
    outcome: string;
}
export type PreSubmissionSeminarRecord = RecordRow;
