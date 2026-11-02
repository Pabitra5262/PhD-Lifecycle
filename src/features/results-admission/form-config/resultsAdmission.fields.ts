import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";

export const definition: Definition = {
    key: "resultsAdmission",
    feature: "results-admission",
    uc: 8,
    title: "Result Management / Admission Approval",
    path: "/phd/admissions/results-admission",
    menu: ["PhD Admissions"],
    roles: ["University Authority", "Scrutiny / Selection / Research Committee"],
    writers: ["University Authority", "Scrutiny / Selection / Research Committee"],
    grids: [{
         name: "candidateList",
         label: "Candidate List",
         mode: "display",
         columns: [{
              name: "candidate",
              label: "Candidate",
          }, {
              name: "stageOutcome",
              label: "Stage Outcome",
          }],
         required: false,
     }],
    columns: [{
         name: "advertisement",
         label: "Advertisement",
     }, {
         name: "candidate",
         label: "Candidate",
     }, {
         name: "meritScore",
         label: "Merit Score",
     }, {
         name: "meritRank",
         label: "Merit Rank",
     }, {
         name: "selectionStatus",
         label: "Selection Status",
     }, {
         name: "acceptance",
         label: "Acceptance",
     }],
};

export function resultsAdmissionFields(ctx: FieldContext): FormField[] {
    return [{
     name: "advertisement",
     label: "Advertisement Number",
     type: "select",
     required: true,
     gridColumn: 3,
     options: ctx.options.advertisements,
 }, {
     name: "meritScore",
     label: "Merit Score",
     type: "text",
     required: false,
     gridColumn: 2,
     readOnly: true,
 }, {
     name: "meritRank",
     label: "Merit Rank",
     type: "text",
     required: false,
     gridColumn: 2,
     readOnly: true,
 }, {
     name: "selectionStatus",
     label: "Selection Status",
     type: "select",
     required: true,
     gridColumn: 2,
     options: [{
          value: "Selected",
          label: "Selected",
      }, {
          value: "Waitlisted",
          label: "Waitlisted",
      }, {
          value: "Not Selected",
          label: "Not Selected",
      }],
 }, {
     name: "offerLetter",
     label: "Offer Letter",
     type: "file",
     required: false,
     gridColumn: 3,
     accept: ".pdf,.jpg,.jpeg,.png",
     helpText: "PDF, JPG or PNG; up to 5 MB.",
 }, {
     name: "acceptance",
     label: "Acceptance / Confirmation",
     type: "select",
     required: true,
     gridColumn: 3,
     options: [{
          value: "Accepted",
          label: "Accepted",
      }, {
          value: "Declined",
          label: "Declined",
      }, {
          value: "Pending",
          label: "Pending",
      }],
 }, {
     name: "remarks",
     label: "Approval Remarks",
     type: "textarea",
     rows: 1,
     required: false,
     gridColumn: 6,
 }];
}
