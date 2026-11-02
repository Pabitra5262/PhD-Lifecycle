import { Badge, type BadgeVariant } from "@mfe/components";
import type { ProposalStatus } from "../types/payfix.types";
import { STATUS_LABEL } from "../workflow";

const VARIANT: Record<ProposalStatus, BadgeVariant> = {
    Draft: "secondary",
    Submitted: "info",
    Verified: "warning",
    Forwarded: "warning",
    Approved: "success",
    Sanctioned: "success",
    Returned: "warning",
    Rejected: "danger",
};

/** Status Tag (SRS 1.3): Draft / Under Verification / Pending Approval / Approved / Rejected / Returned. */
export const ProposalStatusBadge = ({ status }: { status: ProposalStatus }) => (
    <Badge variant={VARIANT[status]} size="sm">
        {STATUS_LABEL[status]}
    </Badge>
);

export default ProposalStatusBadge;
