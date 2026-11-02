import type { FormField } from "@/shared/components/ui/Forms";
export const CONTROL_FIELDS = {
    academicSession: {
        name: "academicSession",
        label: "Academic Session",
        type: "select",
        required: false,
        gridColumn: 3
    },
    university: {
        name: "university",
        label: "University",
        type: "select",
        required: false,
        gridColumn: 3
    },
    department: {
        name: "department",
        label: "Department",
        type: "select",
        required: false,
        gridColumn: 3
    },
    status: {
        name: "status",
        label: "Status",
        type: "select",
        required: false,
        gridColumn: 3
    },
    statusDisplay: {
        name: "status",
        label: "Status",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    }
} satisfies Record<string, FormField>;
