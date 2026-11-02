import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";

export const definition: Definition = {
    key: "degreeAward",
    feature: "degree-award",
    uc: 18,
    title: "Degree Award and Certificate Management",
    path: "/phd/degree-award",
    menu: ["PhD Life Cycle Mgmt."],
    roles: ["University Authority", "University Authority", "Student / Candidate / Scholar"],
    writers: ["University Authority", "University Authority"],
    grids: [{
         name: "completionChecklist",
         label: "Completion Checklist",
         mode: "checklist",
         columns: [{
              name: "condition",
              label: "Condition",
          }, {
              name: "status",
              label: "Status",
          }],
         required: true,
     }],
    columns: [{
         name: "scholar",
         label: "Scholar",
     }, {
         name: "approvalDecision",
         label: "Approval Decision",
     }, {
         name: "degreeAwardDate",
         label: "Degree Award Date",
     }, {
         name: "provisionalNumber",
         label: "Provisional Number",
     }, {
         name: "provisionalIssueDate",
         label: "Provisional Issue Date",
     }, {
         name: "convocation",
         label: "Convocation",
     }, {
         name: "finalDegreeNumber",
         label: "Final Degree Number",
     }, {
         name: "finalDegreeDate",
         label: "Final Degree Date",
     }, {
         name: "archive",
         label: "Archive",
     }],
};

export function degreeAwardFields(ctx: FieldContext): FormField[] {
    return [{
     name: "scholar",
     label: "Scholar",
     type: "select",
     required: true,
     gridColumn: 4,
     options: ctx.options.scholars,
 }, {
     name: "awardRecommendation",
     label: "Award Recommendation",
     type: "text",
     required: false,
     gridColumn: 4,
     readOnly: true,
 }, {
     name: "approvalDecision",
     label: "Approval Decision",
     type: "select",
     required: true,
     gridColumn: 4,
     options: [{
          value: "Approved",
          label: "Approved",
      }, {
          value: "Returned",
          label: "Returned",
      }],
 }, {
     name: "remarks",
     label: "Approval Remarks",
     type: "textarea",
     rows: 1,
     required: false,
     gridColumn: 6,
 }, {
     name: "degreeAwardDate",
     label: "Degree Award Date",
     type: "date",
     required: true,
     gridColumn: 2,
 }, {
     name: "provisionalNumber",
     label: "Provisional Certificate Number",
     type: "text",
     required: false,
     gridColumn: 4,
     readOnly: true,
 }, {
     name: "provisionalIssueDate",
     label: "Provisional Issue Date",
     type: "date",
     required: true,
     gridColumn: 2,
 }, {
     name: "convocation",
     label: "Convocation Details",
     type: "text",
     required: false,
     gridColumn: 4,
 }, {
     name: "finalDegreeNumber",
     label: "Final Degree Number",
     type: "text",
     required: true,
     gridColumn: 4,
 }, {
     name: "finalDegreeDate",
     label: "Final Degree Date",
     type: "date",
     required: true,
     gridColumn: 2,
 }, {
     name: "archive",
     label: "Archive",
     type: "text",
     required: false,
     gridColumn: 4,
     readOnly: true,
 }];
}
