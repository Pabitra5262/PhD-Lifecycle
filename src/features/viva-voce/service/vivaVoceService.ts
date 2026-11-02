import { makeFeatureService, recordOptions, scopedScholars } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, vivaVoceFields } from "../form-config/vivaVoce.fields";
import { vivaVoceSchema } from "../validation/vivaVoceSchema";
const base = makeFeatureService(definition);
export const vivaVoceService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = vivaVoceFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        vivaVoceSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
};
