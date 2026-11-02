import type { Values, RecordRow } from "@/features/lifecycle-shared/types";
export interface DegreeAwardValues extends Values {
    scholar: string;
    awardRecommendation: string;
    approvalDecision: string;
    remarks: string;
    degreeAwardDate: string;
    provisionalNumber: string;
    provisionalIssueDate: string;
    convocation: string;
    finalDegreeNumber: string;
    finalDegreeDate: string;
    archive: string;
}
export type DegreeAwardRecord = RecordRow;
