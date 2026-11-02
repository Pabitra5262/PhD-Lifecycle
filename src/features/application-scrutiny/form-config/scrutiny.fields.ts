import type { FormField } from "@/shared/components/ui/Forms";
export const CANDIDATE_INSTITUTION_FIELDS: FormField[] = [
    {
        name: "university",
        label: "University",
        type: "text",
        required: false,
        readOnly: true,
        gridColumn: 4,
    },
    {
        name: "department",
        label: "Department",
        type: "text",
        required: false,
        readOnly: true,
        gridColumn: 4,
    },
];
export function documentVerificationField(document: {
    id: string;
    label: string;
}): FormField {
    return {
        name: `document.${document.id}`,
        label: document.label,
        type: "select",
        required: true,
        gridColumn: 4
    };
}
export const CONTROL_FIELDS = {
    advertisementNumber: {
        name: "advertisementNumber",
        label: "Advertisement Number",
        type: "select",
        required: true,
        gridColumn: 4
    },
    applicationNumberDisplay: {
        name: "applicationNumber",
        label: "Application Number",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    netVerification: {
        name: "netVerification",
        label: "NET/URET Verification",
        type: "select",
        required: true,
        gridColumn: 4
    },
    scrutinyRemarks: {
        name: "remarks",
        label: "Scrutiny Remarks",
        type: "textarea",
        required: false,
        gridColumn: 6,
        rows: 1
    },
    decision: {
        name: "decision",
        label: "Decision",
        type: "select",
        required: true,
        gridColumn: 4
    }
} satisfies Record<string, FormField>;
