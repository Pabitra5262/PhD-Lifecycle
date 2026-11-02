import { DialogModal } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { ScholarRequestsCard } from "../components/ScholarRequestsCard";
import { useScholarRequests } from "../hooks/useScholarRequests";
export default function ScholarRequestsPage() {
    const controller = useScholarRequests();
    return <>
        <PageHeader title={controller.actor.role === "Student / Candidate / Scholar" ? "My Requests / Issues" : "Request Management"} />
        <ScholarRequestsCard controller={controller} />
        <LifecycleList controller={controller} />
        <DialogModal isOpen={controller.pending !== null} title={controller.def.title} message="Submit this record for the configured lifecycle workflow?" onClose={() => controller.setPending(null)} onConfirm={controller.confirm} />
    </>;
}
