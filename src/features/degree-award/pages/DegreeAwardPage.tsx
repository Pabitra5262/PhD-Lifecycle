import { DialogModal } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { DegreeAwardCard } from "../components/DegreeAwardCard";
import { useDegreeAward } from "../hooks/useDegreeAward";
export default function DegreeAwardPage() {
    const controller = useDegreeAward();
    return <>
        <PageHeader title={controller.def.title} />
        <DegreeAwardCard controller={controller} />
        <LifecycleList controller={controller} />
        <DialogModal isOpen={controller.pending !== null} title={controller.def.title} message="Submit this record for the configured lifecycle workflow?" onClose={() => controller.setPending(null)} onConfirm={controller.confirm} />
    </>;
}
