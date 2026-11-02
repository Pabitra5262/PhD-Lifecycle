import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";

export const definition: Definition = {
    key: "reportsAnalytics",
    feature: "reports-analytics",
    uc: 19,
    title: "Reports / Analytics",
    path: "/phd/reports-analytics",
    menu: ["PhD Life Cycle Management"],
    roles: ["University Authority", "Department Authority / Course Coordinator", "Authorized HED Official / Auditor"],
    writers: [],
    readOnly: true,
    grids: [],
    columns: [{
         name: "recordReference",
         label: "Record Reference",
     }, {
         name: "scholar",
         label: "Scholar",
     }, {
         name: "university",
         label: "University",
     }, {
         name: "department",
         label: "Department",
     }, {
         name: "lifecycleStage",
         label: "Lifecycle Stage",
     }, {
         name: "status",
         label: "Status",
     }, {
         name: "dueDate",
         label: "Due Date",
     }],
};

export function reportsAnalyticsFields(ctx: FieldContext): FormField[] {
    return [{
     name: "reportType",
     label: "Report Type",
     type: "select",
     required: true,
     gridColumn: 4,
     options: [{
          value: "Admission",
          label: "Admission",
      }, {
          value: "Coursework",
          label: "Coursework",
      }, {
          value: "Research",
          label: "Research",
      }, {
          value: "Thesis",
          label: "Thesis",
      }, {
          value: "Viva-Voce",
          label: "Viva-Voce",
      }, {
          value: "Degree",
          label: "Degree",
      }, {
          value: "Pending Tasks",
          label: "Pending Tasks",
      }, {
          value: "Overdue Tasks",
          label: "Overdue Tasks",
      }, { value: "Registration Period", label: "Registration Period" }],
 }, {
     name: "university",
     label: "University",
     type: "select",
     required: false,
     gridColumn: 3,
     options: ctx.options.universities,
 }, {
     name: "department",
     label: "Department",
     type: "select",
     required: false,
     gridColumn: 3,
     options: ctx.options.departments,
 }, {
     name: "academicSession",
     label: "Admission Cycle",
     type: "select",
     required: false,
     gridColumn: 2,
     options: ctx.options.sessions,
 }, {
     name: "lifecycleStage",
     label: "Lifecycle Stage",
     type: "select",
     required: false,
     gridColumn: 4,
     options: [{
          value: "Admission",
          label: "Admission",
      }, {
          value: "Coursework",
          label: "Coursework",
      }, {
          value: "Research",
          label: "Research",
      }, {
          value: "Thesis",
          label: "Thesis",
      }, {
          value: "Viva-Voce",
          label: "Viva-Voce",
      }, {
          value: "Degree",
          label: "Degree",
      }],
 }, {
     name: "fromDate",
     label: "From Date",
     type: "date",
     required: false,
     gridColumn: 2,
 }, {
     name: "toDate",
     label: "To Date",
     type: "date",
     required: false,
     gridColumn: 2,
 }, {
     name: "indicators",
     label: "Dashboard Indicators",
     type: "textarea",
     rows: 1,
     required: false,
     gridColumn: 12,
     readOnly: true,
 }];
}
