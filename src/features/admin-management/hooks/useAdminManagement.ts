import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, adminManagementFields } from "../form-config/adminManagement.fields";
import { adminManagementService } from "../service/adminManagementService";
export const useAdminManagement = () => useLifecyclePage(definition, adminManagementService, adminManagementFields);
