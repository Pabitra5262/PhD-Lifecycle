import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";

export const definition: Definition = {
    key: "scholarRequests",
    feature: "scholar-requests",
    uc: 13,
    title: "Scholar Requests and Issues",
    path: "/phd/requests",
    menu: ["PhD Life Cycle Mgmt.", "Research"],
    roles: ["Student / Candidate / Scholar", "Supervisor / Co-Supervisor", "Department Authority / Course Coordinator", "University Authority"],
    writers: ["Student / Candidate / Scholar", "Supervisor / Co-Supervisor", "Department Authority / Course Coordinator", "University Authority"],
    grids: [],
    columns: [{
         name: "reference",
         label: "Reference",
     }, {
         name: "scholar",
         label: "Scholar",
     }, {
         name: "requestType",
         label: "Request Type",
     }, {
         name: "submissionDate",
         label: "Submission Date",
     }, {
         name: "assignedAuthority",
         label: "Assigned Authority",
     }, {
         name: "decision",
         label: "Decision",
     }, {
         name: "status",
         label: "Status",
     }, {
         name: "resolutionDate",
         label: "Resolution Date",
     }],
};

export function scholarRequestsFields(ctx: FieldContext): FormField[] {
    return [{
     name: "scholar",
     label: "Scholar",
     type: "select",
     required: true,
     gridColumn: 3,
     options: ctx.options.scholars,
 }, {
     name: "reference",
     label: "Request Number",
     type: "text",
     required: false,
     gridColumn: 3,
     readOnly: true,
 }, {
     name: "requestType",
     label: "Request Type",
     type: "select",
     required: true,
     gridColumn: 3,
     options: [{
          value: "Issue",
          label: "Issue",
      }, {
          value: "Supervisor Change",
          label: "Supervisor Change",
      }, {
          value: "Topic Change",
          label: "Topic Change",
      }, {
          value: "Extension",
          label: "Extension",
      }, {
          value: "Suspension",
          label: "Suspension",
      }],
 },{
     name: "supportingDocument",
     label: "Supporting Documents",
     type: "file",
     required: ["Extension", "Suspension", "Supervisor Change"].includes(String(ctx.values.requestType)),
     gridColumn: 3,
     accept: ".pdf,.jpg,.jpeg,.png",
     helpText: "PDF, JPG or PNG; up to 5 MB.",
 }, {
     name: "description",
     label: "Description",
     type: "textarea",
     rows: 1,
     required: true,
     gridColumn: 6,
     maxLength: 5000,
 },  {
     name: "submissionDate",
     label: "Submission Date",
     type: "text",
     required: false,
     gridColumn: 3,
     readOnly: true,
 }, {
     name: "assignedAuthority",
     label: "Assigned Authority",
     type: "text",
     required: false,
     gridColumn: 3,
     readOnly: true,
 }, {
     name: "remarks",
     label: "Remarks / Recommendation",
     type: "textarea",
     rows: 1,
     required: !/Scholar/.test(ctx.actor.role),
     gridColumn: 6,
     readOnly: /Scholar/.test(ctx.actor.role),
 }, {
     name: "decision",
     label: "Decision",
     type: "select",
     required: !/Scholar/.test(ctx.actor.role),
     gridColumn: 2,
     options: [{
          value: "Approved",
          label: "Approved",
      }, {
          value: "Rejected",
          label: "Rejected",
      }, {
          value: "Returned",
          label: "Returned",
      }, {
          value: "Forwarded",
          label: "Forwarded",
      }],
     readOnly: /Scholar/.test(ctx.actor.role),
 }, {
     name: "status",
     label: "Status",
     type: "text",
     required: false,
     gridColumn: 2,
     readOnly: true,
 }, {
     name: "resolutionDate",
     label: "Resolution Date",
     type: "text",
     required: false,
     gridColumn: 2,
     readOnly: true,
 }];
}
