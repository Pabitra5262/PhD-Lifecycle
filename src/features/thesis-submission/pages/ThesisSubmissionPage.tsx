import { DialogModal } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { ThesisSubmissionCard } from "../components/ThesisSubmissionCard";
import { useThesisSubmission } from "../hooks/useThesisSubmission";
export default function ThesisSubmissionPage() {
    const controller = useThesisSubmission();
    return <>
        <PageHeader title={controller.def.title} />
        <ThesisSubmissionCard controller={controller} />
        <LifecycleList controller={controller} />
        <DialogModal isOpen={controller.pending !== null} title={controller.def.title} message="Submit this record for the configured lifecycle workflow?" onClose={() => controller.setPending(null)} onConfirm={controller.confirm} />
    </>;
}
