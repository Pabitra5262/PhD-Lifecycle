import { admissionConfig } from "@/features/shared/admissionMasters";
import type { SelectionConfiguration, SelectionFilters } from "../types/selectionConfiguration.types";

export const STAGES = [
    { id: "written", label: "Written Examination" },
    { id: "interview", label: "Viva-Voce / Interview" },
    { id: "synopsis", label: "Synopsis Presentation" },
] as const;
// Sample university rule masters for the wireframe; replace with approved-rule services.
export const UNIVERSITY_RULES = admissionConfig.universities.map((university) => ({
    universityId: university.id,
    meritMethods: [
        { id: "weighted", label: "Weighted stage scores (total weightage 100%)" },
        { id: "total", label: "Total marks across selected stages" },
    ],
    tieBreakers: [
        { id: "written", label: "Higher written examination score", stage: "written" },
        { id: "interview", label: "Higher interview score", stage: "interview" },
        { id: "synopsis", label: "Higher synopsis presentation score", stage: "synopsis" },
        { id: "academic", label: "Higher qualifying academic score", stage: "" },
    ],
    exemptions: [{ id: "net-written", label: "NET-qualified applicants exempt from Written Examination", stage: "written" }],
}));
export const EMPTY_CONFIGURATION: SelectionConfiguration = {
    university: "", academicSession: "", stages: [], meritMethod: "", firstTieBreaker: "", secondTieBreaker: "", exemptionRule: "", status: "Draft",
};
export const describeConfiguration = (value: SelectionConfiguration) => [
    ["University", admissionConfig.universities.find((item) => item.id === value.university)?.label ?? value.university],
    ["Academic Session", value.academicSession],
    ["Stages", value.stages.map((stage) => String(stage.order) + ". " + STAGES.find((item) => item.id === stage.id)?.label + (stage.scored ? " (marks: " + stage.marks + ", weightage: " + stage.weightage + "%, qualifying: " + stage.qualifyingScore + ")" : " (not scored)")).join("; ")],
    ["Merit Rule", value.meritMethod === "weighted" ? "Weighted stage scores" : "Total marks"],
    ["First Tie-breaker", value.firstTieBreaker], ["Second Tie-breaker", value.secondTieBreaker || "None"],
    ["Exemption", value.exemptionRule || "None"],
];

export const universityOptions = admissionConfig.universities.map((item) => ({ label: item.label, value: item.id }));
export const academicSessionOptions = admissionConfig.sessions.map((value) => ({ label: value, value }));
export const stageTableHeaders = ["Selection Stage", "Order", "Scored Stage", "Maximum Marks", "Weightage (%)", "Qualifying Score"];
export const EMPTY_FILTERS: SelectionFilters = { university: "", academicSession: "", stage: "", status: "" };
