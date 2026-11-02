import { DialogModal } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { ProgressMonitoringCard } from "../components/ProgressMonitoringCard";
import { useProgressMonitoring } from "../hooks/useProgressMonitoring";
export default function ProgressMonitoringPage() {
    const controller = useProgressMonitoring();
    return <>
        <PageHeader title={controller.def.title} />
        <ProgressMonitoringCard controller={controller} />
        <LifecycleList controller={controller} />
        <DialogModal isOpen={controller.pending !== null} title={controller.def.title} message="Submit this record for the configured lifecycle workflow?" onClose={() => controller.setPending(null)} onConfirm={controller.confirm} />
    </>;
}
