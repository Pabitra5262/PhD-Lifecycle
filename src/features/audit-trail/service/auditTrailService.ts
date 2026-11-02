import { makeFeatureService, recordOptions, scopedScholars } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, auditTrailFields } from "../form-config/auditTrail.fields";
import { auditTrailSchema } from "../validation/auditTrailSchema";
const base = makeFeatureService(definition);
export const auditTrailService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = auditTrailFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        auditTrailSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
};
