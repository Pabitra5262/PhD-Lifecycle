import { DialogModal } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { AdminManagementCard } from "../components/AdminManagementCard";
import { useAdminManagement } from "../hooks/useAdminManagement";
export default function AdminManagementPage() {
    const controller = useAdminManagement();
    return <>
        <PageHeader title={controller.def.title} />
        <AdminManagementCard controller={controller} />
        <LifecycleList controller={controller} />
        <DialogModal isOpen={controller.pending !== null} title={controller.def.title} message="Submit this record for the configured lifecycle workflow?" onClose={() => controller.setPending(null)} onConfirm={controller.confirm} />
    </>;
}
