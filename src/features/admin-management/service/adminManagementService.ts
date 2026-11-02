import { makeFeatureService, recordOptions, scopedScholars } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, adminManagementFields } from "../form-config/adminManagement.fields";
import { adminManagementSchema } from "../validation/adminManagementSchema";
const base = makeFeatureService(definition);
export const adminManagementService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = adminManagementFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        adminManagementSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
};
