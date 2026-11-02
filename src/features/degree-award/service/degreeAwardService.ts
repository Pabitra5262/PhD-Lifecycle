import { makeFeatureService, recordOptions, scopedScholars } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, degreeAwardFields } from "../form-config/degreeAward.fields";
import { degreeAwardSchema } from "../validation/degreeAwardSchema";
const base = makeFeatureService(definition);
export const degreeAwardService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = degreeAwardFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        degreeAwardSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
};
