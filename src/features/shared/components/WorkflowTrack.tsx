import { Stepper, type StepperStep } from "@mfe/components";
import type { ProposalStatus } from "../types/payfix.types";

const STEPS: StepperStep[] = [
    { id: "submit", label: "Submitted", description: "OES Officer / Admin" },
    { id: "verify", label: "Verification", description: "Accounts / Establishment" },
    { id: "approve", label: "Approval", description: "Finance Officer" },
    { id: "sanction", label: "Sanction", description: "Competent Authority (if required)" },
    { id: "done", label: "Approved / Sanctioned", description: "Order issued" },
];

/** Index of the current step for each status (Returned / Rejected stop where they happened). */
const CURRENT: Record<ProposalStatus, number> = {
    Draft: 0,
    Returned: 0,
    Submitted: 1,
    Verified: 2,
    Forwarded: 3,
    Rejected: 2,
    Approved: 5,
    Sanctioned: 5,
};

/** Where the proposal is in the Accounts → FO → Competent Authority chain (SRS 1.4 Workflow Summary). */
export const WorkflowTrack = ({ status }: { status: ProposalStatus }) => <Stepper steps={STEPS} current={CURRENT[status]} />;

export default WorkflowTrack;
