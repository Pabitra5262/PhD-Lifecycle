import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, degreeAwardFields } from "../form-config/degreeAward.fields";
import { degreeAwardService } from "../service/degreeAwardService";
export const useDegreeAward = () => useLifecyclePage(definition, degreeAwardService, degreeAwardFields);
