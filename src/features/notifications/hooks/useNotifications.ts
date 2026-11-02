import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, notificationsFields } from "../form-config/notifications.fields";
import { notificationsService } from "../service/notificationsService";
export const useNotifications = () => useLifecyclePage(definition, notificationsService, notificationsFields);
