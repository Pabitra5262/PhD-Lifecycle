import type { Values, RecordRow } from "@/features/lifecycle-shared/types";
export interface ExaminerManagementValues extends Values {
    scholar: string;
    examinerName: string;
    affiliation: string;
    email: string;
    mobile: string;
    approvalStatus: string;
    approvalDate: string;
    appointmentDate: string;
    dispatchDate: string;
    dueDate: string;
    examinerReport: File | null;
    recommendation: string;
    evaluationStatus: string;
}
export type ExaminerManagementRecord = RecordRow;
