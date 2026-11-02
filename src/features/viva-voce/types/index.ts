import type { Values, RecordRow } from "@/features/lifecycle-shared/types";
export interface VivaVoceValues extends Values {
    scholar: string;
    panel: string[];
    schedule: string;
    venue: string;
    notification: string;
    attendance: string;
    proceedings: string;
    outcome: string;
    recommendation: string;
}
export type VivaVoceRecord = RecordRow;
