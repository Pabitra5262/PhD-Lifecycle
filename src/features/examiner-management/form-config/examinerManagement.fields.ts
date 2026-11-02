import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";

export const definition: Definition = {
    key: "examinerManagement",
    feature: "examiner-management",
    uc: 16,
    title: "Examiner Management",
    path: "/phd/thesis/examiner-management",
    menu: ["PhD Life Cycle Management", "Thesis"],
    roles: ["University Authority", "University Authority", "Thesis Examiner"],
    writers: ["University Authority", "University Authority", "Thesis Examiner"],
    grids: [{
         name: "nominations",
         label: "Nomination",
         mode: "editable",
         columns: [{
              name: "examinerName",
              label: "Examiner Name",
              required: true,
          }, {
              name: "affiliation",
              label: "Affiliation",
              required: true,
          }, {
              name: "email",
              label: "Email",
              required: true,
          }, {
              name: "mobile",
              label: "Mobile Number",
              required: true,
          }],
         required: true,
     }],
    columns: [{
         name: "scholar",
         label: "Scholar",
     }, {
         name: "examinerName",
         label: "Examiner Name",
     }, {
         name: "affiliation",
         label: "Affiliation",
     }, {
         name: "approvalStatus",
         label: "Approval Status",
     }, {
         name: "appointmentDate",
         label: "Appointment Date",
     }, {
         name: "dispatchDate",
         label: "Dispatch Date",
     }, {
         name: "dueDate",
         label: "Due Date",
     }, {
         name: "recommendation",
         label: "Recommendation",
     }, {
         name: "evaluationStatus",
         label: "Evaluation Status",
     }],
};

export function examinerManagementFields(ctx: FieldContext): FormField[] {
    const fields: FormField[] = [{
     name: "scholar",
     label: "Scholar / Thesis",
     type: "select",
     required: true,
     gridColumn: 4,
     options: ctx.options.scholars,
 }, {
     name: "examinerName",
     label: "Examiner Name",
     type: "text",
     required: true,
     gridColumn: 4,
 }, {
     name: "affiliation",
     label: "Affiliation",
     type: "text",
     required: true,
     gridColumn: 4,
 }, {
     name: "email",
     label: "Email",
     type: "email",
     required: true,
     gridColumn: 3,
 }, {
     name: "mobile",
     label: "Mobile Number",
     type: "tel",
     required: true,
     gridColumn: 3,
     maxLength: 10,
 }, {
     name: "approvalStatus",
     label: "Approval Status",
     type: "select",
     required: true,
     gridColumn: 2,
     options: [{
          value: "Pending",
          label: "Pending",
      }, {
          value: "Approved",
          label: "Approved",
      }, {
          value: "Returned",
          label: "Returned",
      }],
 }, {
     name: "approvalDate",
     label: "Nomination Approval Date",
     type: "date",
     required: true,
     gridColumn: 2,
 }, {
     name: "appointmentDate",
     label: "Appointment Date",
     type: "date",
     required: true,
     gridColumn: 2,
 }, {
     name: "dispatchDate",
     label: "Thesis Dispatch Date",
     type: "text",
     required: false,
     gridColumn: 2,
     readOnly: true,
 }, {
     name: "dueDate",
     label: "Evaluation Due Date",
     type: "date",
     required: true,
     gridColumn: 2,
 }, {
     name: "examinerReport",
     label: "Examiner Report",
     type: "file",
     required: true,
     gridColumn: 3,
     accept: ".pdf,.jpg,.jpeg,.png",
     helpText: "PDF, JPG or PNG; up to 5 MB.",
 }, {
     name: "recommendation",
     label: "Recommendation",
     type: "select",
     required: true,
     gridColumn: 2,
     options: [{
          value: "Accepted",
          label: "Accepted",
      }, {
          value: "Revision Required",
          label: "Revision Required",
      }, {
          value: "Not Recommended",
          label: "Not Recommended",
      }],
 }, {
     name: "evaluationStatus",
     label: "Evaluation Status",
     type: "text",
     required: false,
     gridColumn: 3,
     readOnly: true,
 }];
    return fields.map((field) => {
        if (["approvalStatus", "approvalDate"].includes(field.name)) return { ...field, type: "text", readOnly: true, required: false };
        if (["examinerReport", "recommendation"].includes(field.name)) return { ...field, required: ctx.actor.role === "Thesis Examiner", readOnly: ctx.actor.role !== "Thesis Examiner", disabled: ctx.actor.role !== "Thesis Examiner" };
        if (ctx.actor.role === "Thesis Examiner" && field.name !== "scholar") return { ...field, required: false, readOnly: true, disabled: true };
        if (["appointmentDate", "dueDate"].includes(field.name)) return { ...field, required: ctx.values.approvalStatus === "Approved", disabled: ctx.values.approvalStatus !== "Approved" };
        return field;
    });
}
