import { DialogModal } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { ResearchRegistrationCard } from "../components/ResearchRegistrationCard";
import { useResearchRegistration } from "../hooks/useResearchRegistration";
export default function ResearchRegistrationPage() {
    const controller = useResearchRegistration();
    return <>
        <PageHeader title={controller.def.title} />
        <ResearchRegistrationCard controller={controller} />
        <LifecycleList controller={controller} />
        <DialogModal isOpen={controller.pending !== null} title={controller.def.title} message="Submit this record for the configured lifecycle workflow?" onClose={() => controller.setPending(null)} onConfirm={controller.confirm} />
    </>;
}
