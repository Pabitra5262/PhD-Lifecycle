import type { ReactNode } from "react";
import { CircleCheck, CornerUpLeft, Forward, Gavel, CircleX } from "lucide-react";
import { Button, Card, Input, Select, TextArea, type ButtonVariant, type Option } from "@mfe/components";
import type { PayParticulars } from "../../shared";
import type { WorkflowAction } from "../hooks/useVerificationActions";

const BUTTON: Record<WorkflowAction, { variant: ButtonVariant; icon: ReactNode }> = {
    verify: { variant: "success", icon: <CircleCheck size={16} /> },
    approve: { variant: "success", icon: <CircleCheck size={16} /> },
    forward: { variant: "primary", icon: <Forward size={16} /> },
    sanction: { variant: "success", icon: <Gavel size={16} /> },
    return: { variant: "warning", icon: <CornerUpLeft size={16} /> },
    reject: { variant: "danger", icon: <CircleX size={16} /> },
};

interface VerificationPanelProps {
    actions: WorkflowAction[];
    labels: Record<WorkflowAction, string>;
    /** Accounts / Establishment may correct basic, level and cell (configurable). */
    canEditPay: boolean;
    verified: PayParticulars;
    onVerifiedChange: (p: PayParticulars) => void;
    levelOptions: Option[];
    /** Matrix basic for the chosen level / cell, shown as a hint. */
    matrixPay: number;
    remarks: string;
    onRemarksChange: (v: string) => void;
    remarksError?: string;
    /** "Verification Remarks" for Accounts, "Approval Remarks" for FO / Competent Authority. */
    remarksLabel: string;
    onAction: (a: WorkflowAction) => void;
}

/** SRS 1.4 Verification & Approval fields: Verified Pay Particulars, Remarks, Action buttons. */
export const VerificationPanel = ({
    actions,
    labels,
    canEditPay,
    verified,
    onVerifiedChange,
    levelOptions,
    matrixPay,
    remarks,
    onRemarksChange,
    remarksError,
    remarksLabel,
    onAction,
}: VerificationPanelProps) => (
    <Card title="Verification & Decision" className="lg:sticky lg:top-4">
        <div className="flex flex-col gap-4">
            <fieldset className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <legend className="mb-2 text-sm font-semibold">Verified Pay Particulars</legend>
                <Select label="Pay Level" options={levelOptions} value={verified.level} readOnly={!canEditPay} onChange={(v) => onVerifiedChange({ ...verified, level: String(v) })} />
                <Input label="Cell" type="number" min={1} value={String(verified.cell)} readOnly={!canEditPay} onChange={(e) => onVerifiedChange({ ...verified, cell: Number(e.target.value) })} />
                <Input
                    label="Basic (₹)"
                    type="number"
                    value={String(verified.basic)}
                    readOnly={!canEditPay}
                    onChange={(e) => onVerifiedChange({ ...verified, basic: Number(e.target.value) })}
                    helpText={matrixPay ? `Matrix: ₹${matrixPay.toLocaleString("en-IN")}` : undefined}
                />
            </fieldset>
            {!canEditPay && <p className="-mt-2 text-xs text-muted-foreground">Read-only at this stage — figures as verified by Accounts / Establishment.</p>}
            <TextArea label={remarksLabel} rows={1} showCount maxLength={500} value={remarks} onChange={(e) => onRemarksChange(e.target.value)} error={remarksError} placeholder="Observations on service record, documents and calculation…" />
            <div className="flex flex-col gap-2">
                {actions.map((a) => (
                    <Button key={a} variant={BUTTON[a].variant} icon={BUTTON[a].icon} label={labels[a]} onClick={() => onAction(a)} className="w-full justify-center" />
                ))}
            </div>
        </div>
    </Card>
);

export default VerificationPanel;
