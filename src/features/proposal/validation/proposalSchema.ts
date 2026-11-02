import type { DocumentRequirement, EventReason, ProposalType } from "../../shared";
import type { ProposalFormData, ProposalFormErrors } from "../types/proposal.types";

/* Plain validation (no zod: hplus_react modules do not ship it). */

type Rule = (v: ProposalFormData) => string | undefined;

const required = (key: keyof ProposalFormData, message: string): Rule => (v) => (String(v[key] ?? "").trim() ? undefined : message);
const wholeNumber = (key: keyof ProposalFormData, label: string): Rule => (v) => {
    const value = String(v[key] ?? "").trim();
    if (!value) return `${label} is required`;
    return /^\d+$/.test(value) ? undefined : `${label} must be a whole number`;
};

/** Mandatory fields per SRS 1.2 (E1). Document and rule checks are done separately. */
export const proposalRules: Partial<Record<keyof ProposalFormData, Rule>> = {
    type: required("type", "Select the proposal type"),
    officerCode: required("officerCode", "Select the officer"),
    designation: required("designation", "Designation is required"),
    cadre: required("cadre", "Select the cadre"),
    institution: required("institution", "Select the place of posting"),
    event: required("event", "Select the event / reason"),
    eventDate: required("eventDate", "Event date is required"),
    existingBasic: wholeNumber("existingBasic", "Existing basic pay"),
    existingLevel: required("existingLevel", "Select the existing pay level"),
    existingCell: wholeNumber("existingCell", "Existing cell"),
    proposedBasic: wholeNumber("proposedBasic", "Proposed basic pay"),
    proposedLevel: required("proposedLevel", "Select the proposed pay level"),
    proposedCell: wholeNumber("proposedCell", "Proposed cell"),
    justification: (v) => (v.justification.trim().length >= 20 ? undefined : "Give a detailed justification (at least 20 characters)"),
    declaration: (v) => (v.declaration ? undefined : "Accept the declaration to submit"),
};

/** Which form step each field is on (to jump to the first error). */
export const FIELD_STEP: Partial<Record<keyof ProposalFormData, number>> = {
    type: 0, officerCode: 0, designation: 0, cadre: 0, institution: 0,
    event: 1, eventDate: 1, existingBasic: 1, existingLevel: 1, existingCell: 1,
    proposedBasic: 1, proposedLevel: 1, proposedCell: 1, nextIncrement: 1, justification: 1,
    documents: 2, declaration: 2,
};

/** Documents the configuration requires for this proposal type and event (SRS 1.7 checklist). */
export const requiredDocuments = (docs: DocumentRequirement[], type: ProposalType | "", event: EventReason | "") =>
    docs.filter((d) => (!type || d.types.includes(type)) && (d.events.length === 0 || (!!event && d.events.includes(event))));

/** E1 + E3: field errors for Submit. */
export const validateProposal = (form: ProposalFormData, docs: DocumentRequirement[]): ProposalFormErrors => {
    const errors: ProposalFormErrors = {};
    for (const [key, rule] of Object.entries(proposalRules) as [keyof ProposalFormData, Rule][]) {
        const message = rule(form);
        if (message) errors[key] = message;
    }
    if (form.eventDate && form.eventDate > new Date().toISOString().slice(0, 10)) errors.eventDate = "Event date cannot be in the future";
    if (form.nextIncrement && form.eventDate && form.nextIncrement <= form.eventDate) errors.nextIncrement = "Next increment must be after the event date";
    for (const d of requiredDocuments(docs, form.type, form.event)) {
        if (d.mandatory && !form.documents[d.name]) errors[`doc:${d.name}`] = `${d.name} is required for ${form.type} / ${form.event}`;
    }
    return errors;
};
