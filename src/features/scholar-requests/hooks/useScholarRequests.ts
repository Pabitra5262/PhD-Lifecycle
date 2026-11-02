import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, scholarRequestsFields } from "../form-config/scholarRequests.fields";
import { scholarRequestsService } from "../service/scholarRequestsService";
export const useScholarRequests = () => useLifecyclePage(definition, scholarRequestsService, scholarRequestsFields);
