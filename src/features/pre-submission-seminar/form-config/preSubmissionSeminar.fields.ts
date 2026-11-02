import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";

export const definition: Definition = {
    key: "preSubmissionSeminar",
    feature: "pre-submission-seminar",
    uc: 14,
    title: "Pre-submission Seminar",
    path: "/phd/thesis/pre-submission-seminar",
    menu: ["PhD Life Cycle Mgmt.", "Thesis"],
    roles: ["Department Authority / Course Coordinator", "Student / Candidate / Scholar", "Supervisor / Co-Supervisor", "Scrutiny / Selection / Research Committee"],
    writers: ["Department Authority / Course Coordinator", "Supervisor / Co-Supervisor", "Scrutiny / Selection / Research Committee"],
    grids: [],
    columns: [{
         name: "scholar",
         label: "Scholar",
     }, {
         name: "thesisTitle",
         label: "Thesis Title",
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
         name: "outcome",
         label: "Outcome",
     }],
};

export function preSubmissionSeminarFields(ctx: FieldContext): FormField[] {
    return [{
     name: "scholar",
     label: "Scholar",
     type: "select",
     required: true,
     gridColumn: 4,
     options: ctx.options.scholars,
 }, {
     name: "thesisTitle",
     label: "Proposed Thesis Title",
     type: "text",
     required: true,
     gridColumn: 4,
 }, {
     name: "schedule",
     label: "Seminar Date and Time",
     type: "datetime-local",
     required: true,
     gridColumn: 4,
 }, {
     name: "venue",
     label: "Venue",
     type: "text",
     required: true,
     gridColumn: 4,
 }, {
     name: "panel",
     label: "Committee Members",
     type: "multiselect",
     required: true,
     gridColumn: 4,
     options: ctx.options.faculty,
 }, {
     name: "presentation",
     label: "Presentation Document",
     type: "file",
     required: true,
     gridColumn: 4,
     accept: ".pdf,.jpg,.jpeg,.png",
     helpText: "PDF, JPG or PNG; up to 5 MB.",
 }, {
     name: "attendance",
     label: "Attendance",
     type: "select",
     required: true,
     gridColumn: 3,
     options: [{
          value: "Present",
          label: "Present",
      }, {
          value: "Absent",
          label: "Absent",
      }],
 }, {
     name: "outcome",
     label: "Outcome",
     type: "select",
     required: true,
     gridColumn: 3,
     options: [{
          value: "Approved",
          label: "Approved",
      }, {
          value: "Revision Required",
          label: "Revision Required",
      }, {
          value: "Not Approved",
          label: "Not Approved",
      }],
 }, {
     name: "recommendations",
     label: "Recommendations",
     type: "textarea",
     rows: 1,
     required: true,
     gridColumn: 6,
 }];
}
