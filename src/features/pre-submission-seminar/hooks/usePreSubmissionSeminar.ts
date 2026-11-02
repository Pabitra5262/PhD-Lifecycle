import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, preSubmissionSeminarFields } from "../form-config/preSubmissionSeminar.fields";
import { preSubmissionSeminarService } from "../service/preSubmissionSeminarService";
export const usePreSubmissionSeminar = () => useLifecyclePage(definition, preSubmissionSeminarService, preSubmissionSeminarFields);
