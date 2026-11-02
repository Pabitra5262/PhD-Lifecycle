import { makeFeatureService, recordOptions, scopedScholars } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, notificationsFields } from "../form-config/notifications.fields";
import { notificationsSchema } from "../validation/notificationsSchema";
const base = makeFeatureService(definition);
export const notificationsService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = notificationsFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        notificationsSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
};
