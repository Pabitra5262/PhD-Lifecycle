import { makeFeatureService, recordOptions, scopedScholars, readLifecycleReport } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, reportsAnalyticsFields } from "../form-config/reportsAnalytics.fields";
import { reportsAnalyticsSchema } from "../validation/reportsAnalyticsSchema";
import { lifecycleFeatures } from "@/features/lifecycle-shared/featureRegistry";
const base = makeFeatureService(definition);
export const reportsAnalyticsService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = reportsAnalyticsFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        reportsAnalyticsSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
    read: (actor) => readLifecycleReport(actor, {}, lifecycleFeatures),
    generate: (actor, values) => readLifecycleReport(actor, values, lifecycleFeatures),
};
