import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, progressMonitoringFields } from "../form-config/progressMonitoring.fields";
import { progressMonitoringService } from "../service/progressMonitoringService";
export const useProgressMonitoring = () => useLifecyclePage(definition, progressMonitoringService, progressMonitoringFields);
