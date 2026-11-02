import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, courseworkExamsFields } from "../form-config/courseworkExams.fields";
import { courseworkExamsService } from "../service/courseworkExamsService";
export const useCourseworkExams = () => useLifecyclePage(definition, courseworkExamsService, courseworkExamsFields);
