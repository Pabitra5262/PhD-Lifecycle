import { DialogModal } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { VivaVoceCard } from "../components/VivaVoceCard";
import { useVivaVoce } from "../hooks/useVivaVoce";
export default function VivaVocePage() {
    const controller = useVivaVoce();
    return <>
        <PageHeader title={controller.def.title} />
        <VivaVoceCard controller={controller} />
        <LifecycleList controller={controller} />
        <DialogModal isOpen={controller.pending !== null} title={controller.def.title} message="Submit this record for the configured lifecycle workflow?" onClose={() => controller.setPending(null)} onConfirm={controller.confirm} />
    </>;
}
