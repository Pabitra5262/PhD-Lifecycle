import { DialogModal } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { ExaminerManagementCard } from "../components/ExaminerManagementCard";
import { useExaminerManagement } from "../hooks/useExaminerManagement";
export default function ExaminerManagementPage() {
    const controller = useExaminerManagement();
    return <>
        <PageHeader title={controller.def.title} />
        <ExaminerManagementCard controller={controller} />
        <LifecycleList controller={controller} />
        <DialogModal isOpen={controller.pending !== null} title={controller.def.title} message="Submit this record for the configured lifecycle workflow?" onClose={() => controller.setPending(null)} onConfirm={controller.confirm} />
    </>;
}
