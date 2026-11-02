import { makeFeatureService, recordOptions, scopedScholars } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, courseworkExamsFields } from "../form-config/courseworkExams.fields";
import { courseworkExamsSchema } from "../validation/courseworkExamsSchema";
const base = makeFeatureService(definition);
export const courseworkExamsService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = courseworkExamsFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        courseworkExamsSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
};
