import { DialogModal } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { CourseworkExamsCard } from "../components/CourseworkExamsCard";
import { useCourseworkExams } from "../hooks/useCourseworkExams";
export default function CourseworkExamsPage() {
    const controller = useCourseworkExams();
    return <>
        <PageHeader title={controller.def.title} />
        <CourseworkExamsCard controller={controller} />
        <LifecycleList controller={controller} />
        <DialogModal isOpen={controller.pending !== null} title={controller.def.title} message="Submit this record for the configured lifecycle workflow?" onClose={() => controller.setPending(null)} onConfirm={controller.confirm} />
    </>;
}
