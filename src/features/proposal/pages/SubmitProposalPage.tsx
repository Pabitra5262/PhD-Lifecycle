import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Save, Send } from "lucide-react";
import { Alert, Button, Card, CardBody, StatusModal, Stepper, showToast, useAppNavigate, type StatusModalType } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import {
    PENDING_WITH,
    ProposalSummary,
    isEditable,
    matrixMismatch,
    payAt,
    suggestPay,
    useCurrentUser,
    type Proposal,
    type ProposalType,
    type EventReason,
} from "../../shared";
import { DocumentsStep, OfficerStep, PayStep } from "../components/ProposalFormSteps";
import { useProposalDetail } from "../hooks/useProposalDetail";
import { toForm, useProposalMutations } from "../hooks/useProposalMutations";
import { useProposalOptions } from "../hooks/useProposalOptions";
import { EMPTY_FORM, type ProposalFormData, type ProposalFormErrors } from "../types/proposal.types";
import { FIELD_STEP, requiredDocuments } from "../validation/proposalSchema";

const STEPS = [
    { id: "officer", label: "Proposal & Officer", description: "Type, officer, posting" },
    { id: "pay", label: "Event & Pay", description: "Existing and proposed pay" },
    { id: "docs", label: "Documents", description: "Checklist and declaration" },
    { id: "review", label: "Review & Submit", description: "Check before submitting" },
];

/** SRS 1.2 — Submit Pay Fixation or Pay Protection Proposal (also edits a Draft / Returned proposal). */
const SubmitProposalPage = () => {
    const navigate = useAppNavigate();
    const { proposalId } = useParams();
    const { proposal: editing } = useProposalDetail(proposalId);
    const user = useCurrentUser();
    const options = useProposalOptions();
    const { save } = useProposalMutations();

    const [form, setForm] = useState<ProposalFormData>(() => {
        if (editing && isEditable(editing)) return toForm(editing);
        // OES Officer: own particulars are pre-filled from the officer master.
        const self = user.roleKey === "officer" ? options.officers[0] : undefined;
        return self
            ? { ...EMPTY_FORM, officerCode: self.code, designation: self.designation, cadre: self.cadre, institution: self.institution, existingBasic: String(self.current.basic), existingLevel: self.current.level, existingCell: String(self.current.cell), nextIncrement: self.nextIncrement }
            : EMPTY_FORM;
    });
    const [errors, setErrors] = useState<ProposalFormErrors>({});
    const [step, setStep] = useState(0);
    const [modal, setModal] = useState<{ type: StatusModalType; title: string; message: string; goTo?: string } | null>(null);

    const officer = options.officers.find((o) => o.code === form.officerCode);
    const required = requiredDocuments(options.documents, form.type, form.event);
    const ruleMessage = matrixMismatch({ basic: Number(form.proposedBasic), level: form.proposedLevel, cell: Number(form.proposedCell) }, options.payLevels);

    const setField = <K extends keyof ProposalFormData>(key: K, value: ProposalFormData[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
    };

    // Picking an officer auto-fetches designation, cadre, posting and existing pay.
    const onOfficerChange = (code: string) => {
        const o = options.officers.find((x) => x.code === code);
        if (!o) return setField("officerCode", code);
        setForm((f) => ({
            ...f,
            officerCode: o.code,
            designation: o.designation,
            cadre: o.cadre,
            institution: o.institution,
            existingBasic: String(o.current.basic),
            existingLevel: o.current.level,
            existingCell: String(o.current.cell),
            nextIncrement: f.nextIncrement || o.nextIncrement,
        }));
        setErrors({});
    };

    const onCalculate = () => {
        const newLevel = options.payLevels.find((l) => l.level === form.proposedLevel);
        if (!newLevel || !form.type) return;
        const s = suggestPay(form.type as ProposalType, { basic: Number(form.existingBasic), level: form.existingLevel, cell: Number(form.existingCell) }, newLevel, options.payLevels);
        setForm((f) => ({ ...f, proposedCell: String(s.cell), proposedBasic: String(s.basic) }));
        setErrors((e) => ({ ...e, proposedCell: undefined, proposedBasic: undefined }));
        showToast.info("Proposed pay calculated", `${s.level} cell ${s.cell}: ₹${s.basic.toLocaleString("en-IN")}`);
    };

    const payFor = (level: string, cell: string) => payAt(options.payLevels.find((l) => l.level === level), Number(cell));

    const submit = (mode: "draft" | "submit") => {
        const result = save(form, mode, editing && isEditable(editing) ? editing.id : undefined);
        if (result.ok) {
            if (mode === "draft") {
                showToast.success("Saved as draft", `${result.id} can be completed later from View Proposals.`);
                navigate(`/proposals/${result.id}`);
            } else {
                setModal({ type: "success", title: "Proposal submitted", message: `Proposal ${result.id} has been submitted and routed to Accounts / Establishment for verification.`, goTo: `/proposals/${result.id}` });
            }
            return;
        }
        if (result.errors) {
            setErrors(result.errors);
            const first = Object.keys(result.errors).find((k) => result.errors![k as keyof ProposalFormErrors]);
            const target = first?.startsWith("doc:") ? 2 : (FIELD_STEP[first as keyof ProposalFormData] ?? step);
            setStep(target);
        }
        setModal({
            type: result.blocker ? "warning" : "error",
            title: result.blocker ? "Cannot submit" : "Mandatory fields missing",
            message: result.blocker ?? "Fill all mandatory fields, upload the required documents and accept the declaration.",
        });
    };

    // Preview record for the Review step.
    const preview = useMemo<Proposal>(
        () => ({
            id: editing?.id ?? "(generated on submit)",
            type: (form.type || "Pay Fixation") as ProposalType,
            officerCode: form.officerCode,
            officerName: officer?.name ?? "—",
            designation: form.designation,
            cadre: form.cadre,
            institution: form.institution,
            event: (form.event || "Other") as EventReason,
            eventDate: form.eventDate || "—",
            existing: { basic: Number(form.existingBasic) || 0, level: form.existingLevel || "—", cell: Number(form.existingCell) || 0 },
            proposed: { basic: Number(form.proposedBasic) || 0, level: form.proposedLevel || "—", cell: Number(form.proposedCell) || 0 },
            nextIncrement: form.nextIncrement || "—",
            justification: form.justification || "—",
            documents: Object.entries(form.documents).map(([kind, fileName], i) => ({ id: `P${i}`, kind, fileName, uploadedOn: "now" })),
            declaration: form.declaration,
            status: "Draft",
            pendingWith: PENDING_WITH.Submitted,
            createdDate: "—",
            submittedDate: "—",
            decisionDate: "—",
            orderNo: "—",
            createdBy: user.roleKey,
            movement: [],
        }),
        [form, officer, editing, user.roleKey],
    );

    if (editing && !isEditable(editing)) {
        return (
            <>
                <PageHeader title="Edit Proposal"  />
                <Card title="This proposal cannot be edited">
                    <p className="text-sm">Only Draft or Returned proposals can be edited. {editing.id} is already in the workflow.</p>
                    <Button className="mt-4" action="back" label="Open proposal" onClick={() => navigate(`/proposals/${editing.id}`)} />
                </Card>
            </>
        );
    }

    // Form buttons: shown inside the current step's last card.
    const buttons = (
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <Button action="cancel" onClick={() => navigate("/proposals")} />
            <div className="flex flex-wrap gap-2">
                <Button variant="outline" icon={<Save size={16} />} label="Save as Draft" onClick={() => submit("draft")} />
                {step > 0 && <Button variant="secondary" icon={<ArrowLeft size={16} />} label="Back" onClick={() => setStep(step - 1)} />}
                {step < STEPS.length - 1 ? (
                    <Button icon={<ArrowRight size={16} />} label="Next" onClick={() => setStep(step + 1)} />
                ) : (
                    <Button variant="success" icon={<Send size={16} />} label={editing?.status === "Returned" ? "Re-submit" : "Submit"} onClick={() => submit("submit")} />
                )}
            </div>
        </div>
    );

    const title = editing ? (editing.status === "Returned" ? "Correct & Re-submit Proposal" : "Edit Draft Proposal") : "Submit Proposal";
    const returnedRemark = editing?.status === "Returned" ? editing.movement.at(-1)?.remarks : undefined;

    return (
        <>
            <PageHeader
                title={title}
                
            />

            {returnedRemark && (
                <Alert tone="warning" className="mb-4" title="Returned for correction">
                    {returnedRemark}
                </Alert>
            )}

            <Card className="mb-4">
                <CardBody>
                    <Stepper steps={STEPS} current={step} onStepClick={setStep} />
                </CardBody>
            </Card>

            {step === 0 && (
                <OfficerStep
                    form={form}
                    errors={errors}
                    setField={setField}
                    officerOptions={options.officerOptions}
                    cadreOptions={options.cadreOptions}
                    designationOptions={options.designationOptions}
                    institutionOptions={options.institutionOptions}
                    lockOfficer={user.roleKey === "officer"}
                    officer={officer}
                    onOfficerChange={onOfficerChange}
                    footer={buttons}
                />
            )}
            {step === 1 && (
                <PayStep
                    form={form}
                    errors={errors}
                    setField={setField}
                    eventOptions={options.eventOptions}
                    levelOptions={options.levelOptions}
                    ruleMessage={ruleMessage}
                    ruleEngine={options.rules.ruleEngine}
                    onCalculate={onCalculate}
                    payFor={payFor}
                    footer={buttons}
                />
            )}
            {step === 2 && <DocumentsStep form={form} errors={errors} setField={setField} required={required} footer={buttons} />}
            {step === 3 && <ProposalSummary proposal={preview} footer={buttons} />}

            <StatusModal
                isOpen={!!modal}
                type={modal?.type}
                title={modal?.title}
                message={modal?.message ?? ""}
                onClose={() => {
                    const goTo = modal?.goTo;
                    setModal(null);
                    if (goTo) navigate(goTo);
                }}
            />
        </>
    );
};

export default SubmitProposalPage;
