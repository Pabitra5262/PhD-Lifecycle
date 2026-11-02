import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, CardBody, DialogModal, StatusModal, useAppNavigate } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import {
    MovementHistory,
    ProposalSummary,
    STAGE_ROLE,
    STATUS_LABEL,
    WorkflowTrack,
    payAt,
    useCurrentUser,
    usePayFix,
    type PayParticulars,
} from "../../shared";
import { VerificationPanel } from "../components/VerificationPanel";
import { ACTION_META, useVerificationActions, type WorkflowAction } from "../hooks/useVerificationActions";

/** SRS 1.4 — open a proposal from the queue, check it, record remarks and Verify / Approve / Return / Reject. */
const VerificationReviewPage = () => {
    const navigate = useAppNavigate();
    const { proposalId } = useParams();
    const { data } = usePayFix();
    const { roleKey } = useCurrentUser();
    const { act, actions, canEditPay } = useVerificationActions();
    const p = data.proposals.find((x) => x.id === proposalId);

    const [verified, setVerified] = useState<PayParticulars>(() => (p ? { ...(p.verified ?? p.proposed) } : { basic: 0, level: "", cell: 0 }));
    const [remarks, setRemarks] = useState("");
    const [remarksError, setRemarksError] = useState<string>();
    const [confirm, setConfirm] = useState<WorkflowAction | null>(null);
    const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

    // Once acted on, the proposal leaves this stage: keep the page until the result pop-up is closed.
    if (!p || (STAGE_ROLE[p.status] !== roleKey && !result)) {
        return (
            <>
                <PageHeader title="Verify / Approve"  />
                <Card title={p ? "Not at your stage" : "Proposal not found"}>
                    <p className="text-sm">
                        {p ? `${p.id} is ${STATUS_LABEL[p.status]} and pending with ${p.pendingWith}. You are not authorised for the current stage.` : `No proposal with number ${proposalId} exists.`}
                    </p>
                    <div className="mt-4 flex gap-2">
                        <Button action="back" label="Back to queue" onClick={() => navigate("/verification")} />
                        {p && <Button variant="outline" label="View proposal" onClick={() => navigate(`/proposals/${p.id}`)} />}
                    </div>
                </Card>
            </>
        );
    }

    const labels = Object.fromEntries(Object.entries(ACTION_META).map(([k, v]) => [k, v.label])) as Record<WorkflowAction, string>;
    const levelOptions = data.config.payLevels.map((l) => ({ value: l.level, label: l.level }));
    const matrixPay = payAt(data.config.payLevels.find((l) => l.level === verified.level), verified.cell);

    const start = (a: WorkflowAction) => {
        if (ACTION_META[a].needsRemarks && remarks.trim().length < 10) {
            setRemarksError("Remarks (at least 10 characters) are mandatory to Reject or Return.");
            return;
        }
        setRemarksError(undefined);
        setConfirm(a);
    };

    const run = () => {
        if (!confirm) return;
        const r = act(p.id, confirm, remarks, canEditPay ? verified : undefined);
        setConfirm(null);
        setResult(r.ok ? { ok: true, message: `${p.id} is now ${STATUS_LABEL[r.status!]}.` } : { ok: false, message: r.error ?? "Could not update the status." });
    };

    return (
        <>
            <PageHeader
                title={`Verify / Approve — ${p.id}`}
                
            />

            <Card className="mb-4">
                <CardBody>
                    <WorkflowTrack status={p.status} />
                </CardBody>
            </Card>

            <div className="grid items-start gap-4 lg:grid-cols-[1fr_360px]">
                <div className="flex flex-col gap-4">
                    <ProposalSummary proposal={p} />
                    <Card title="Remarks & Movement History">
                        <MovementHistory items={p.movement} />
                    </Card>
                </div>
                <VerificationPanel
                    actions={actions}
                    labels={labels}
                    canEditPay={canEditPay}
                    verified={verified}
                    onVerifiedChange={setVerified}
                    levelOptions={levelOptions}
                    matrixPay={matrixPay}
                    remarks={remarks}
                    onRemarksChange={(v) => {
                        setRemarks(v);
                        setRemarksError(undefined);
                    }}
                    remarksError={remarksError}
                    remarksLabel={roleKey === "accounts" ? "Verification Remarks" : "Approval Remarks"}
                    onAction={start}
                />
            </div>

            <DialogModal
                isOpen={!!confirm}
                onClose={() => setConfirm(null)}
                onConfirm={run}
                type={confirm === "reject" ? "danger" : confirm === "return" ? "warning" : "success"}
                title={confirm ? `${ACTION_META[confirm].label}?` : ""}
                message={confirm ? `${p.id} will move to “${STATUS_LABEL[ACTION_META[confirm].status]}”. The action and your remarks are recorded in the audit trail and the initiator is notified.` : ""}
                confirmText="Confirm"
            />
            <StatusModal
                isOpen={!!result}
                type={result?.ok ? "success" : "error"}
                title={result?.ok ? "Status updated" : "Action failed"}
                message={result?.message ?? ""}
                onClose={() => {
                    const ok = result?.ok;
                    setResult(null);
                    if (ok) navigate("/verification");
                }}
            />
        </>
    );
};

export default VerificationReviewPage;
