import { makeFeatureService, recordOptions, scopedScholars } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, preSubmissionSeminarFields } from "../form-config/preSubmissionSeminar.fields";
import { preSubmissionSeminarSchema } from "../validation/preSubmissionSeminarSchema";
const base = makeFeatureService(definition);
export const preSubmissionSeminarService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = preSubmissionSeminarFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        preSubmissionSeminarSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
};
