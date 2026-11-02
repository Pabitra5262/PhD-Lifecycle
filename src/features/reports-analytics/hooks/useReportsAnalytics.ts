import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, reportsAnalyticsFields } from "../form-config/reportsAnalytics.fields";
import { reportsAnalyticsService } from "../service/reportsAnalyticsService";
export const useReportsAnalytics = () => useLifecyclePage(definition, reportsAnalyticsService, reportsAnalyticsFields);
