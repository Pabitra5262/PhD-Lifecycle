import { DialogModal } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { ResultsAdmissionCard } from "../components/ResultsAdmissionCard";
import { useResultsAdmission } from "../hooks/useResultsAdmission";
export default function ResultsAdmissionPage() {
    const controller = useResultsAdmission();
    return <>
        <PageHeader title={controller.def.title} />
        <ResultsAdmissionCard controller={controller} />
        <LifecycleList controller={controller} />
        <DialogModal isOpen={controller.pending !== null} title={controller.def.title} message="Submit this record for the configured lifecycle workflow?" onClose={() => controller.setPending(null)} onConfirm={controller.confirm} />
    </>;
}
