import type { FormField } from "@/shared/components/ui/Forms";
import { admissionConfig, localToday } from "./advertisementConfig";
import { selectionWorkflowsFor } from "@/features/selection-configuration/service/selectionConfigurationService";
const options = (values: string[]) => values.map((value) => ({ label: value, value }));
export function advertisementFields({ university, academicSession, seatsApplicable, qualificationRule }: {
    university: string;
    academicSession: string;
    seatsApplicable: boolean;
    qualificationRule: string;
}): FormField[] {
    const rule = admissionConfig.qualificationRules.find((item) => item.id === qualificationRule);
    return [
        {
            name: "advertisementNumber",
            label: "Advertisement Number",
            type: "text",
            required: false,
            gridColumn: 4,
            readOnly: true
        },
        {
            name: "advertisementDate",
            label: "Advertisement Date",
            type: "date",
            required: true,
            gridColumn: 2
        },
        {
            name: "academicSession",
            label: "Academic Session",
            type: "select",
            required: true,
            gridColumn: 2,
            options: options(admissionConfig.sessions)
        },
        {
            name: "university",
            label: "University",
            type: "select",
            required: true,
            gridColumn: 4,
            options: admissionConfig.universities.map((item) => ({ value: item.id, label: item.label }))
        },
        {
            name: "department",
            label: "Department",
            type: "select",
            required: true,
            gridColumn: 3,
            disabled: !university,
            options: options(admissionConfig.universities.find((item) => item.id === university)?.departments ?? [])
        },
        {
            name: "researchArea",
            label: "Research Area / Subject",
            type: "text",
            required: true,
            gridColumn: 4,
            validation: { maxLength: admissionConfig.researchAreaMaxLength }
        },
        {
            name: "seatsApplicable",
            label: "Seat allocation applicable",
            type: "checkbox",
            required: false,
            gridColumn: 3
        },
        {
            name: "seats",
            label: "Number of Seats",
            type: "number",
            required: seatsApplicable,
            gridColumn: 2,
            min: 1,
            step: 1,
            disabled: !seatsApplicable
        },
        {
            name: "eligibilityCriteria",
            label: "Eligibility Criteria",
            type: "textarea",
            required: true,
            gridColumn: 4,
            rows: 1
        },
        {
            name: "qualificationRule",
            label: "NET / URET Requirement",
            type: "select",
            required: true,
            gridColumn: 4,
            options: admissionConfig.qualificationRules.filter((item) => item.approved).map((item) => ({ value: item.id, label: item.label }))
        },
        {
            name: "permittedExemptions",
            label: "Permitted Exemptions",
            type: "multiselect",
            required: false,
            gridColumn: 4,
            disabled: !rule?.exemptions.length,
            options: options(rule?.exemptions ?? [])
        },
        {
            name: "applicationStart",
            label: "Application Start Date",
            type: "date",
            required: true,
            gridColumn: 2
        },
        {
            name: "applicationEnd",
            label: "Application End Date",
            type: "date",
            required: true,
            gridColumn: 2,
            minDate: localToday()
        },
        {
            name: "selectionProcess",
            label: "Selection Process",
            type: "select",
            required: true,
            gridColumn: 4,
            options: [...admissionConfig.selectionProcesses.filter((item) => item.approved && item.active).map((item) => ({ value: item.id, label: item.label })), ...selectionWorkflowsFor(university, academicSession).map((record) => ({ value: record.id, label: `Selection Configuration v${record.version} ? ${record.configuration.stages.map((stage) => stage.id).join(" / ")}` }))]
        },
        {
            name: "advertisementDocument",
            label: "Advertisement Document",
            type: "file",
            required: true,
            gridColumn: 4,
            accept: ".pdf",
            helpText: "PDF, up to 5 MB."
        },
        {
            name: "supportingDocument",
            label: "Supporting Document",
            type: "file",
            required: false,
            gridColumn: 4,
            accept: ".pdf",
            helpText: "PDF, up to 5 MB."
        },
    ];
}
