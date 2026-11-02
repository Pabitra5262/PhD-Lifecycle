import type { Values, RecordRow } from "@/features/lifecycle-shared/types";
export interface ThesisSubmissionValues extends Values {
    scholar: string;
    registrationNumber: string;
    thesisTitle: string;
    abstract: string;
    keywords: string;
    thesisFile: File | null;
    supportingDocument: File | null;
    similarity: string;
    similarityReport: File | null;
    submissionDate: string;
    departmentVerification: string;
    submissionStatus: string;
}
export type ThesisSubmissionRecord = RecordRow;
