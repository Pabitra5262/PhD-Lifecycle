import { lifecycleSchema } from "@/features/lifecycle-shared/validation/lifecycleValidation";
import type { Actor, Values } from "@/features/lifecycle-shared/types";
import type { FormField } from "@/shared/components/ui/Forms";
import { definition } from "../form-config/preSubmissionSeminar.fields";
export const preSubmissionSeminarSchema = (fields: FormField[], grids: Record<string, Values[]>, actor: Actor) => lifecycleSchema(definition, fields, grids, actor);
