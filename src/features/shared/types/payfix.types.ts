/* Pay Fixation & Pay Protection — module-wide types (SRS sections 1.1–1.7). */

export type ProposalType = "Pay Fixation" | "Pay Protection";

export type EventReason = "Appointment" | "Promotion" | "Revision" | "Transfer" | "Other";

/**
 * Proposal life cycle (SRS 1.4 Workflow Summary):
 * Draft → Submitted (Accounts / Establishment) → Verified (FO) → Forwarded (Competent Authority) → Sanctioned.
 * The FO may also finalise directly (Approved). Any stage may Return (back to the initiator) or Reject.
 */
export type ProposalStatus =
    | "Draft"
    | "Submitted"
    | "Verified"
    | "Forwarded"
    | "Approved"
    | "Sanctioned"
    | "Returned"
    | "Rejected";

/** Basic pay with its pay-matrix position. */
export interface PayParticulars {
    basic: number;
    level: string;
    cell: number;
}

export interface ProposalDocument {
    id: string;
    /** Checklist item it satisfies, e.g. "Promotion Order". */
    kind: string;
    fileName: string;
    uploadedOn: string;
}

/** One step in the movement history (who did what, when). */
export interface Movement {
    date: string;
    by: string;
    role: string;
    action: string;
    remarks: string;
}

export interface Proposal {
    id: string;
    type: ProposalType;
    officerCode: string;
    officerName: string;
    designation: string;
    cadre: string;
    institution: string;
    event: EventReason;
    eventDate: string;
    existing: PayParticulars;
    proposed: PayParticulars;
    /** Set by Accounts / Establishment when the verified figures differ from the proposed ones. */
    verified?: PayParticulars;
    nextIncrement: string;
    justification: string;
    documents: ProposalDocument[];
    declaration: boolean;
    status: ProposalStatus;
    /** Current pending authority ("—" once closed). */
    pendingWith: string;
    createdDate: string;
    submittedDate: string;
    decisionDate: string;
    /** Order reference issued on approval / sanction. */
    orderNo: string;
    /** Role key of the user who created it (OES Officer or College Admin). */
    createdBy: string;
    movement: Movement[];
}

export interface Officer {
    code: string;
    name: string;
    designation: string;
    cadre: string;
    institution: string;
    dateOfJoining: string;
    current: PayParticulars;
    nextIncrement: string;
}

/** A past fixation / protection decision (SRS 1.5 History Grid). */
export interface HistoryRecord {
    id: string;
    officerCode: string;
    proposalId: string;
    type: ProposalType;
    event: EventReason;
    effectiveDate: string;
    from: PayParticulars;
    to: PayParticulars;
    orderNo: string;
    orderDate: string;
    sanctionedBy: string;
    remarks: string;
}

/* ---- Configuration (SRS 1.7) --------------------------------------------- */

export interface DocumentRequirement {
    id: string;
    name: string;
    /** Proposal types it is required for. */
    types: ProposalType[];
    /** Events it is required for; empty = every event. */
    events: EventReason[];
    mandatory: boolean;
}

export interface PayLevel {
    level: string;
    /** Basic pay of cell 1; later cells add 3 % each, rounded to the next ₹100. */
    entryPay: number;
    cells: number;
    cadre: string;
}

export interface WorkflowStage {
    id: string;
    order: number;
    name: string;
    role: string;
    actions: string[];
    slaDays: number;
    /** Only when the FO forwards (e.g. Competent Authority). */
    optional: boolean;
}

export interface NotificationRule {
    id: string;
    trigger: string;
    recipients: string;
    channels: string[];
    enabled: boolean;
}

export interface BusinessRules {
    blockDuplicateOpen: boolean;
    ruleEngine: boolean;
    lockAfterApproval: boolean;
    allowAdminOnBehalf: boolean;
    /** Accounts / Establishment may correct basic / level / cell during verification. */
    verifierCanEdit: boolean;
}

export interface PayFixConfig {
    documents: DocumentRequirement[];
    payLevels: PayLevel[];
    workflow: WorkflowStage[];
    notifications: NotificationRule[];
    rules: BusinessRules;
}

export interface AuditEntry {
    id: string;
    dt: string;
    user: string;
    role: string;
    action: string;
    ref: string;
}

export interface PortalNotification {
    id: string;
    msg: string;
    date: string;
    read: boolean;
}

export interface PayFixData {
    officers: Officer[];
    proposals: Proposal[];
    history: HistoryRecord[];
    config: PayFixConfig;
    audit: AuditEntry[];
    notifications: PortalNotification[];
}
