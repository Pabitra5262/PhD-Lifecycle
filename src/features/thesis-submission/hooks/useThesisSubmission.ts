import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, thesisSubmissionFields } from "../form-config/thesisSubmission.fields";
import { thesisSubmissionService } from "../service/thesisSubmissionService";
export const useThesisSubmission = () => useLifecyclePage(definition, thesisSubmissionService, thesisSubmissionFields);
