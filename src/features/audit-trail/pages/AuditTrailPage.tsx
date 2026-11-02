import PageHeader from "@/shared/components/layout/PageHeader";
import { AuditTrailList } from "../components/AuditTrailList";
import { useAuditTrail } from "../hooks/useAuditTrail";
export default function AuditTrailPage() {
    const controller = useAuditTrail();
    return <>
        <PageHeader title={controller.def.title} />
        <AuditTrailList controller={controller} />
    </>;
}
