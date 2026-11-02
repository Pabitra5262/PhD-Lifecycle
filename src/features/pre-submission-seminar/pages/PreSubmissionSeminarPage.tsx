import { DialogModal } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { PreSubmissionSeminarCard } from "../components/PreSubmissionSeminarCard";
import { usePreSubmissionSeminar } from "../hooks/usePreSubmissionSeminar";
export default function PreSubmissionSeminarPage() {
    const controller = usePreSubmissionSeminar();
    return <>
        <PageHeader title={controller.def.title} />
        <PreSubmissionSeminarCard controller={controller} />
        <LifecycleList controller={controller} />
        <DialogModal isOpen={controller.pending !== null} title={controller.def.title} message="Submit this record for the configured lifecycle workflow?" onClose={() => controller.setPending(null)} onConfirm={controller.confirm} />
    </>;
}
