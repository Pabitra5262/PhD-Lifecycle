import { makeFeatureService, recordOptions, scopedScholars } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, progressMonitoringFields } from "../form-config/progressMonitoring.fields";
import { progressMonitoringSchema } from "../validation/progressMonitoringSchema";
const base = makeFeatureService(definition);
export const progressMonitoringService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = progressMonitoringFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        progressMonitoringSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
};
