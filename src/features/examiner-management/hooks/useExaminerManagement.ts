import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, examinerManagementFields } from "../form-config/examinerManagement.fields";
import { examinerManagementService } from "../service/examinerManagementService";
export const useExaminerManagement = () => useLifecyclePage(definition, examinerManagementService, examinerManagementFields);
