import type { FormField } from "@/shared/components/ui/Forms";
export const CONTROL_FIELDS = {
    academicSession: {
        name: "academicSession",
        label: "Academic Session",
        type: "select",
        required: true,
        gridColumn: 3
    },
    university: {
        name: "university",
        label: "University",
        type: "select",
        required: true,
        gridColumn: 3
    },
    department: {
        name: "department",
        label: "Department",
        type: "select",
        required: true,
        gridColumn: 3
    },
    lifecycleStage: {
        name: "lifecycleStage",
        label: "Lifecycle Stage",
        type: "select",
        required: false,
        gridColumn: 3
    }
} satisfies Record<string, FormField>;
