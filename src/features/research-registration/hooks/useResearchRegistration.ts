import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, researchRegistrationFields } from "../form-config/researchRegistration.fields";
import { researchRegistrationService } from "../service/researchRegistrationService";
export const useResearchRegistration = () => useLifecyclePage(definition, researchRegistrationService, researchRegistrationFields);
