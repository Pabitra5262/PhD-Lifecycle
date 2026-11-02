import type { Values, RecordRow } from "@/features/lifecycle-shared/types";
export interface ResultsAdmissionValues extends Values {
    advertisement: string;
    meritScore: string;
    meritRank: string;
    selectionStatus: string;
    remarks: string;
    offerLetter: File | null;
    acceptance: string;
}
export type ResultsAdmissionRecord = RecordRow;
