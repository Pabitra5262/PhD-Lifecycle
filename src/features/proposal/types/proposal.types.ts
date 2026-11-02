import type { EventReason, Proposal, ProposalStatus, ProposalType } from "../../shared";

/** Submit Proposal form (SRS 1.2 field description). Numbers stay strings while the user types. */
export interface ProposalFormData {
    type: ProposalType | "";
    officerCode: string;
    designation: string;
    cadre: string;
    institution: string;
    event: EventReason | "";
    eventDate: string;
    existingBasic: string;
    existingLevel: string;
    existingCell: string;
    proposedBasic: string;
    proposedLevel: string;
    proposedCell: string;
    nextIncrement: string;
    justification: string;
    /** Checklist document name → uploaded file name. */
    documents: Record<string, string>;
    declaration: boolean;
}

export type ProposalFormErrors = Partial<Record<keyof ProposalFormData | `doc:${string}` | "form", string>>;

/** Status tabs on View Proposals. */
export type ProposalGroup = "all" | "draft" | "process" | "closed" | "returned";

/** List row: a proposal plus its reporting period, so the filter panel can filter on it. */
export type ProposalRow = Proposal & { period: string };

export interface SaveResult {
    ok: boolean;
    id?: string;
    status?: ProposalStatus;
    errors?: ProposalFormErrors;
    /** Business-rule exception (E2 / E4 / E5) shown in a status pop-up. */
    blocker?: string;
}

export const EMPTY_FORM: ProposalFormData = {
    type: "",
    officerCode: "",
    designation: "",
    cadre: "",
    institution: "",
    event: "",
    eventDate: "",
    existingBasic: "",
    existingLevel: "",
    existingCell: "",
    proposedBasic: "",
    proposedLevel: "",
    proposedCell: "",
    nextIncrement: "",
    justification: "",
    documents: {},
    declaration: false,
};
