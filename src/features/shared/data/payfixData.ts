import type {
    EventReason,
    HistoryRecord,
    Movement,
    Officer,
    PayFixConfig,
    PayFixData,
    PayParticulars,
    Proposal,
    ProposalStatus,
    ProposalType,
} from "../types/payfix.types";
import { PENDING_WITH } from "../workflow";

/* Sample data for the wireframe. Replace with API responses when the backend exists. */

export const INSTITUTIONS = [
    "BJB Autonomous College, Bhubaneswar",
    "SCS Autonomous College, Puri",
    "Khallikote Autonomous College, Berhampur",
    "GM Autonomous College, Sambalpur",
    "Government Autonomous College, Angul",
    "Ravenshaw University, Cuttack",
];

export const CADRES = ["OES Group-A (Class I)", "OES Group-B (Class II)"];

export const DESIGNATIONS = ["Assistant Professor", "Associate Professor", "Professor", "Reader", "Lecturer", "Principal"];

export const EVENTS: EventReason[] = ["Appointment", "Promotion", "Revision", "Transfer", "Other"];

export const PROPOSAL_TYPES: ProposalType[] = ["Pay Fixation", "Pay Protection"];

/** The signed-in person for each role (header role switcher). */
export const CURRENT_USER: Record<string, { name: string; officerCode?: string; institution?: string }> = {
    officer: { name: "Dr. Sasmita Mohanty", officerCode: "OES-1021", institution: INSTITUTIONS[0] },
    college: { name: "Principal, BJB Autonomous College", institution: INSTITUTIONS[0] },
    accounts: { name: "Prakash Ch. Nayak" },
    fo: { name: "Rashmi Rekha Das" },
    dhe: { name: "A. K. Pattnaik, Addl. Secretary" },
    departmentAuthority: { name: "Department Scrutiny Officer" },
    scrutinyCommittee: { name: "University Scrutiny Committee Member" },
    candidate: { name: "Student / Candidate / Scholar" },
    selectionAdmin: { name: "Scrutiny / Selection / Research Committee" },
    university: { name: "University Authority" },
    admin: { name: "System Administrator" },
};

const pay = (basic: number, level: string, cell: number): PayParticulars => ({ basic, level, cell });

const OFFICERS: Officer[] = [
    { code: "OES-1021", name: "Dr. Sasmita Mohanty", designation: "Assistant Professor", cadre: CADRES[1], institution: INSTITUTIONS[0], dateOfJoining: "2014-07-01", current: pay(66800, "AL-10", 6), nextIncrement: "2027-07-01" },
    { code: "OES-1034", name: "Dr. Bikash Ranjan Sahu", designation: "Assistant Professor", cadre: CADRES[1], institution: INSTITUTIONS[1], dateOfJoining: "2026-08-12", current: pay(73000, "AL-10", 9), nextIncrement: "2027-07-01" },
    { code: "OES-1047", name: "Dr. Manaswini Behera", designation: "Assistant Professor", cadre: CADRES[1], institution: INSTITUTIONS[2], dateOfJoining: "2011-01-03", current: pay(77600, "AL-11", 5), nextIncrement: "2027-01-01" },
    { code: "OES-1052", name: "Dr. Rabindra Kumar Swain", designation: "Associate Professor", cadre: CADRES[0], institution: INSTITUTIONS[3], dateOfJoining: "2008-07-15", current: pay(131400, "AL-13A", 1), nextIncrement: "2027-07-01" },
    { code: "OES-1063", name: "Dr. Pratima Panda", designation: "Professor", cadre: CADRES[0], institution: INSTITUTIONS[4], dateOfJoining: "2003-02-01", current: pay(144200, "AL-14", 1), nextIncrement: "2027-07-01" },
    { code: "OES-1078", name: "Sri Debasis Mishra", designation: "Lecturer", cadre: CADRES[1], institution: INSTITUTIONS[0], dateOfJoining: "2019-07-01", current: pay(63000, "AL-10", 4), nextIncrement: "2027-07-01" },
    { code: "OES-1081", name: "Dr. Nirupama Jena", designation: "Reader", cadre: CADRES[0], institution: INSTITUTIONS[5], dateOfJoining: "2009-09-01", current: pay(89800, "AL-12", 5), nextIncrement: "2027-01-01" },
    { code: "OES-1090", name: "Dr. Ashok Kumar Rout", designation: "Assistant Professor", cadre: CADRES[1], institution: INSTITUTIONS[0], dateOfJoining: "2016-07-01", current: pay(64900, "AL-10", 5), nextIncrement: "2027-07-01" },
    { code: "OES-1095", name: "Dr. Smita Rani Sethi", designation: "Assistant Professor", cadre: CADRES[1], institution: INSTITUTIONS[2], dateOfJoining: "2026-09-02", current: pay(70900, "AL-10", 8), nextIncrement: "2027-07-01" },
    { code: "OES-1102", name: "Dr. Ramesh Ch. Barik", designation: "Assistant Professor", cadre: CADRES[1], institution: INSTITUTIONS[3], dateOfJoining: "2012-07-01", current: pay(79900, "AL-11", 6), nextIncrement: "2027-07-01" },
];

/** Movement entries for a proposal that has reached `status`. */
const trail = (status: ProposalStatus, d: { created: string; submitted?: string; verified?: string; decided?: string; by: string; remarks?: string }): Movement[] => {
    const m: Movement[] = [{ date: d.created, by: d.by, role: "Initiator", action: "Created (Draft)", remarks: "—" }];
    if (status === "Draft") return m;
    m.push({ date: d.submitted!, by: d.by, role: "Initiator", action: "Submitted", remarks: "Submitted for verification" });
    if (status === "Submitted") return m;
    if (status === "Returned") {
        m.push({ date: d.decided!, by: "Prakash Ch. Nayak", role: "Accounts / Establishment", action: "Returned for Correction", remarks: d.remarks ?? "" });
        return m;
    }
    m.push({ date: d.verified!, by: "Prakash Ch. Nayak", role: "Accounts / Establishment", action: "Verified", remarks: "Service record, documents and calculation verified." });
    if (status === "Verified") return m;
    if (status === "Rejected") {
        m.push({ date: d.decided!, by: "Rashmi Rekha Das", role: "Finance Officer", action: "Rejected", remarks: d.remarks ?? "" });
        return m;
    }
    if (status === "Approved") {
        m.push({ date: d.decided!, by: "Rashmi Rekha Das", role: "Finance Officer", action: "Approved (Finalised)", remarks: d.remarks ?? "Approved as verified." });
        return m;
    }
    m.push({ date: d.verified!, by: "Rashmi Rekha Das", role: "Finance Officer", action: "Forwarded to Competent Authority", remarks: "Recommended for sanction." });
    if (status === "Forwarded") return m;
    m.push({ date: d.decided!, by: "A. K. Pattnaik", role: "Competent Authority", action: "Sanctioned", remarks: d.remarks ?? "Sanctioned." });
    return m;
};

const doc = (id: string, kind: string, fileName: string, uploadedOn: string) => ({ id, kind, fileName, uploadedOn });

interface Seed {
    n: number;
    type: ProposalType;
    officer: string;
    event: EventReason;
    eventDate: string;
    existing: PayParticulars;
    proposed: PayParticulars;
    status: ProposalStatus;
    created: string;
    submitted?: string;
    verified?: string;
    decided?: string;
    remarks?: string;
    createdBy: "officer" | "college";
    justification: string;
    docs: [string, string][];
}

const SEEDS: Seed[] = [
    { n: 1, type: "Pay Fixation", officer: "OES-1021", event: "Promotion", eventDate: "2026-09-01", existing: pay(66800, "AL-10", 6), proposed: pay(68900, "AL-11", 1), status: "Submitted", created: "2026-10-18", submitted: "2026-10-20", createdBy: "officer", justification: "Promoted to Senior Scale (AL-11) under CAS with effect from 01-09-2026 vide Notification No. 18642/HE dated 22-08-2026. Pay fixed with one notional increment in AL-10.", docs: [["Promotion Order", "CAS_Promotion_Order_18642.pdf"], ["Last Pay Certificate", "LPC_Aug2026.pdf"], ["Service Book Extract", "ServiceBook_p12-14.pdf"]] },
    { n: 2, type: "Pay Protection", officer: "OES-1034", event: "Appointment", eventDate: "2026-08-12", existing: pay(73000, "AL-10", 9), proposed: pay(73100, "AL-11", 3), status: "Verified", created: "2026-08-25", submitted: "2026-08-26", verified: "2026-09-04", createdBy: "college", justification: "Appointed through OPSC from Central University service; last pay drawn ₹73,000 to be protected under Rule 74 of ORSP Rules, 2017.", docs: [["Appointment Order", "OPSC_Appointment_2214.pdf"], ["Last Pay Certificate", "LPC_CentralUniv.pdf"], ["Relieving Order", "Relieving_Order.pdf"], ["Service Book Extract", "ServiceBook_Extract.pdf"]] },
    { n: 3, type: "Pay Fixation", officer: "OES-1047", event: "Promotion", eventDate: "2026-07-01", existing: pay(77600, "AL-11", 5), proposed: pay(79800, "AL-12", 1), status: "Forwarded", created: "2026-07-20", submitted: "2026-07-22", verified: "2026-08-02", createdBy: "college", justification: "Placed in Selection Grade (AL-12) w.e.f. 01-07-2026 on recommendation of the Screening Committee.", docs: [["Promotion Order", "SelectionGrade_Order.pdf"], ["Last Pay Certificate", "LPC_Jun2026.pdf"], ["Service Book Extract", "SB_Extract.pdf"]] },
    { n: 4, type: "Pay Fixation", officer: "OES-1052", event: "Promotion", eventDate: "2026-06-01", existing: pay(87200, "AL-12", 4), proposed: pay(131400, "AL-13A", 1), status: "Approved", created: "2026-06-10", submitted: "2026-06-11", verified: "2026-06-20", decided: "2026-06-28", remarks: "Approved. Office order to be issued by the institution.", createdBy: "college", justification: "Promoted to Associate Professor (AL-13A) under CAS w.e.f. 01-06-2026.", docs: [["Promotion Order", "Assoc_Prof_Order.pdf"], ["Last Pay Certificate", "LPC_May2026.pdf"], ["Service Book Extract", "SB_pages.pdf"]] },
    { n: 5, type: "Pay Fixation", officer: "OES-1063", event: "Promotion", eventDate: "2026-04-01", existing: pay(139400, "AL-13A", 3), proposed: pay(144200, "AL-14", 1), status: "Sanctioned", created: "2026-04-08", submitted: "2026-04-09", verified: "2026-04-21", decided: "2026-05-06", remarks: "Sanctioned as recommended by FO.", createdBy: "officer", justification: "Promoted to Professor (AL-14) w.e.f. 01-04-2026.", docs: [["Promotion Order", "Professor_Order.pdf"], ["Last Pay Certificate", "LPC_Mar2026.pdf"], ["Service Book Extract", "SB_Extract.pdf"]] },
    { n: 6, type: "Pay Protection", officer: "OES-1078", event: "Transfer", eventDate: "2026-08-01", existing: pay(63000, "AL-10", 4), proposed: pay(63000, "AL-10", 4), status: "Returned", created: "2026-08-14", submitted: "2026-08-16", decided: "2026-08-24", remarks: "Service book extract for the period 2019–2023 is missing. Please upload and resubmit.", createdBy: "college", justification: "Transferred from a non-government aided post on absorption; pay to be protected.", docs: [["Transfer / Absorption Order", "Absorption_Order.pdf"], ["Last Pay Certificate", "LPC_Jul2026.pdf"]] },
    { n: 7, type: "Pay Fixation", officer: "OES-1081", event: "Other", eventDate: "2026-05-15", existing: pay(89800, "AL-12", 5), proposed: pay(95300, "AL-12", 7), status: "Rejected", created: "2026-05-20", submitted: "2026-05-21", verified: "2026-06-01", decided: "2026-06-09", remarks: "Two advance increments claimed for Ph.D. are not admissible after the 2018 regulations.", createdBy: "officer", justification: "Request for two advance increments on award of Ph.D.", docs: [["Supporting Order", "PhD_Award.pdf"], ["Last Pay Certificate", "LPC_Apr2026.pdf"]] },
    { n: 8, type: "Pay Fixation", officer: "OES-1090", event: "Promotion", eventDate: "2026-10-01", existing: pay(64900, "AL-10", 5), proposed: pay(68900, "AL-11", 1), status: "Draft", created: "2026-10-24", createdBy: "college", justification: "Senior scale promotion w.e.f. 01-10-2026 (draft — LPC awaited).", docs: [["Promotion Order", "SeniorScale_Order.pdf"]] },
    { n: 9, type: "Pay Protection", officer: "OES-1095", event: "Appointment", eventDate: "2026-09-02", existing: pay(70900, "AL-10", 8), proposed: pay(71000, "AL-11", 2), status: "Submitted", created: "2026-10-05", submitted: "2026-10-08", createdBy: "college", justification: "Appointed from State Government service (Lecturer, SCERT); last pay drawn ₹70,900 to be protected.", docs: [["Appointment Order", "Appointment_OPSC.pdf"], ["Last Pay Certificate", "LPC_SCERT.pdf"], ["Relieving Order", "Relieving_SCERT.pdf"], ["Service Book Extract", "SB_SCERT.pdf"]] },
    { n: 10, type: "Pay Fixation", officer: "OES-1102", event: "Promotion", eventDate: "2026-07-01", existing: pay(79900, "AL-11", 6), proposed: pay(82200, "AL-12", 2), status: "Verified", created: "2026-09-10", submitted: "2026-09-12", verified: "2026-09-25", createdBy: "college", justification: "Selection Grade (AL-12) w.e.f. 01-07-2026.", docs: [["Promotion Order", "SG_Order_Barik.pdf"], ["Last Pay Certificate", "LPC_Barik.pdf"], ["Service Book Extract", "SB_Barik.pdf"]] },
    { n: 11, type: "Pay Fixation", officer: "OES-1081", event: "Revision", eventDate: "2026-01-01", existing: pay(87200, "AL-12", 4), proposed: pay(89800, "AL-12", 5), status: "Approved", created: "2026-01-12", submitted: "2026-01-13", verified: "2026-01-22", decided: "2026-02-02", createdBy: "college", justification: "Annual revision / increment fixation.", docs: [["Revision Order", "Revision_Order_2026.pdf"], ["Last Pay Certificate", "LPC_Dec2025.pdf"]] },
];

const buildProposal = (s: Seed): Proposal => {
    const o = OFFICERS.find((x) => x.code === s.officer)!;
    const id = `PFP-2026-${String(s.n).padStart(4, "0")}`;
    const by = s.createdBy === "officer" ? o.name : CURRENT_USER.college.name;
    const closed = s.status === "Approved" || s.status === "Sanctioned";
    return {
        id,
        type: s.type,
        officerCode: o.code,
        officerName: o.name,
        designation: o.designation,
        cadre: o.cadre,
        institution: o.institution,
        event: s.event,
        eventDate: s.eventDate,
        existing: s.existing,
        proposed: s.proposed,
        nextIncrement: o.nextIncrement,
        justification: s.justification,
        documents: s.docs.map(([kind, fileName], i) => doc(`${id}-D${i + 1}`, kind, fileName, s.submitted ?? s.created)),
        declaration: s.status !== "Draft",
        status: s.status,
        pendingWith: PENDING_WITH[s.status],
        createdDate: s.created,
        submittedDate: s.submitted ?? "—",
        decisionDate: s.decided ?? "—",
        orderNo: closed ? `HE-PF-${s.n}${s.decided!.slice(5, 7)}/2026` : "—",
        createdBy: s.createdBy,
        movement: trail(s.status, { created: s.created, submitted: s.submitted, verified: s.verified, decided: s.decided, by, remarks: s.remarks }),
    };
};

/** Pre-system decisions (migrated from service books). */
const LEGACY: HistoryRecord[] = [
    { id: "H-001", officerCode: "OES-1021", proposalId: "Legacy", type: "Pay Fixation", event: "Appointment", effectiveDate: "2014-07-01", from: pay(0, "—", 0), to: pay(57700, "AL-10", 1), orderNo: "HE-ESTT-2214/2014", orderDate: "2014-07-05", sanctionedBy: "DHE", remarks: "Initial pay on appointment (revised under ORSP 2017)." },
    { id: "H-002", officerCode: "OES-1021", proposalId: "Legacy", type: "Pay Fixation", event: "Revision", effectiveDate: "2016-01-01", from: pay(15600, "PB-3 / AGP 6000", 0), to: pay(59400, "AL-10", 2), orderNo: "FIN-ORSP-1101/2017", orderDate: "2017-11-30", sanctionedBy: "Finance Officer", remarks: "Fixation on ORSP 2017 (7th Pay) revision." },
    { id: "H-003", officerCode: "OES-1063", proposalId: "Legacy", type: "Pay Fixation", event: "Promotion", effectiveDate: "2019-04-01", from: pay(131400, "AL-13A", 1), to: pay(135300, "AL-13A", 2), orderNo: "HE-CAS-0904/2019", orderDate: "2019-04-18", sanctionedBy: "DHE", remarks: "Associate Professor — increment on CAS." },
    { id: "H-004", officerCode: "OES-1052", proposalId: "Legacy", type: "Pay Protection", event: "Transfer", effectiveDate: "2015-02-01", from: pay(74400, "AL-11", 3), to: pay(75300, "AL-11", 4), orderNo: "HE-ESTT-0211/2015", orderDate: "2015-02-14", sanctionedBy: "DHE", remarks: "Pay protected on inter-university transfer." },
];

/** History of decisions: every approved / sanctioned proposal plus the legacy records. */
export const historyFromProposal = (p: Proposal): HistoryRecord => ({
    id: `H-${p.id}`,
    officerCode: p.officerCode,
    proposalId: p.id,
    type: p.type,
    event: p.event,
    effectiveDate: p.eventDate,
    from: p.existing,
    to: p.verified ?? p.proposed,
    orderNo: p.orderNo,
    orderDate: p.decisionDate,
    sanctionedBy: p.status === "Sanctioned" ? "Competent Authority" : "Finance Officer",
    remarks: p.movement.at(-1)?.remarks ?? "",
});

export const DEFAULT_CONFIG: PayFixConfig = {
    documents: [
        { id: "DOC-1", name: "Appointment Order", types: ["Pay Fixation", "Pay Protection"], events: ["Appointment"], mandatory: true },
        { id: "DOC-2", name: "Promotion Order", types: ["Pay Fixation"], events: ["Promotion"], mandatory: true },
        { id: "DOC-3", name: "Revision Order", types: ["Pay Fixation"], events: ["Revision"], mandatory: true },
        { id: "DOC-4", name: "Transfer / Absorption Order", types: ["Pay Fixation", "Pay Protection"], events: ["Transfer"], mandatory: true },
        { id: "DOC-5", name: "Last Pay Certificate", types: ["Pay Fixation", "Pay Protection"], events: [], mandatory: true },
        { id: "DOC-6", name: "Service Book Extract", types: ["Pay Fixation", "Pay Protection"], events: ["Appointment", "Promotion", "Transfer"], mandatory: true },
        { id: "DOC-7", name: "Relieving Order", types: ["Pay Protection"], events: ["Appointment"], mandatory: true },
        { id: "DOC-8", name: "Pay Bill (last 3 months)", types: ["Pay Protection"], events: [], mandatory: false },
        { id: "DOC-9", name: "Supporting Order", types: ["Pay Fixation", "Pay Protection"], events: ["Other"], mandatory: true },
    ],
    payLevels: [
        { level: "AL-10", entryPay: 57700, cells: 34, cadre: CADRES[1] },
        { level: "AL-11", entryPay: 68900, cells: 32, cadre: CADRES[1] },
        { level: "AL-12", entryPay: 79800, cells: 30, cadre: CADRES[0] },
        { level: "AL-13A", entryPay: 131400, cells: 18, cadre: CADRES[0] },
        { level: "AL-14", entryPay: 144200, cells: 14, cadre: CADRES[0] },
    ],
    workflow: [
        { id: "WF-1", order: 1, name: "Submission", role: "OES Officer / College Admin", actions: ["Submit", "Save as Draft"], slaDays: 0, optional: false },
        { id: "WF-2", order: 2, name: "Verification", role: "Accounts / Establishment Officer", actions: ["Verify", "Return", "Reject"], slaDays: 7, optional: false },
        { id: "WF-3", order: 3, name: "Approval", role: "Finance Officer (FO)", actions: ["Approve", "Forward", "Return", "Reject"], slaDays: 7, optional: false },
        { id: "WF-4", order: 4, name: "Sanction", role: "DHE / Competent Authority", actions: ["Sanction", "Return", "Reject"], slaDays: 10, optional: true },
    ],
    notifications: [
        { id: "NT-1", trigger: "Proposal submitted", recipients: "Accounts / Establishment Officer", channels: ["In-app", "Email"], enabled: true },
        { id: "NT-2", trigger: "Proposal verified", recipients: "Finance Officer", channels: ["In-app"], enabled: true },
        { id: "NT-3", trigger: "Forwarded to Competent Authority", recipients: "DHE / Competent Authority", channels: ["In-app", "Email"], enabled: true },
        { id: "NT-4", trigger: "Returned for correction", recipients: "Initiator", channels: ["In-app", "SMS", "Email"], enabled: true },
        { id: "NT-5", trigger: "Rejected", recipients: "Initiator, OES Officer", channels: ["In-app", "Email"], enabled: true },
        { id: "NT-6", trigger: "Approved / Sanctioned", recipients: "Initiator, OES Officer, Institution", channels: ["In-app", "SMS", "Email"], enabled: true },
        { id: "NT-7", trigger: "SLA breached at a stage", recipients: "Next higher authority", channels: ["Email"], enabled: false },
    ],
    rules: { blockDuplicateOpen: true, ruleEngine: true, lockAfterApproval: true, allowAdminOnBehalf: true, verifierCanEdit: true },
};

export const createInitialData = (): PayFixData => {
    const proposals = SEEDS.map(buildProposal).reverse();
    return {
        officers: structuredClone(OFFICERS),
        proposals,
        history: [...proposals.filter((p) => p.status === "Approved" || p.status === "Sanctioned").map(historyFromProposal), ...LEGACY],
        config: structuredClone(DEFAULT_CONFIG),
        audit: [
            { id: "AUD-5", dt: "2026-10-20 11:42", user: "Dr. Sasmita Mohanty", role: "OES Officer", action: "Submitted proposal", ref: "PFP-2026-0001" },
            { id: "AUD-4", dt: "2026-10-08 16:05", user: "Principal, BJB Autonomous College", role: "College / University Admin", action: "Submitted proposal", ref: "PFP-2026-0009" },
            { id: "AUD-3", dt: "2026-09-25 12:30", user: "Prakash Ch. Nayak", role: "Accounts / Establishment Officer", action: "Verified proposal", ref: "PFP-2026-0010" },
            { id: "AUD-2", dt: "2026-09-02 10:14", user: "System Administrator", role: "System Administrator / Functional Admin", action: "Updated workflow: SLA for Sanction set to 10 days", ref: "WF-4" },
            { id: "AUD-1", dt: "2026-08-24 15:20", user: "Prakash Ch. Nayak", role: "Accounts / Establishment Officer", action: "Returned proposal for correction", ref: "PFP-2026-0006" },
        ],
        notifications: [],
    };
};

