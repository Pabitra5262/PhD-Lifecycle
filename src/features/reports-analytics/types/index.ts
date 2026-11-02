import type { Values, RecordRow } from "@/features/lifecycle-shared/types";
export interface ReportsAnalyticsValues extends Values {
    reportType: string;
    university: string;
    department: string;
    academicSession: string;
    lifecycleStage: string;
    fromDate: string;
    toDate: string;
    indicators: string;
}
export type ReportsAnalyticsRecord = RecordRow;
