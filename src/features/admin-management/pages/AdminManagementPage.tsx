import { DialogModal } from "@mfe/components";
import { useState } from "react";
import type { RecordRow } from "@/features/lifecycle-shared/types";
import { AdminManagementViewModal } from "../components/AdminManagementViewModal";
import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { AdminManagementCard } from "../components/AdminManagementCard";
import { useAdminManagement } from "../hooks/useAdminManagement";
export default function AdminManagementPage() {
    const controller = useAdminManagement();
    const [preview, setPreview] = useState<RecordRow | null>(null);
    return <>
        <PageHeader title={controller.def.title} />
        <AdminManagementCard controller={controller} />
        <LifecycleList controller={{ ...controller, view: setPreview }} />
        <AdminManagementViewModal record={preview} controller={controller} onClose={() => setPreview(null)} />
        <DialogModal isOpen={controller.pending !== null} title={controller.def.title} message="Submit this record for the configured lifecycle workflow?" onClose={() => controller.setPending(null)} onConfirm={controller.confirm} />
    </>;
}
