import type { Values, RecordRow } from "@/features/lifecycle-shared/types";
export interface ProgressMonitoringValues extends Values {
    scholar: string;
    reportingPeriod: string;
    researchStage: string;
    progressDescription: string;
    supportingDocument: File | null;
    supervisorRemarks: string;
    committeeEvaluation: string;
    status: string;
}
export type ProgressMonitoringRecord = RecordRow;
