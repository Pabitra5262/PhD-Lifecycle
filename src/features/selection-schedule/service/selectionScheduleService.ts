import { makeFeatureService, recordOptions, scopedScholars } from "@/features/lifecycle-shared/service/lifecycleStore";
import type { FeatureService } from "@/features/lifecycle-shared/types";
import { definition, selectionScheduleFields } from "../form-config/selectionSchedule.fields";
import { selectionScheduleSchema } from "../validation/selectionScheduleSchema";
const base = makeFeatureService(definition);
export const selectionScheduleService: FeatureService = {
    ...base,
    save: (actor, values, grids, _fields, id) => {
        const fields = selectionScheduleFields({ actor, values, options: recordOptions(actor, definition.key, values), scholars: scopedScholars(actor, definition.key) });
        selectionScheduleSchema(fields, grids, actor).parse(values);
        return base.save(actor, values, grids, fields, id);
    },
};
