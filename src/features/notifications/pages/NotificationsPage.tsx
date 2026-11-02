import PageHeader from "@/shared/components/layout/PageHeader";
import { LifecycleList } from "@/features/lifecycle-shared/components/LifecycleList";
import { useNotifications } from "../hooks/useNotifications";
export default function NotificationsPage() {
    const controller = useNotifications();
    return <>
        <PageHeader title={controller.def.title} />
        <LifecycleList controller={controller} />
    </>;
}
