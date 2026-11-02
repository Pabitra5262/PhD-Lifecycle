import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, resultsAdmissionFields } from "../form-config/resultsAdmission.fields";
import { resultsAdmissionService } from "../service/resultsAdmissionService";
export const useResultsAdmission = () => useLifecyclePage(definition, resultsAdmissionService, resultsAdmissionFields);
