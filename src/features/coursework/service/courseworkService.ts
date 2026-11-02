import { makeFeatureService, recordOptions, scopedScholars } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, courseworkFields } from "../form-config/coursework.fields";
import { courseworkSchema } from "../validation/courseworkSchema";
const base = makeFeatureService(definition);
export const courseworkService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = courseworkFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        courseworkSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
};
