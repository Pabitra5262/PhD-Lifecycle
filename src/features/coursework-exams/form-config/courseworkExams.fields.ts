import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";

export const definition: Definition = {
    key: "courseworkExams",
    feature: "coursework-exams",
    uc: 10,
    title: "Examination / Certificate",
    path: "/phd/coursework/examination-certificate",
    menu: ["PhD Life Cycle Management", "Coursework"],
    roles: ["University Authority", "Department Authority / Course Coordinator", "Department Authority / Course Coordinator", "Student / Candidate / Scholar"],
    writers: ["Department Authority / Course Coordinator", "Department Authority / Course Coordinator", "University Authority"],
    grids: [{
         name: "courses",
         label: "Course / Subject",
         mode: "display",
         columns: [{
              name: "course",
              label: "Course",
          }, {
              name: "credits",
              label: "Credits",
          }],
         required: false,
     }],
    columns: [{
         name: "scholar",
         label: "Scholar",
     }, {
         name: "examinationDate",
         label: "Examination Date",
     }, {
         name: "marks",
         label: "Marks",
     }, {
         name: "result",
         label: "Result",
     }, {
         name: "completionStatus",
         label: "Completion Status",
     }, {
         name: "certificateNumber",
         label: "Certificate Number",
     }, {
         name: "issueDate",
         label: "Issue Date",
     }, {
         name: "signatory",
         label: "Signatory",
     }],
};

export function courseworkExamsFields(ctx: FieldContext): FormField[] {
    return [{
     name: "scholar",
     label: "Scholar",
     type: "select",
     required: true,
     gridColumn: 4,
     options: ctx.options.scholars,
 }, {
     name: "examinationDate",
     label: "Examination Date",
     type: "date",
     required: true,
     gridColumn: 2,
 }, {
     name: "marks",
     label: "Assessment / Marks",
     type: "number",
     required: true,
     gridColumn: 2,
     min: 0,
     max: 100,
 }, {
     name: "result",
     label: "Result",
     type: "text",
     required: false,
     gridColumn: 2,
     readOnly: true,
 }, {
     name: "completionStatus",
     label: "Completion Status",
     type: "text",
     required: false,
     gridColumn: 2,
     readOnly: true,
 }, {
     name: "certificateNumber",
     label: "Certificate Number",
     type: "text",
     required: false,
     gridColumn: 4,
     readOnly: true,
 }, {
     name: "issueDate",
     label: "Issue Date",
     type: "date",
     required: true,
     gridColumn: 2,
 }, {
     name: "signatory",
     label: "Signatory",
     type: "select",
     required: true,
     gridColumn: 4,
     options: ctx.options.faculty,
 }];
}
