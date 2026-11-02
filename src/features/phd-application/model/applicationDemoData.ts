import { demoCandidateProfile } from "@/features/candidate-profile/model/candidateProfileData";
import { findAdvertisement } from "./advertisements";
import { emptyApplication } from "./applicationForm";
import type { PhdApplication } from "../types/application.types";

/** Read-only examples for the dummy login; never inserted into submission/payment stores. */
export const demoApplications = (candidateId: string): PhdApplication[] => {
    const source = findAdvertisement("PHD-DEMO-CS");
    if (!source) return [];
    const statuses: PhdApplication["status"][] = ["Submitted", "Under Scrutiny", "Eligible", "Ineligible", "Draft"];
    return statuses.map((status, index) => {
        const id = `APPLICATION-PREVIEW-${index + 1}`;
        const advertisement = { ...source, id: `ADVERTISEMENT-PREVIEW-${index + 1}`, number: `PHD/ADM/2027/01${index + 1}`, title: `PhD Admission - ${["Artificial Intelligence", "Data Science", "Cyber Security", "Machine Learning", "Computer Networks"][index]}` };
        return {
            id, reference: `PHD/APP/2027/00${index + 1}`, status, advertisement,
            form: { ...emptyApplication(advertisement.id), researchArea: advertisement.title.replace("PhD Admission - ", ""), synopsis: `Research in ${advertisement.title.replace("PhD Admission - ", "")}.` },
            profile: demoCandidateProfile(candidateId), paymentStatus: "Not Required", selectionStages: ["written", "interview", "synopsis"],
            submittedAt: status === "Draft" ? undefined : new Date().toISOString(),
            scrutinyOutcome: status === "Eligible" || status === "Ineligible" ? status : undefined,
            scrutinyRemarks: status === "Ineligible" ? "Academic eligibility requirements not met." : undefined,
        };
    });
};
