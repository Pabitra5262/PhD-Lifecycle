import type { CandidateProfile } from "@/features/candidate-profile/model/candidateProfile";
import type { ScrutinyDecision, ScrutinyEvent } from "@/features/application-scrutiny/model/scrutinyRules";
import type { AdmissionAdvertisement } from "./advertisement.types";

export interface ApplicationForm {
    advertisement: string; researchArea: string; synopsis: string; synopsisFile: File | null;
    documents: Record<string, File | null>; eligibilityConfirmed: boolean; declaration: boolean;
}
export interface PhdApplication {
    id: string; reference: string; status: "Draft" | "Submitted" | "Under Scrutiny" | "Returned" | "Eligible" | "Ineligible"; form: ApplicationForm;
    advertisement: AdmissionAdvertisement; profile: CandidateProfile | null; submittedAt?: string;
    paymentStatus: "Not Required" | "Exempt" | "Pending" | "Success"; paymentReference?: string;
    selectionStages: string[];
    pendingWith?: string; scrutinyOutcome?: ScrutinyDecision; scrutinyRemarks?: string; correctionUntil?: string; returnTo?: string;
    scrutinyHistory?: ScrutinyEvent[]; resubmittedAt?: string;
}
export interface CandidateApplicationNotification { id: string; applicationId: string; date: string; message: string }
