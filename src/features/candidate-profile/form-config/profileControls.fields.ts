import type { FormField } from "@/shared/components/ui/Forms";
export const CONTROL_FIELDS = {
    mobileNumber: {
        name: "mobile",
        label: "Mobile Number",
        type: "tel",
        required: true,
        gridColumn: 4
    },
    emailAddress: {
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
        gridColumn: 4
    },
    verificationCode: {
        name: "verificationCode",
        label: "Verification Code",
        type: "tel",
        required: false,
        gridColumn: 4
    }
} satisfies Record<string, FormField>;
