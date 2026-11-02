import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, selectionScheduleFields } from "../form-config/selectionSchedule.fields";
import { selectionScheduleService } from "../service/selectionScheduleService";
export const useSelectionSchedule = () => useLifecyclePage(definition, selectionScheduleService, selectionScheduleFields);
