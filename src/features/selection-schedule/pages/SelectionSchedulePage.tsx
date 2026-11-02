import { DialogModal } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { SelectionScheduleCard } from "../components/SelectionScheduleCard";
import { useSelectionSchedule } from "../hooks/useSelectionSchedule";
export default function SelectionSchedulePage() {
    const controller = useSelectionSchedule();
    return <>
        <PageHeader title={controller.def.title} />
        <SelectionScheduleCard controller={controller} />
        <LifecycleList controller={controller} />
        <DialogModal isOpen={controller.pending !== null} title={controller.def.title} message="Submit this record for the configured lifecycle workflow?" onClose={() => controller.setPending(null)} onConfirm={controller.confirm} />
    </>;
}
