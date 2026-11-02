import { makeFeatureService, recordOptions, scopedScholars } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, resultsAdmissionFields } from "../form-config/resultsAdmission.fields";
import { resultsAdmissionSchema } from "../validation/resultsAdmissionSchema";
const base = makeFeatureService(definition);
export const resultsAdmissionService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = resultsAdmissionFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        resultsAdmissionSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
};
