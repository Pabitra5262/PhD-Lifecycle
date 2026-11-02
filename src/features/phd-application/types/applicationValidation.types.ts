import type { CandidateProfile } from "@/features/candidate-profile/model/candidateProfile";
import type { AdmissionAdvertisement } from "./advertisement.types";
import type { PhdApplication } from "./application.types";

export interface ApplicationValidationContext {
    advertisement: AdmissionAdvertisement | undefined;
    profile: CandidateProfile | null;
    existing: PhdApplication | undefined;
    paymentStatus: PhdApplication["paymentStatus"];
    workflowActive: boolean;
}
