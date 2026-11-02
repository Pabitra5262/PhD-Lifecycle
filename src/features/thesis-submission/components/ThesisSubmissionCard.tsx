import { LifecycleFormCard } from "@/features/lifecycle-shared/components/LifecycleFormCard";
import type { LifecycleController } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
export const ThesisSubmissionCard = ({ controller }: { controller: LifecycleController }) => <LifecycleFormCard controller={controller} />;
