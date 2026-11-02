import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, courseworkFields } from "../form-config/coursework.fields";
import { courseworkService } from "../service/courseworkService";
export const useCoursework = () => useLifecyclePage(definition, courseworkService, courseworkFields);
