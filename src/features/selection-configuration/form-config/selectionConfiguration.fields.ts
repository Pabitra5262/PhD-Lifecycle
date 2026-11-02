import type { FormField } from "@/shared/components/ui/Forms";
import { universityOptions, academicSessionOptions, UNIVERSITY_RULES } from "./selectionConfigurationConfig";
import type { SelectionConfiguration } from "../types";
export const SELECTION_CONFIGURATION_FIELDS: FormField[] = [
    {
        name: "university",
        label: "University",
        type: "select",
        required: true,
        gridColumn: 4,
        options: universityOptions
    },
    {
        name: "academicSession",
        label: "Academic Session",
        type: "select",
        required: true,
        gridColumn: 4,
        options: academicSessionOptions
    },
    {
        name: "status",
        label: "Approval Status",
        type: "text",
        required: false,
        gridColumn: 4,
        readOnly: true
    },
];
export function selectionRuleFields(form: SelectionConfiguration, locked: boolean) {
    const rules = UNIVERSITY_RULES.find((item) => item.universityId === form.university);
    const scored = form.stages.filter((stage) => stage.scored);
    const tieBreakers = rules?.tieBreakers.filter((rule) => !rule.stage || scored.some((stage) => stage.id === rule.stage)) ?? [];
    const disabled = !rules || locked;
    const merit: FormField[] = [
        {
            name: "meritMethod",
            label: "Merit Calculation Rule",
            type: "select",
            required: true,
            gridColumn: 4,
            disabled,
            options: rules?.meritMethods.map((item) => ({ value: item.id, label: item.label })) ?? []
        },
        {
            name: "firstTieBreaker",
            label: "First Tie-breaking Rule",
            type: "select",
            required: true,
            gridColumn: 4,
            disabled,
            options: tieBreakers.map((item) => ({ value: item.id, label: item.label }))
        },
        {
            name: "secondTieBreaker",
            label: "Second Tie-breaking Rule",
            type: "select",
            required: false,
            gridColumn: 4,
            disabled,
            options: [
                { value: "", label: "None" },
                ...tieBreakers.filter((item) => item.id !== form.firstTieBreaker).map((item) => ({ value: item.id, label: item.label })),
            ]
        },
    ];
    const exemption: FormField[] = [
        {
            name: "exemptionRule",
            label: "Exemption Rule",
            type: "select",
            required: false,
            gridColumn: 4,
            disabled,
            options: [
                { value: "", label: "None" },
                ...(rules?.exemptions.filter((item) => form.stages.some((stage) => stage.id === item.stage)).map((item) => ({ value: item.id, label: item.label })) ?? []),
            ]
        },
    ];
    return { merit, exemption };
}
