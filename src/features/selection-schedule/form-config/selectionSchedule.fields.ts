import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";

export const definition: Definition = {
    key: "selectionSchedule",
    feature: "selection-schedule",
    uc: 7,
    title: "Selection Schedule and Assessment",
    path: "/phd/admissions/selection-schedule",
    menu: ["PhD Admissions"],
    roles: ["University Authority", "Department Authority / Course Coordinator", "Scrutiny / Selection / Research Committee"],
    writers: ["University Authority", "Department Authority / Course Coordinator", "Scrutiny / Selection / Research Committee"],
    grids: [{
         name: "assessments",
         label: "Candidate List",
         mode: "editable",
         columns: [{
              name: "candidate",
              label: "Candidate",
              type: "select",
              required: true,
              source: "candidates",
          }, {
              name: "attendance",
              label: "Attendance",
              type: "select",
              options: [{
                   value: "Present",
                   label: "Present",
               }, {
                   value: "Absent",
                   label: "Absent",
               }],
              required: true,
          }, {
              name: "marks",
              label: "Marks / Assessment",
              type: "number",
          }, {
              name: "outcome",
              label: "Stage Outcome",
              type: "select",
              options: [{
                   value: "Qualified",
                   label: "Qualified",
               }, {
                   value: "Not Qualified",
                   label: "Not Qualified",
               }, {
                   value: "Absent",
                   label: "Absent",
               }],
              required: true,
          }],
         required: true,
     }],
    columns: [{
         name: "advertisement",
         label: "Advertisement Number",
     }, {
         name: "stage",
         label: "Stage",
     }, {
         name: "candidate",
         label: "Candidate",
     }, {
         name: "schedule",
         label: "Schedule",
     }, {
         name: "venue",
         label: "Venue",
     }, {
         name: "panel",
         label: "Panel",
     }, {
         name: "attendance",
         label: "Attendance",
     }, {
         name: "marks",
         label: "Marks",
     }, {
         name: "outcome",
         label: "Outcome",
     }],
};

export function selectionScheduleFields(ctx: FieldContext): FormField[] {
    return [{
     name: "advertisement",
     label: "Advertisement Number",
     type: "select",
     required: true,
     gridColumn: 3,
     options: ctx.options.advertisements,
 }, {
     name: "stage",
     label: "Selection Stage",
     type: "text",
     required: false,
     gridColumn: 3,
     readOnly: true,
 }, {
     name: "schedule",
     label: "Schedule Date and Time",
     type: "datetime-local",
     required: true,
     gridColumn: 3,
 }, {
     name: "venue",
     label: "Venue / Online Meeting Details",
     type: "text",
     required: true,
     gridColumn: 3,
 }, {
     name: "panel",
     label: "Panel / Assessor",
     type: "multiselect",
     required: true,
     gridColumn: 3,
     options: ctx.options.faculty,
 }];
}
