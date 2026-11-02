import { makeFeatureService, recordOptions, scopedScholars } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, scholarRequestsFields } from "../form-config/scholarRequests.fields";
import { scholarRequestsSchema } from "../validation/scholarRequestsSchema";
const base = makeFeatureService(definition);
export const scholarRequestsService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = scholarRequestsFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        scholarRequestsSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
};
