import { LifecycleFormCard } from "@/features/lifecycle-shared/components/LifecycleFormCard";
import type { LifecycleController } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
export const ProgressMonitoringCard = ({ controller }: { controller: LifecycleController }) => <LifecycleFormCard controller={controller} />;
