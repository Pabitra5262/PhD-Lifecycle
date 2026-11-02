import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";

export const definition: Definition = {
    key: "progressMonitoring",
    feature: "progress-monitoring",
    uc: 12,
    title: "Progress Monitoring",
    path: "/phd/research/progress-monitoring",
    menu: ["PhD Life Cycle Management", "Research"],
    roles: ["Student / Candidate / Scholar", "Supervisor / Co-Supervisor", "Scrutiny / Selection / Research Committee", "Department Authority / Course Coordinator"],
    writers: ["Student / Candidate / Scholar", "Supervisor / Co-Supervisor", "Scrutiny / Selection / Research Committee", "Department Authority / Course Coordinator"],
    grids: [{
         name: "milestones",
         label: "Milestones",
         mode: "editable",
         columns: [{
              name: "milestone",
              label: "Milestone",
              required: true,
          }, {
              name: "expectedDate",
              label: "Expected Completion Date",
              type: "date",
              required: true,
          }, {
              name: "status",
              label: "Status",
              type: "select",
              options: [{
                   value: "Pending",
                   label: "Pending",
               }, {
                   value: "Completed",
                   label: "Completed",
               }],
              required: true,
          }],
         required: true,
     }],
    columns: [{
         name: "scholar",
         label: "Scholar",
     }, {
         name: "reportingPeriod",
         label: "Reporting Period",
     }, {
         name: "researchStage",
         label: "Research Stage",
     }, {
         name: "status",
         label: "Status",
     }, {
         name: "supervisorRemarks",
         label: "Supervisor Remarks",
     }, {
         name: "committeeEvaluation",
         label: "Committee Evaluation",
     }],
};

export function progressMonitoringFields(ctx: FieldContext): FormField[] {
    return [{
     name: "scholar",
     label: "Scholar",
     type: "select",
     required: true,
     gridColumn: 4,
     options: ctx.options.scholars,
 }, {
     name: "reportingPeriod",
     label: "Reporting Period",
     type: "text",
     required: false,
     gridColumn: 2,
     readOnly: true,
 }, {
     name: "researchStage",
     label: "Research Stage",
     type: "select",
     required: true,
     gridColumn: 2,
     options: [{
          value: "Literature Review",
          label: "Literature Review",
      }, {
          value: "Research Design",
          label: "Research Design",
      }, {
          value: "Data Collection",
          label: "Data Collection",
      }, {
          value: "Analysis",
          label: "Analysis",
      }, {
          value: "Thesis Preparation",
          label: "Thesis Preparation",
      }],
 }, {
     name: "progressDescription",
     label: "Progress Description",
     type: "textarea",
     rows: 1,
     required: true,
     gridColumn: 4,
     maxLength: 5000,
 }, {
     name: "supportingDocument",
     label: "Supporting Documents",
     type: "file",
     required: false,
     gridColumn: 3,
     accept: ".pdf,.jpg,.jpeg,.png",
     helpText: "PDF, JPG or PNG; up to 5 MB.",
 }, {
     name: "committeeEvaluation",
     label: "Committee Evaluation",
     type: "select",
     required: /Review Committee/.test(ctx.actor.role),
     gridColumn: 3,
     options: [{
          value: "Approved",
          label: "Approved",
      }, {
          value: "Revision Required",
          label: "Revision Required",
      }, {
          value: "Unsatisfactory",
          label: "Unsatisfactory",
      }],
     readOnly: !/Review Committee/.test(ctx.actor.role),
 }, {
     name: "status",
     label: "Status",
     type: "text",
     required: false,
     gridColumn: 2,
     readOnly: true,
 }, {
     name: "supervisorRemarks",
     label: "Supervisor Remarks",
     type: "textarea",
     rows: 1,
     required: !/Scholar/.test(ctx.actor.role),
     gridColumn: 4,
     readOnly: /Scholar/.test(ctx.actor.role),
 }];
}
