import { makeFeatureService, recordOptions, scopedScholars } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, researchRegistrationFields } from "../form-config/researchRegistration.fields";
import { researchRegistrationSchema } from "../validation/researchRegistrationSchema";
const base = makeFeatureService(definition);
export const researchRegistrationService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = researchRegistrationFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        researchRegistrationSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
};
