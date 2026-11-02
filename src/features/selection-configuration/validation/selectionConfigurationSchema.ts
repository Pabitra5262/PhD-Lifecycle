import { z } from "zod";
import { admissionConfig } from "@/features/shared/admissionMasters";
import { UNIVERSITY_RULES } from "../form-config/selectionConfigurationConfig";
import type { StageId } from "../types/selectionConfiguration.types";

const numeric = (value: string) => value.trim() !== "" && Number.isFinite(Number(value));
export const selectionSchema = z.object({
    university: z.string().min(1, "Select a university"),
    academicSession: z.string().refine((value) => admissionConfig.sessions.includes(value), "Select a configured academic session"),
    stages: z.array(z.object({
        id: z.enum(["written", "interview", "synopsis"]),
        order: z.string(),
        scored: z.boolean(),
        marks: z.string(),
        weightage: z.string(),
        qualifyingScore: z.string(),
    })).min(1, "Select at least one selection stage"),
    meritMethod: z.string().min(1, "Select a merit calculation rule"),
    firstTieBreaker: z.string().min(1, "Select the first tie-breaking rule"),
    secondTieBreaker: z.string(),
    exemptionRule: z.string(),
    status: z.literal("Draft"),
}).superRefine((values, context) => {
    const add = (path: (string | number)[], message: string) => context.addIssue({ code: "custom", path, message });
    const rules = UNIVERSITY_RULES.find((item) => item.universityId === values.university);
    if (!rules) add(["university"], "Select a valid university");
    if (!rules?.meritMethods.some((item) => item.id === values.meritMethod)) add(["meritMethod"], "Select a university-approved merit rule");
    const stageIds = values.stages.map((stage) => stage.id);
    if (new Set(stageIds).size !== stageIds.length) add(["stages"], "Each stage may be selected only once");
    const orders = values.stages.map((stage) => stage.order);
    values.stages.forEach((stage, index) => {
        if (!/^\d+$/.test(stage.order) || Number(stage.order) < 1 || Number(stage.order) > values.stages.length) add(["stages", index, "order"], "Enter an order from 1 to the number of selected stages");
        if (orders.filter((order) => Number(order) === Number(stage.order)).length > 1) add(["stages", index, "order"], "Stage order must be unique");
        if (!stage.scored) return;
        if (!numeric(stage.marks) || Number(stage.marks) <= 0) add(["stages", index, "marks"], "Enter marks greater than zero");
        if (!numeric(stage.qualifyingScore) || Number(stage.qualifyingScore) < 0 || Number(stage.qualifyingScore) > Number(stage.marks)) add(["stages", index, "qualifyingScore"], "Qualifying score must be between zero and maximum marks");
        if (values.meritMethod === "weighted" && (!numeric(stage.weightage) || Number(stage.weightage) <= 0 || Number(stage.weightage) > 100)) add(["stages", index, "weightage"], "Enter a weightage greater than zero and up to 100");
    });
    const scored = values.stages.filter((stage) => stage.scored);
    if (!scored.length) add(["stages"], "Select at least one scored stage for merit calculation");
    if (values.meritMethod === "weighted" && Math.abs(scored.reduce((sum, stage) => sum + Number(stage.weightage), 0) - 100) > 0.000001) add(["weightage"], "Total weightage must equal 100%");
    for (const key of ["firstTieBreaker", "secondTieBreaker"] as const) {
        if (key === "secondTieBreaker" && !values[key]) continue;
        const rule = rules?.tieBreakers.find((item) => item.id === values[key]);
        if (!rule || (rule.stage && !scored.some((stage) => stage.id === rule.stage))) add([key], "Select an approved tie-breaker for a scored stage or academic score");
    }
    if (values.secondTieBreaker && values.firstTieBreaker === values.secondTieBreaker) add(["secondTieBreaker"], "Tie-breaking priorities must be different");
    if (values.exemptionRule) {
        const rule = rules?.exemptions.find((item) => item.id === values.exemptionRule);
        if (!rule || !stageIds.includes(rule.stage as StageId)) add(["exemptionRule"], "This exemption is not permitted for the selected university and stages");
    }
});
