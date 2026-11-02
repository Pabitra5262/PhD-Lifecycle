import { z } from "zod";

import { admissionConfig } from "@/features/shared/admissionMasters";
import { selectionWorkflowsFor } from "@/features/selection-configuration/model/selectionConfiguration";
export { admissionConfig };
export const localToday = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
const requiredText = z.string().trim().min(1, "This field is required");
const dateField = z.iso.date({ message: "Select a valid date (DD/MM/YYYY)" });
const pdfField = z.custom<File>((value) => value instanceof File, "Upload the advertisement document")
    .refine((file) => !(file instanceof File) || (file.type === "application/pdf" && /\.pdf$/i.test(file.name)), "Only PDF files are allowed")
    .refine((file) => !(file instanceof File) || (file.size > 0 && file.size <= admissionConfig.maxFileBytes), "Upload a nonempty PDF up to 5 MB");
export const advertisementSchema = z.object({
    advertisementNumber: requiredText,
    advertisementDate: dateField,
    academicSession: requiredText.refine((value) => admissionConfig.sessions.includes(value), "Select a configured session"),
    university: requiredText,
    department: requiredText,
    researchArea: requiredText.max(admissionConfig.researchAreaMaxLength, "Maximum 200 characters"),
    seatsApplicable: z.boolean(),
    seats: z.string(),
    eligibilityCriteria: requiredText,
    qualificationRule: requiredText,
    permittedExemptions: z.array(z.string()),
    applicationStart: dateField,
    applicationEnd: dateField,
    selectionProcess: requiredText,
    advertisementDocument: pdfField,
    supportingDocument: pdfField.nullable().optional(),
    status: z.literal("Draft"),
}).superRefine((values, context) => {
    const error = (path: string, message: string) => context.addIssue({ code: "custom", path: [path], message });
    const sampleProcess = admissionConfig.selectionProcesses.some((process) => process.id === values.selectionProcess && process.approved && process.active);
    const configuredProcess = selectionWorkflowsFor(values.university, values.academicSession).some((record) => record.id === values.selectionProcess);
    if (!sampleProcess && !configuredProcess) error("selectionProcess", "Select an approved, active selection process for this university and session");
    const university = admissionConfig.universities.find((item) => item.id === values.university);
    if (!university) error("university", "Select a university from master data");
    if (!university?.departments.includes(values.department)) error("department", "Select a department belonging to the university");
    if (values.seatsApplicable && (!/^\d+$/.test(values.seats) || !Number.isSafeInteger(Number(values.seats)) || Number(values.seats) <= 0)) error("seats", "Enter a whole number greater than zero");
    const rule = admissionConfig.qualificationRules.find((item) => item.id === values.qualificationRule && item.approved);
    if (!rule) error("qualificationRule", "Select an approved NET / URET rule");
    if (values.permittedExemptions.some((value) => !rule?.exemptions.includes(value))) error("permittedExemptions", "Select only exemptions permitted by the chosen rule");
    if (values.applicationStart >= values.applicationEnd) error("applicationEnd", "End date must be after start date");
    if (values.applicationEnd < localToday()) error("applicationEnd", "End date cannot be in the past");
});
export type AdvertisementForm = z.infer<typeof advertisementSchema>;
