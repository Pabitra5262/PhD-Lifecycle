import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, vivaVoceFields } from "../form-config/vivaVoce.fields";
import { vivaVoceService } from "../service/vivaVoceService";
export const useVivaVoce = () => useLifecyclePage(definition, vivaVoceService, vivaVoceFields);
