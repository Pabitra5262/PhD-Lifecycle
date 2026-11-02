import type { FormField } from "@/shared/components/ui/Forms";
export const CONTROL_FIELDS = {
    university: {
        name: "university",
        label: "University",
        type: "select",
        required: false,
        gridColumn: 3
    },
    academicSession: {
        name: "academicSession",
        label: "Academic Session",
        type: "select",
        required: false,
        gridColumn: 3
    },
    selectionStage: {
        name: "selectionStage",
        label: "Selection Stage",
        type: "select",
        required: false,
        gridColumn: 3
    },
    approvalStatus: {
        name: "approvalStatus",
        label: "Approval Status",
        type: "select",
        required: false,
        gridColumn: 3
    }
} satisfies Record<string, FormField>;
