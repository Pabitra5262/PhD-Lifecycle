import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";

export const definition: Definition = {
    key: "researchRegistration",
    feature: "research-registration",
    uc: 11,
    title: "Supervisor Allocation",
    path: "/phd/research-registration/supervisor-allocation",
    menu: ["PhD Life Cycle Management", "Research Registration"],
    roles: ["University Authority", "Department Authority / Course Coordinator", "Supervisor / Co-Supervisor"],
    writers: ["University Authority", "Department Authority / Course Coordinator"],
    grids: [],
    columns: [{
         name: "registrationNumber",
         label: "Registration Number",
     }, {
         name: "registrationDate",
         label: "Registration Date",
     }, {
         name: "researchTopic",
         label: "Research Topic",
     }, {
         name: "supervisor",
         label: "Supervisor",
     }, {
         name: "coSupervisor",
         label: "Co Supervisor",
     }, {
         name: "approval",
         label: "Approval",
     }, {
         name: "allocationDate",
         label: "Allocation Date",
     }],
};

export function researchRegistrationFields(ctx: FieldContext): FormField[] {
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
     gridColumn: 3,
     readOnly: true,
 }, {
     name: "registrationDate",
     label: "Registration Date",
     type: "date",
     required: true,
     gridColumn: 2,
 }, {
     name: "researchTopic",
     label: "Research Topic / Area",
     type: "text",
     required: true,
     gridColumn: 3,
 }, {
     name: "courseworkStatus",
     label: "Coursework Status",
     type: "text",
     required: false,
     gridColumn: 3,
     readOnly: true,
 }, {
     name: "supervisor",
     label: "Supervisor",
     type: "select",
     required: true,
     gridColumn: 3,
     options: ctx.options.faculty,
 }, {
     name: "coSupervisor",
     label: "Co-Supervisor",
     type: "select",
     required: false,
     gridColumn: 3,
     options: ctx.options.faculty,
 }, {
     name: "specialization",
     label: "Specialization",
     type: "text",
     required: false,
     gridColumn: 3,
     readOnly: true,
 }, {
     name: "workload",
     label: "Current Workload",
     type: "text",
     required: false,
     gridColumn: 2,
     readOnly: true,
 }, {
     name: "approval",
     label: "Approval",
     type: "select",
     required: true,
     gridColumn: 2,
     options: [{
          value: "Approved",
          label: "Approved",
      }, {
          value: "Returned",
          label: "Returned",
      }],
 }, {
     name: "allocationDate",
     label: "Allocation Date",
     type: "text",
     required: false,
     gridColumn: 2,
     readOnly: true,
 }, {
     name: "remarks",
     label: "Approval Remarks",
     type: "textarea",
     rows: 1,
     required: false,
     gridColumn: 6,
 }];
}
