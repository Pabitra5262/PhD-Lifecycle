import { DialogModal } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { ReportsAnalyticsCard } from "../components/ReportsAnalyticsCard";
import { useReportsAnalytics } from "../hooks/useReportsAnalytics";
export default function ReportsAnalyticsPage() {
    const controller = useReportsAnalytics();
    return <>
        <PageHeader title={controller.def.title} />
        <ReportsAnalyticsCard controller={controller} />
        <LifecycleList controller={controller} />
        <DialogModal isOpen={controller.pending !== null} title={controller.def.title} message="Submit this record for the configured lifecycle workflow?" onClose={() => controller.setPending(null)} onConfirm={controller.confirm} />
    </>;
}
