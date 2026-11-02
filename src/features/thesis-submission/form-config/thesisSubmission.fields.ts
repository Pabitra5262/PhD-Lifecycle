import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";

export const definition: Definition = {
    key: "thesisSubmission",
    feature: "thesis-submission",
    uc: 15,
    title: "Final Submission",
    path: "/phd/thesis/final-submission",
    menu: ["PhD Life Cycle Mgmt.", "Thesis"],
    roles: ["Student / Candidate / Scholar", "Department Authority / Course Coordinator", "University Authority"],
    writers: ["Student / Candidate / Scholar", "Department Authority / Course Coordinator", "University Authority"],
    grids: [],
    columns: [{
         name: "registrationNumber",
         label: "Registration Number",
     }, {
         name: "thesisTitle",
         label: "Thesis Title",
     }, {
         name: "submissionDate",
         label: "Submission Date",
     }, {
         name: "similarity",
         label: "Similarity",
     }, {
         name: "departmentVerification",
         label: "Department Verification",
     }, {
         name: "submissionStatus",
         label: "Submission Status",
     }],
};

export function thesisSubmissionFields(ctx: FieldContext): FormField[] {
    return [{
     name: "scholar",
     label: "Scholar",
     type: "select",
     required: true,
     gridColumn: 4,
     options: ctx.options.scholars,
 }, {
     name: "registrationNumber",
     label: "Scholar Registration Number",
     type: "text",
     required: false,
     gridColumn: 4,
     readOnly: true,
 }, {
     name: "thesisTitle",
     label: "Thesis Title",
     type: "text",
     required: true,
     gridColumn: 4,
 }, {
     name: "abstract",
     label: "Abstract",
     type: "textarea",
     rows: 1,
     required: true,
     gridColumn: 6,
     maxLength: 5000,
 }, {
     name: "keywords",
     label: "Keywords",
     type: "textarea",
     rows: 1,
     required: false,
     gridColumn: 6,
 }, {
     name: "thesisFile",
     label: "Thesis File",
     type: "file",
     required: true,
     gridColumn: 3,
     accept: ".pdf,.jpg,.jpeg,.png",
     helpText: "PDF, JPG or PNG; up to 5 MB.",
 }, {
     name: "supportingDocument",
     label: "Supporting Documents",
     type: "file",
     required: true,
     gridColumn: 3,
     accept: ".pdf,.jpg,.jpeg,.png",
     helpText: "PDF, JPG or PNG; up to 5 MB.",
 }, {
     name: "similarity",
     label: "Similarity Verification (%)",
     type: "number",
     required: true,
     gridColumn: 3,
     min: 0,
     max: 10,
 }, {
     name: "similarityReport",
     label: "Similarity Verification Report",
     type: "file",
     required: true,
     gridColumn: 3,
     accept: ".pdf,.jpg,.jpeg,.png",
     helpText: "PDF, JPG or PNG; up to 5 MB.",
 }, {
     name: "submissionDate",
     label: "Submission Date",
     type: "text",
     required: false,
     gridColumn: 2,
     readOnly: true,
 }, {
     name: "departmentVerification",
     label: "Department Verification",
     type: "select",
     required: !/Scholar/.test(ctx.actor.role),
     gridColumn: 2,
     options: [{
          value: "Verified",
          label: "Verified",
      }, {
          value: "Returned",
          label: "Returned",
      }],
     readOnly: /Scholar/.test(ctx.actor.role),
 }, {
     name: "submissionStatus",
     label: "Submission Status",
     type: "text",
     required: false,
     gridColumn: 2,
     readOnly: true,
 }];
}
