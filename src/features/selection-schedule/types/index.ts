import type { Values, RecordRow } from "@/features/lifecycle-shared/types";
export interface SelectionScheduleValues extends Values {
    advertisement: string;
    stage: string;
    schedule: string;
    venue: string;
    panel: string[];
}
export type SelectionScheduleRecord = RecordRow;
