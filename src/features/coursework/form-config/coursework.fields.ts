import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";

export const definition: Definition = {
    key: "coursework",
    feature: "coursework",
    uc: 9,
    title: "Coursework Management",
    path: "/phd/coursework/course-management",
    menu: ["PhD Life Cycle Mgmt.", "Coursework"],
    roles: ["University Authority", "Department Authority / Course Coordinator", "Department Authority / Course Coordinator", "Student / Candidate / Scholar"],
    writers: ["Department Authority / Course Coordinator", "Department Authority / Course Coordinator"],
    grids: [{
         name: "enrollment",
         label: "Scholar Enrollment",
         mode: "enrollment",
         columns: [{
              name: "scholar",
              label: "Scholar",
          }, {
              name: "name",
              label: "Name",
          }, {
              name: "department",
              label: "Department",
          }, {
              name: "attendance",
              label: "Attendance",
              type: "select",
              required: true,
              options: [
                  { value: "Present", label: "Present" },
                  { value: "Absent", label: "Absent" },
              ],
          }],
         required: true,
     }],
    columns: [{
         name: "academicSession",
         label: "Academic Session",
     }, {
         name: "department",
         label: "Department",
     }, {
         name: "course",
         label: "Course",
     }, {
         name: "credits",
         label: "Credits",
     }, {
         name: "duration",
         label: "Duration",
     }, {
         name: "faculty",
         label: "Faculty",
     }, {
         name: "classDate",
         label: "Class Date",
     }, {
         name: "attendance",
         label: "Attendance",
     }, {
         name: "courseStatus",
         label: "Course Status",
     }],
};

export function courseworkFields(ctx: FieldContext): FormField[] {
    return [{
     name: "academicSession",
     label: "Academic Session",
     type: "select",
     required: true,
     gridColumn: 3,
     options: ctx.options.sessions,
 }, {
     name: "department",
     label: "Department",
     type: "text",
     required: false,
     gridColumn: 3,
     readOnly: true,
 }, {
     name: "course",
     label: "Course / Subject",
     type: "select",
     required: true,
     gridColumn: 4,
     options: ctx.options.subjects,
 }, {
     name: "credits",
     label: "Credits",
     type: "number",
     required: true,
     gridColumn: 2,
     min: 1,
 }, {
     name: "duration",
     label: "Duration (Months)",
     type: "number",
     required: true,
     gridColumn: 2,
     min: 1,
 }, {
     name: "faculty",
     label: "Faculty",
     type: "select",
     required: true,
     gridColumn: 4,
     options: ctx.options.faculty,
 }, {
     name: "classDate",
     label: "Class Date",
     type: "date",
     required: true,
     gridColumn: 2,
 }, {
     name: "startTime",
     label: "Start Time",
     type: "time",
     required: true,
     gridColumn: 2,
 }, {
     name: "endTime",
     label: "End Time",
     type: "time",
     required: true,
     gridColumn: 2,
 }, {
     name: "location",
     label: "Class Location",
     type: "text",
     required: true,
     gridColumn: 4,
 }, {
     name: "courseStatus",
     label: "Course Status",
     type: "text",
     required: false,
     gridColumn: 4,
     readOnly: true,
 }];
}
