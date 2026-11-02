import { makeFeatureService, recordOptions, scopedScholars } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, thesisSubmissionFields } from "../form-config/thesisSubmission.fields";
import { thesisSubmissionSchema } from "../validation/thesisSubmissionSchema";
const base = makeFeatureService(definition);
export const thesisSubmissionService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = thesisSubmissionFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        thesisSubmissionSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
};
