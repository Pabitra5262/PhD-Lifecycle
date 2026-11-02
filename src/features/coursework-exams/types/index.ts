import type { Values, RecordRow } from "@/features/lifecycle-shared/types";
export interface CourseworkExamsValues extends Values {
    scholar: string;
    examinationDate: string;
    marks: string;
    result: string;
    completionStatus: string;
    certificateNumber: string;
    issueDate: string;
    signatory: string;
}
export type CourseworkExamsRecord = RecordRow;
