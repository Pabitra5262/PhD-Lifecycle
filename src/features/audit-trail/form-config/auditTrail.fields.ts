import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";

export const definition: Definition = {
    key: "auditTrail",
    feature: "audit-trail",
    uc: 21,
    title: "Audit Trail",
    path: "/phd/administration/audit-trail",
    menu: ["Administration"],
    roles: ["University Authority", "Authorized HED Official / Auditor"],
    writers: [],
    readOnly: true,
    grids: [],
    columns: [{
         name: "actionType",
         label: "Action Type",
     }, {
         name: "recordReference",
         label: "Record Reference",
     }, {
         name: "userTimestamp",
         label: "User Timestamp",
     }, {
         name: "changeDetails",
         label: "Change Details",
     }],
};

export function auditTrailFields(..._args: [FieldContext]): FormField[] {
    void _args;
    return [];
}
