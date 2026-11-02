import type { Values, RecordRow } from "@/features/lifecycle-shared/types";
export interface ScholarRequestsValues extends Values {
    scholar: string;
    reference: string;
    requestType: string;
    description: string;
    supportingDocument: File | null;
    submissionDate: string;
    assignedAuthority: string;
    remarks: string;
    decision: string;
    status: string;
    resolutionDate: string;
}
export type ScholarRequestsRecord = RecordRow;
