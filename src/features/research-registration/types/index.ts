import type { Values, RecordRow } from "@/features/lifecycle-shared/types";
export interface ResearchRegistrationValues extends Values {
    scholar: string;
    registrationNumber: string;
    registrationDate: string;
    researchTopic: string;
    courseworkStatus: string;
    supervisor: string;
    coSupervisor: string;
    specialization: string;
    workload: string;
    approval: string;
    remarks: string;
    allocationDate: string;
}
export type ResearchRegistrationRecord = RecordRow;
