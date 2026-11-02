import { LifecycleFormCard } from "@/features/lifecycle-shared/components/LifecycleFormCard";
import type { LifecycleController } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
export const AdminManagementCard = ({ controller }: { controller: LifecycleController }) => <LifecycleFormCard controller={controller} />;
