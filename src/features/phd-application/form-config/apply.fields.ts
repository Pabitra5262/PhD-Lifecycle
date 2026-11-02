import type { FormField } from "@/shared/components/ui/Forms";
export function applicationDocumentField(document: {
    id: string;
    label: string;
    required: boolean;
}, readOnly = false): FormField {
    return {
        name: `document.${document.id}`,
        label: document.label,
        type: readOnly ? "text" : "file",
        required: readOnly ? false : document.required,
        gridColumn: 4,
        readOnly
    };
}
export const CONTROL_FIELDS = {
    advertisement: {
        name: "advertisement",
        label: "Advertisement",
        type: "select",
        required: true,
        gridColumn: 4
    },
    universityDisplay: {
        name: "university",
        label: "University",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    departmentDisplay: {
        name: "department",
        label: "Department",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    researchArea: {
        name: "researchArea",
        label: "Research Area",
        type: "select",
        required: true,
        gridColumn: 4
    },
    academicSessionDisplay: {
        name: "academicSession",
        label: "Academic Session",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    applicationPeriodDisplay: {
        name: "applicationPeriod",
        label: "Application Period",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    applicationStatusDisplay: {
        name: "applicationStatus",
        label: "Application Status",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    candidateIdDisplay: {
        name: "candidateId",
        label: "Candidate ID",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    candidateNameDisplay: {
        name: "candidateName",
        label: "Candidate Name",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    qualificationTypeDisplay: {
        name: "qualificationType",
        label: "NET / URET Qualification",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    eligibilityConfirmed: {
        name: "eligibilityConfirmed",
        label: "I confirm that I meet the eligibility criteria for this advertisement.",
        type: "checkbox",
        required: true,
        gridColumn: 12
    },
    researchInterest: {
        name: "synopsis",
        label: "Research Interest",
        type: "textarea",
        rows: 1,
        required: false,
        gridColumn: 6
    },
    synopsisDocument: {
        name: "synopsisFile",
        label: "Synopsis Document",
        type: "file",
        required: false,
        gridColumn: 4
    },
    applicationFeeDisplay: {
        name: "applicationFee",
        label: "Application Fee (INR)",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    paymentStatusDisplay: {
        name: "paymentStatus",
        label: "Payment Status",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    paymentReferenceDisplay: {
        name: "paymentReference",
        label: "Payment Reference",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    declaration: {
        name: "declaration",
        label: "I declare that the application information and uploaded documents are true and correct.",
        type: "checkbox",
        required: true,
        gridColumn: 12
    },
    applicationReferenceDisplay: {
        name: "applicationReference",
        label: "Application Reference",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    statusDisplay: {
        name: "status",
        label: "Status",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    advertisementDisplay: {
        name: "advertisement",
        label: "Advertisement",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    researchAreaDisplay: {
        name: "researchArea",
        label: "Research Area",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    scrutinyOutcomeDisplay: {
        name: "scrutinyOutcome",
        label: "Scrutiny Outcome",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    scrutinyRemarksDisplay: {
        name: "remarks",
        label: "Scrutiny Remarks",
        type: "textarea",
        rows: 1,
        required: false,
        gridColumn: 6,
        readOnly: true
    },
    correctionDeadlineDisplay: {
        name: "correctionDeadline",
        label: "Correction Deadline",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    researchInterestDisplay: {
        name: "synopsis",
        label: "Research Interest",
        type: "textarea",
        rows: 1,
        required: false,
        gridColumn: 6,
        readOnly: true
    },
    synopsisDocumentDisplay: {
        name: "synopsisFile",
        label: "Synopsis Document",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
    advertisementFilter: {
        name: "advertisement",
        label: "Advertisement",
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
    applicationStatus: {
        name: "applicationStatus",
        label: "Application Status",
        type: "select",
        required: false,
        gridColumn: 3
    }
} satisfies Record<string, FormField>;
