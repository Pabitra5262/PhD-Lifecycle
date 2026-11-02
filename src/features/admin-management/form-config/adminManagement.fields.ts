import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";
import { ROLES } from "@/features/shared/roles";
const approvedRoleOptions = ROLES.map((role) => ({ value: role.label, label: role.label }));

export const definition: Definition = {
    key: "adminManagement",
    feature: "admin-management",
    uc: 21,
    title: "User and Role Management",
    path: "/phd/administration/users",
    menu: ["Administration"],
    roles: ["System Administrator", "University Authority"],
    writers: ["System Administrator", "University Authority"],
    grids: [],
    columns: [{
         name: "username",
         label: "Username",
     }, {
         name: "name",
         label: "Name",
     }, {
         name: "role",
         label: "Role",
     }, {
         name: "university",
         label: "University",
     }, {
         name: "department",
         label: "Department",
     }, {
         name: "permissions",
         label: "Permissions",
     }, {
         name: "status",
         label: "Status",
     }],
};

export function adminManagementFields(ctx: FieldContext): FormField[] {
    return [{
     name: "username",
     label: "User Account",
     type: "text",
     required: true,
     gridColumn: 3,
 }, {
     name: "name",
     label: "Name",
     type: "text",
     required: true,
     gridColumn: 4,
 }, {
     name: "mobile",
     label: "Mobile Number",
     type: "tel",
     required: true,
     gridColumn: 2,
     maxLength: 10,
 }, {
     name: "email",
     label: "Email",
     type: "email",
     required: true,
     gridColumn: 3,
 }, {
     name: "role",
     label: "Role",
     type: "select",
     required: true,
     gridColumn: 3,
     options: approvedRoleOptions,
 }, {
     name: "university",
     label: "Institution",
     type: "select",
     required: true,
     gridColumn: 3,
     options: ctx.options.universities,
 }, {
     name: "department",
     label: "Department",
     type: "select",
     required: true,
     gridColumn: 3,
     options: ctx.options.departments,
 }, {
     name: "permissions",
     label: "Permissions",
     type: "multiselect",
     required: true,
     gridColumn: 3,
     options: [{
          value: "View",
          label: "View",
      }, {
          value: "Create",
          label: "Create",
      }, {
          value: "Edit",
          label: "Edit",
      }, {
          value: "Submit",
          label: "Submit",
      }, {
          value: "Approve",
          label: "Approve",
      }, {
          value: "Download",
          label: "Download",
      }],
 }];
}
