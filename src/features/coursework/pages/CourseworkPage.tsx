import { DialogModal } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { CourseworkCard } from "../components/CourseworkCard";
import { useCoursework } from "../hooks/useCoursework";
export default function CourseworkPage() {
    const controller = useCoursework();
    return <>
        <PageHeader title={controller.def.title} />
        <CourseworkCard controller={controller} />
        <LifecycleList controller={controller} />
        <DialogModal isOpen={controller.pending !== null} title={controller.def.title} message="Submit this record for the configured lifecycle workflow?" onClose={() => controller.setPending(null)} onConfirm={controller.confirm} />
    </>;
}
