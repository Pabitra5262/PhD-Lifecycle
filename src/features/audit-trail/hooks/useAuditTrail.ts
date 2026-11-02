import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, auditTrailFields } from "../form-config/auditTrail.fields";
import { auditTrailService } from "../service/auditTrailService";
export const useAuditTrail = () => useLifecyclePage(definition, auditTrailService, auditTrailFields);
