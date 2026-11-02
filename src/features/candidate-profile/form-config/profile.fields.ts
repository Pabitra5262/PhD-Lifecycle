import type { FormField } from "@/shared/components/ui/Forms";
import { profileConfig, today } from "../model/candidateProfile";
const options = (values: string[]) => values.map((value) => ({ label: value, value }));
const uploadProps: Partial<FormField> = { accept: ".pdf,.jpg,.jpeg,.png", helpText: "PDF, JPG or PNG; up to 5 MB." };
export function candidateProfileFields({ sameAddress, qualified, category }: {
    sameAddress: boolean;
    qualified: boolean;
    category: string;
}) {
    return {
        personal: [
            {
                name: "candidateId",
                label: "Candidate ID",
                type: "text" as const,
                required: false,
                gridColumn: 4,
                readOnly: true
            },
            {
                name: "fullName",
                label: "Full Name",
                type: "text" as const,
                required: true,
                gridColumn: 4
            },
            {
                name: "dateOfBirth",
                label: "Date of Birth",
                type: "date" as const,
                required: true,
                gridColumn: 2,
                maxDate: today()
            },
        ] satisfies FormField[],
        qualification: [
            {
                name: "qualificationType",
                label: "Qualification Type",
                type: "select" as const,
                required: true,
                gridColumn: 4,
                options: options(profileConfig.qualificationTypes)
            },
            ...(qualified ? [{
                    name: "examName",
                    label: "Examination Name / Details",
                    type: "text" as const,
                    required: true,
                    gridColumn: 4
                }, {
                    name: "examYear",
                    label: "Examination Year",
                    type: "number" as const,
                    required: true,
                    gridColumn: 2,
                    min: 1900,
                    max: new Date().getFullYear(),
                    step: 1
                }, {
                    name: "examScore",
                    label: "Score",
                    type: "number" as const,
                    required: true,
                    gridColumn: 2,
                    min: 0,
                    step: 0.01
                }, {
                    name: "examRank",
                    label: "Rank",
                    type: "number" as const,
                    required: false,
                    gridColumn: 2,
                    min: 1,
                    step: 1
                }, {
                    name: "qualificationCertificate",
                    label: "Qualification Certificate",
                    type: "file" as const,
                    ...uploadProps,
                    required: true,
                    gridColumn: 4
                }] : []),
        ] satisfies FormField[],
        category: [
            {
                name: "category",
                label: "Category",
                type: "select" as const,
                required: true,
                gridColumn: 4,
                options: options(profileConfig.categories)
            },
            ...(category !== "General" ? [{
                    name: "categoryProof",
                    label: "Category / Reservation Proof",
                    type: "file" as const,
                    ...uploadProps,
                    required: true,
                    gridColumn: 4
                }] : []),
        ] satisfies FormField[],
        documents: [
            {
                name: "identityDocument",
                label: "Identity Document",
                type: "file" as const,
                ...uploadProps,
                required: true,
                gridColumn: 4
            },
            {
                name: "academicDocument",
                label: "Academic Documents",
                type: "file" as const,
                ...uploadProps,
                required: true,
                gridColumn: 4
            },
            {
                name: "supportingDocument",
                label: "Other Supporting Document",
                type: "file" as const,
                ...uploadProps,
                required: false,
                gridColumn: 4
            },
            {
                name: "declaration",
                label: "I declare that the information and documents provided are true and correct.",
                type: "checkbox" as const,
                required: true,
                gridColumn: 12
            },
        ] satisfies FormField[],
        address: [
            {
                name: "currentAddress",
                label: "Current Address",
                type: "textarea" as const,
                required: true,
                gridColumn: 6,
                rows: 1
            },
            {
                name: "currentPin",
                label: "PIN Code",
                type: "tel" as const,
                required: true,
                gridColumn: 2,
                maxLength: 6
            },
            {
                name: "sameAddress",
                label: "Permanent address is same as current address",
                type: "checkbox" as const,
                required: false,
                gridColumn: 12
            },
            {
                name: "permanentAddress",
                label: "Permanent Address",
                type: "textarea" as const,
                required: true,
                gridColumn: 6,
                rows: 1,
                disabled: sameAddress
            },
            {
                name: "permanentPin",
                label: "PIN Code",
                type: "tel" as const,
                required: true,
                gridColumn: 2,
                maxLength: 6,
                disabled: sameAddress
            },
        ] satisfies FormField[]
    };
}
