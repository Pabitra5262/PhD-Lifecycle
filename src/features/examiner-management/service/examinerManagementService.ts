import { makeFeatureService, recordOptions, scopedScholars } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, examinerManagementFields } from "../form-config/examinerManagement.fields";
import { examinerManagementSchema } from "../validation/examinerManagementSchema";
const base = makeFeatureService(definition);
export const examinerManagementService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = examinerManagementFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        examinerManagementSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
};
