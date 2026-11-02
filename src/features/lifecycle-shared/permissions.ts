import { srsActors } from "@/features/shared/srsActors";
export const lifecycleRolePermissions: Record<string, string[]> = Object.fromEntries(srsActors.map((actor) => [actor.label, [...actor.pages]]));
