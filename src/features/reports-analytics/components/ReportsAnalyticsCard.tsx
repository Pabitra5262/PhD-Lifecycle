import { ClipboardCheck, Files, GraduationCap, Timer, Users } from "lucide-react";
import { KpiCard } from "@mfe/components";
import { LifecycleFormCard } from "@/features/lifecycle-shared/components/LifecycleFormCard";
import { lifecycleIndicatorSummaries } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { LifecycleController } from "@/features/lifecycle-shared/hooks/useLifecyclePage";

const indicatorIcons = [Users, Files, Timer, ClipboardCheck, GraduationCap];
export function ReportsAnalyticsCard({ controller }: { controller: LifecycleController }) {
    const indicators = lifecycleIndicatorSummaries(controller.rows);
    return <>
        <LifecycleFormCard controller={{ ...controller, fields: controller.fields.filter((field) => field.name !== "indicators") }} />
        <section aria-label="Dashboard Indicators" className="my-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {indicators.map((indicator, index) => <KpiCard key={indicator.label} label={indicator.label} value={indicator.count} icon={indicatorIcons[index]} note={indicator.statusSummary || undefined} />)}
        </section>
    </>;
}
