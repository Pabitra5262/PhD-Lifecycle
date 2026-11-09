import { useEffect } from "react";
import { useLifecyclePage } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import { definition, selectionScheduleFields } from "../form-config/selectionSchedule.fields";
import { selectionScheduleService } from "../service/selectionScheduleService";
export const useSelectionSchedule = () => {
    const controller = useLifecyclePage(definition, selectionScheduleService, selectionScheduleFields);
    const { grids, setGrids, locked } = controller;

    useEffect(() => {
        if (locked || grids.assessments?.length) return;
        setGrids((current) => current.assessments?.length ? current : {
            ...current,
            assessments: [{ candidate: "", attendance: "", marks: "", outcome: "" }],
        });
    }, [grids.assessments, locked, setGrids]);

    return controller;
};
