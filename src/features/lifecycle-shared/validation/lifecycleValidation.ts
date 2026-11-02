import { z } from "zod";
import type { FormField } from "@/shared/components/ui/Forms";
import type { Actor, Definition, Values } from "../types";

export const lifecycleRules = { maximumMarks: 100, qualifyingMarks: 50, supervisorLimit: 8, committeeMinimum: 2, maximumFileBytes: 5 * 1024 * 1024, similarityLimit: 10 };
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const text = (value: unknown) => typeof value === "string" ? value.trim() : String(value ?? "");
export function validateLifecycle(def: Definition, values: Values, grids: Record<string, Values[]>, fields: FormField[], actor: Actor) {
    const errors: Record<string, string> = {};
    const error = (key: string, message: string) => { errors[key] ??= message; };
    for (const field of fields) {
        if (field.readOnly || field.disabled) continue;
        const value = values[field.name];
        const missing = value === undefined || value === null || value === "" || Array.isArray(value) && !value.length;
        if (field.required && (missing || field.type === "checkbox" && value !== true)) error(field.name, (field.label ?? field.name) + " is required");
        if (missing) continue;
        if (field.type === "number" && (!Number.isFinite(Number(value)) || Number(value) < Number(field.min ?? -Infinity) || Number(value) > Number(field.max ?? Infinity))) error(field.name, "Enter a number within the permitted range");
        if (field.type === "email" && !z.email().safeParse(value).success) error(field.name, "Enter a valid email address");
        if (field.type === "tel" && !/^\d{10}$/.test(text(value))) error(field.name, "Mobile number must contain exactly 10 digits");
        if (field.type === "date" && !z.iso.date().safeParse(value).success) error(field.name, "Select a valid date");
        if (field.type === "time" && !/^([01]\d|2[0-3]):[0-5]\d$/.test(text(value))) error(field.name, "Select a valid time");
        if (field.type === "datetime-local" && !Number.isFinite(new Date(text(value)).getTime())) error(field.name, "Select a valid date and time");
        if (field.type === "file") {
            if (!(value instanceof File) || value.size === 0 || value.size > lifecycleRules.maximumFileBytes) error(field.name, "Upload a nonempty document up to 5 MB");
            else if (!((value.type === "application/pdf" && /\.pdf$/i.test(value.name)) || (value.type === "image/jpeg" && /\.jpe?g$/i.test(value.name)) || (value.type === "image/png" && /\.png$/i.test(value.name)))) error(field.name, "Upload a PDF, JPG or PNG document");
        }
        if ((field.type === "select" || field.type === "multiselect" || field.type === "checkbox-group") && field.options) {
            const selected = Array.isArray(value) ? value : [value];
            if (selected.some((item) => !field.options!.some((option) => String(option.value) === String(item)))) error(field.name, "Select only configured options");
            if (new Set(selected).size !== selected.length) error(field.name, "Duplicate selections are not allowed");
        }
        if (field.maxLength && text(value).length > field.maxLength) error(field.name, "Maximum " + field.maxLength + " characters");
    }
    for (const grid of def.grids) {
        const rows = grids[grid.name] ?? [];
        if (grid.required && !rows.length) error(grid.name, "Add at least one " + grid.label.toLowerCase() + " row");
        if (grid.mode === "editable") rows.forEach((row, index) => grid.columns.forEach((column) => {
            if (column.type === "select" && column.options && !column.options.some((option) => option.value === row[column.name])) error(grid.name + "." + index + "." + column.name, "Select a configured option");
            if (column.required && !text(row[column.name])) error(grid.name + "." + index + "." + column.name, column.label + " is required");
            if (column.type === "number" && text(row[column.name]) && (!Number.isFinite(Number(row[column.name])) || Number(row[column.name]) < 0)) error(grid.name + "." + index + "." + column.name, "Enter a valid nonnegative number");
            if (column.type === "date" && (!z.iso.date().safeParse(row[column.name]).success || text(row.status) === "Pending" && text(row[column.name]) <= today())) error(grid.name + "." + index + "." + column.name, "Pending milestone dates must be valid future dates");
        }));
        if (grid.name === "nominations" && rows.length < lifecycleRules.committeeMinimum) error(grid.name, "The configured minimum examiner nominations is " + lifecycleRules.committeeMinimum);
        if (grid.name === "completionChecklist" && rows.some((row) => row.status !== "Completed")) error(grid.name, "Complete all award conditions before approval");
    }
    if (def.key === "coursework") {
        for (const row of grids.enrollment ?? []) {
            if (!["Present", "Absent"].includes(text(row.attendance))) error("enrollment", "Select Present or Absent for every enrolled scholar");
        }
    }
    for (const row of grids.assessments ?? []) {
        if (row.attendance === "Absent" && String(row.marks ?? "").trim()) error("assessments", "Marks are blocked for absent candidates");
        if (row.attendance === "Present" && (!String(row.marks ?? "").trim() || !Number.isFinite(Number(row.marks)) || Number(row.marks) < 0 || Number(row.marks) > Number(values.maximumMarks ?? lifecycleRules.maximumMarks))) error("assessments", "Enter marks within the configured stage maximum for every present candidate");
        if (row.attendance === "Absent" && row.outcome !== "Absent") error("assessments", "Absent attendance requires Absent outcome");
    }
    if (def.key === "resultsAdmission") {
        if (!values.candidate) error("candidateList", "Select a candidate from the result grid");
        if (!values.assessmentsComplete) error("candidateList", "Complete all configured selection stages before result processing");
        if (values.selectionStatus === "Selected" && !(values.offerLetter instanceof File)) error("offerLetter", "Upload the admission offer for a selected candidate");
        if (values.selectionStatus === "Not Selected" && !text(values.remarks)) error("remarks", "Record the reason for non-selection");
    }
    for (const row of grids.nominations ?? []) {
        if (!z.email().safeParse(row.email).success) error("nominations", "Each examiner requires a valid email");
        if (!/^\d{10}$/.test(text(row.mobile))) error("nominations", "Each examiner mobile number must contain 10 digits");
    }
    if (["selectionSchedule", "preSubmissionSeminar", "vivaVoce"].includes(def.key) && text(values.schedule).slice(0, 10) < today()) error("schedule", "Schedule cannot be in the past");
    if (def.key === "selectionSchedule") {
        if (!text(values.stage)) error("advertisement", "An approved active selection configuration is required");
        if (values.attendance === "Absent" && text(values.marks)) error("marks", "Marks cannot be entered for an absent candidate");
        if (values.attendance === "Absent" && values.outcome !== "Absent") error("outcome", "An absent candidate must have Absent outcome");
    }
    if (def.key === "coursework") { if (Number(values.credits) <= 0) error("credits", "Credits must be greater than zero"); if (Number(values.duration) <= 0) error("duration", "Duration must be greater than zero"); if (text(values.endTime) <= text(values.startTime)) error("endTime", "End time must be after start time"); }
    if (def.key === "courseworkExams") { if (text(values.issueDate) < text(values.examinationDate)) error("issueDate", "Issue date cannot precede examination date"); }
    if (def.key === "researchRegistration") { if (text(values.registrationDate) > today()) error("registrationDate", "Registration date cannot be in the future"); if (values.supervisor === values.coSupervisor) error("coSupervisor", "Supervisor and co-supervisor must differ"); if (Number(values.workload) >= lifecycleRules.supervisorLimit) error("supervisor", "Supervisor workload limit reached"); if (values.courseworkStatus !== "Completed") error("scholar", "Complete coursework before research registration"); }
    if (["preSubmissionSeminar", "vivaVoce"].includes(def.key) && (!Array.isArray(values.panel) || values.panel.length < lifecycleRules.committeeMinimum)) error("panel", "Select the configured minimum of " + lifecycleRules.committeeMinimum + " committee members");
    if (["researchRegistration", "scholarRequests", "degreeAward"].includes(def.key) && /Return|Reject/.test(text(values.approval ?? values.decision ?? values.approvalDecision)) && !text(values.remarks)) error("remarks", "Remarks are required for return or rejection");
    if (def.key === "thesisSubmission" && Number(values.similarity) > lifecycleRules.similarityLimit) error("similarity", "Similarity exceeds the configured limit");
    if (def.key === "examinerManagement") { if ((text(values.appointmentDate) || values.examinerReport) && values.approvalStatus !== "Approved") error("approvalStatus", "Nomination approval is required before appointment or evaluation"); if (values.dueDate && text(values.dueDate) <= (text(values.dispatchDate) || today())) error("dueDate", "Evaluation due date must be after dispatch date"); if (values.appointmentDate && text(values.appointmentDate) < text(values.approvalDate)) error("appointmentDate", "Appointment cannot precede nomination approval"); if (values.examinerReport && !values.appointmentDate) error("examinerReport", "Appointment and dispatch must be completed before evaluation"); }
    if (def.key === "degreeAward") { if (text(values.degreeAwardDate) < today()) error("degreeAwardDate", "Award date cannot precede this approval"); if (text(values.provisionalIssueDate) < text(values.degreeAwardDate)) error("provisionalIssueDate", "Provisional issue date cannot precede award"); if (text(values.finalDegreeDate) < text(values.provisionalIssueDate)) error("finalDegreeDate", "Final degree date cannot precede provisional issuance"); }
    if (def.key === "reportsAnalytics" && text(values.fromDate) && text(values.toDate) && text(values.fromDate) > text(values.toDate)) error("toDate", "From date must be on or before To date");
    if (def.key === "progressMonitoring" && /Scholar/.test(actor.role) && (text(values.supervisorRemarks) || text(values.committeeEvaluation))) error("supervisorRemarks", "Review fields are reserved for the assigned supervisor or committee");
    return errors;
}
export const lifecycleSchema = (def: Definition, fields: FormField[], grids: Record<string, Values[]>, actor: Actor) => z.record(z.string(), z.unknown()).superRefine((values, context) => { Object.entries(validateLifecycle(def, values, grids, fields, actor)).forEach(([key, message]) => context.addIssue({ code: "custom", path: key.split("."), message })); });
