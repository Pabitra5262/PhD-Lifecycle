import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";

export const definition: Definition = {
    key: "vivaVoce",
    feature: "viva-voce",
    uc: 17,
    title: "Viva-Voce Management",
    path: "/phd/viva-voce",
    menu: ["PhD Life Cycle Mgmt."],
    roles: ["University Authority", "Scrutiny / Selection / Research Committee", "Department Authority / Course Coordinator", "Student / Candidate / Scholar"],
    writers: ["University Authority", "Scrutiny / Selection / Research Committee", "Department Authority / Course Coordinator"],
    grids: [],
    columns: [{
         name: "scholar",
         label: "Scholar",
     }, {
         name: "panel",
         label: "Panel",
     }, {
         name: "schedule",
         label: "Schedule",
     }, {
         name: "venue",
         label: "Venue",
     }, {
         name: "attendance",
         label: "Attendance",
     }, {
         name: "outcome",
         label: "Outcome",
     }, {
         name: "recommendation",
         label: "Recommendation",
     }],
};

export function vivaVoceFields(ctx: FieldContext): FormField[] {
    return [{
     name: "scholar",
     label: "Scholar / Thesis",
     type: "select",
     required: true,
     gridColumn: 4,
     options: ctx.options.scholars,
 }, {
     name: "panel",
     label: "Panel Members",
     type: "multiselect",
     required: true,
     gridColumn: 4,
     options: ctx.options.faculty,
 }, {
     name: "schedule",
     label: "Schedule",
     type: "datetime-local",
     required: true,
     gridColumn: 4,
 }, {
     name: "venue",
     label: "Venue / Online Details",
     type: "text",
     required: true,
     gridColumn: 5,
 }, {
     name: "notification",
     label: "Notification",
     type: "text",
     required: false,
     gridColumn: 5,
     readOnly: true,
 }, {
     name: "attendance",
     label: "Attendance",
     type: "select",
     required: true,
     gridColumn: 2,
     options: [{
          value: "Present",
          label: "Present",
      }, {
          value: "Absent",
          label: "Absent",
      }],
 }, {
     name: "proceedings",
     label: "Proceedings / Remarks",
     type: "textarea",
     rows: 1,
     required: true,
     gridColumn: 6,
 }, {
     name: "outcome",
     label: "Outcome",
     type: "select",
     required: true,
     gridColumn: 3,
     options: [{
          value: "Passed",
          label: "Passed",
      }, {
          value: "Corrections Required",
          label: "Corrections Required",
      }, {
          value: "Re-examination Required",
          label: "Re-examination Required",
      }],
 }, {
     name: "recommendation",
     label: "Recommendation",
     type: "select",
     required: true,
     gridColumn: 3,
     options: [{
          value: "Award Recommended",
          label: "Award Recommended",
      }, {
          value: "Corrections Required",
          label: "Corrections Required",
      }, {
          value: "Re-examination Required",
          label: "Re-examination Required",
      }],
 }];
}
