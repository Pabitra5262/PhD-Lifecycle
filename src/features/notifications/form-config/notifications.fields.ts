import type { FormField } from "@/shared/components/ui/Forms";
import type { FieldContext, Definition } from "@/features/lifecycle-shared/types";

export const definition: Definition = {
    key: "notifications",
    feature: "notifications",
    uc: 20,
    title: "System Notifications",
    path: "/phd/notifications",
    menu: [],
    roles: ["Student / Candidate / Scholar", "University Authority", "Department Authority / Course Coordinator", "Supervisor / Co-Supervisor", "Thesis Examiner"],
    writers: [],
    readOnly: true,
    grids: [],
    columns: [{
         name: "eventType",
         label: "Event Type",
     }, {
         name: "recipient",
         label: "Recipient",
     }, {
         name: "message",
         label: "Message",
     }, {
         name: "dueDate",
         label: "Due Date",
     }, {
         name: "deliveryChannel",
         label: "Delivery Channel",
     }, {
         name: "deliveryStatus",
         label: "Delivery Status",
     }],
};

export function notificationsFields(..._args: [FieldContext]): FormField[] {
    void _args;
    return [];
}
