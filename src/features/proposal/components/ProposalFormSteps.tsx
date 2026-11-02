import type { ReactNode } from "react";
import { Calculator, Info } from "lucide-react";
import { Alert, Button, Card, CardBody, Checkbox, DatePicker, Input, RadioGroup, Select, TextArea, UploadFile } from "@mfe/components";
import type { DocumentRequirement, Officer } from "../../shared";
import type { Option } from "@mfe/components";
import type { ProposalFormData, ProposalFormErrors } from "../types/proposal.types";

type SetField = <K extends keyof ProposalFormData>(key: K, value: ProposalFormData[K]) => void;

interface StepProps {
    form: ProposalFormData;
    errors: ProposalFormErrors;
    setField: SetField;
    /** Form buttons, shown at the bottom of the step's last card. */
    footer?: ReactNode;
}

/* ---- Step 1: Proposal type & officer ------------------------------------ */

interface OfficerStepProps extends StepProps {
    officerOptions: Option[];
    cadreOptions: Option[];
    designationOptions: Option[];
    institutionOptions: Option[];
    /** OES Officer: own record only, officer cannot be changed. */
    lockOfficer: boolean;
    officer?: Officer;
    onOfficerChange: (code: string) => void;
}

export const OfficerStep = ({ form, errors, setField, officerOptions, cadreOptions, designationOptions, institutionOptions, lockOfficer, officer, onOfficerChange, footer }: OfficerStepProps) => (
    <div className="flex flex-col gap-4">
        <Card>
            <CardBody>
                {/* Heading and both options on one row. */}
                <div className="grid items-center gap-x-8 gap-y-2 sm:grid-cols-[auto_1fr]">
                    <p className="text-base font-semibold">
                        Proposal Type <span className="text-danger">*</span>
                    </p>
                    <RadioGroup
                        name="type"
                        aria-label="Proposal Type"
                        value={form.type}
                        onChange={(e) => setField("type", e.target.value as ProposalFormData["type"])}
                        error={errors.type}
                        options={[
                            { value: "Pay Fixation", label: "Pay Fixation" },
                            { value: "Pay Protection", label: "Pay Protection" },
                        ]}
                    />
                </div>
            </CardBody>
        </Card>
        <Card title="Officer Particulars" footer={footer}>
            {/* All officer fields on one row (wraps on smaller screens). */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Select
                    label="Officer Name / Employee Code"
                    required
                    placeholder="Search officer by name or code"
                    options={officerOptions}
                    value={form.officerCode}
                    onChange={(v) => onOfficerChange(String(v))}
                    readOnly={lockOfficer}
                    error={errors.officerCode}
                    helpText={lockOfficer ? "You can submit only for your own record." : undefined}
                />
                <Input label="Date of Joining (OES)" value={officer?.dateOfJoining ?? ""} readOnly placeholder="—" />
                <Select label="Designation" required options={designationOptions} value={form.designation} onChange={(v) => setField("designation", String(v))} error={errors.designation} />
                <Select label="Cadre" required options={cadreOptions} value={form.cadre} onChange={(v) => setField("cadre", String(v))} error={errors.cadre} />
                <Select
                    label="Institution / Place of Posting"
                    required
                    options={institutionOptions}
                    value={form.institution}
                    onChange={(v) => setField("institution", String(v))}
                    error={errors.institution}
                />
            </div>
        </Card>
    </div>
);

/* ---- Step 2: Event & pay particulars ------------------------------------ */

interface PayStepProps extends StepProps {
    eventOptions: Option[];
    levelOptions: Option[];
    /** Rule-engine message for the proposed pay: null when it matches the matrix. */
    ruleMessage: string | null;
    ruleEngine: boolean;
    onCalculate: () => void;
    /** Cell values for a level, for the hint under the Cell field. */
    payFor: (level: string, cell: string) => number;
}

const PayRow = ({ prefix, form, errors, setField, levelOptions, payFor, title }: StepProps & { prefix: "existing" | "proposed"; levelOptions: Option[]; payFor: PayStepProps["payFor"]; title: string }) => {
    const level = form[`${prefix}Level`];
    const cell = form[`${prefix}Cell`];
    const matrix = payFor(level, cell);
    return (
        <fieldset className="grid gap-4 sm:grid-cols-3">
            <legend className="mb-2 text-sm font-semibold">{title}</legend>
            <Select label="Pay Level" required options={levelOptions} value={level} onChange={(v) => setField(`${prefix}Level`, String(v))} error={errors[`${prefix}Level`]} />
            <Input
                label="Cell"
                required
                type="number"
                min={1}
                value={cell}
                onChange={(e) => setField(`${prefix}Cell`, e.target.value)}
                error={errors[`${prefix}Cell`]}
                helpText={matrix ? `Matrix value: ₹${matrix.toLocaleString("en-IN")}` : undefined}
            />
            <Input
                label="Basic Pay (₹)"
                required
                type="number"
                min={0}
                value={form[`${prefix}Basic`]}
                onChange={(e) => setField(`${prefix}Basic`, e.target.value)}
                error={errors[`${prefix}Basic`]}
            />
        </fieldset>
    );
};

export const PayStep = ({ form, errors, setField, eventOptions, levelOptions, ruleMessage, ruleEngine, onCalculate, payFor, footer }: PayStepProps) => {
    const proposedFilled = form.proposedLevel && form.proposedCell && form.proposedBasic;
    return (
        <div className="flex flex-col gap-4">
            <Card title="Event / Reason">
                <div className="grid gap-4 sm:grid-cols-3">
                    <Select label="Event / Reason" required options={eventOptions} value={form.event} onChange={(v) => setField("event", v as ProposalFormData["event"])} error={errors.event} />
                    <DatePicker label="Event Date" required value={form.eventDate} onChange={(e) => setField("eventDate", e.target.value)} error={errors.eventDate} maxDate={new Date()} />
                    <DatePicker label="Date of Next Increment" value={form.nextIncrement} onChange={(e) => setField("nextIncrement", e.target.value)} error={errors.nextIncrement} helpText="As applicable" />
                </div>
            </Card>
            <Card
                title="Pay Particulars"
               
                actions={<Button variant="outline" size="sm" icon={<Calculator size={16} />} label="Calculate as per rule" onClick={onCalculate} disabled={!form.type || !form.existingLevel || !form.proposedLevel} />}
            >
                <div className="flex flex-col gap-6">
                    <PayRow prefix="existing" title="Existing Pay" form={form} errors={errors} setField={setField} levelOptions={levelOptions} payFor={payFor} />
                    <PayRow prefix="proposed" title="Proposed Pay" form={form} errors={errors} setField={setField} levelOptions={levelOptions} payFor={payFor} />
                    {ruleEngine && proposedFilled && (
                        <Alert tone={ruleMessage ? "warning" : "success"} title={ruleMessage ? "Rule check" : "Rule check passed"}>
                            {ruleMessage ?? "Proposed pay matches the configured pay matrix."}
                        </Alert>
                    )}
                </div>
            </Card>
            <Card title="Justification / Remarks" footer={footer}>
                <TextArea
                    label="Detailed justification"
                    required
                    rows={1}
                    showCount
                    maxLength={1000}
                    placeholder="Order reference, rule under which pay is fixed / protected, calculation basis…"
                    value={form.justification}
                    onChange={(e) => setField("justification", e.target.value)}
                    error={errors.justification}
                />
            </Card>
        </div>
    );
};

/* ---- Step 3: Documents & declaration ------------------------------------ */

interface DocumentsStepProps extends StepProps {
    required: DocumentRequirement[];
}

export const DocumentsStep = ({ form, errors, setField, required, footer }: DocumentsStepProps) => (
    <div className="flex flex-col gap-4">
        <Card
            title="Supporting Documents"
           
        >
            {required.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground"><Info size={16} /> No checklist loaded yet.</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {required.map((d) => (
                        <UploadFile
                            key={d.id}
                            label={d.name}
                            required={d.mandatory}
                            accept=".pdf,.jpg,.jpeg,.png"
                            helpText="PDF / JPG / PNG, up to 5 MB"
                            value={form.documents[d.name] ?? null}
                            onChange={(file) => {
                                const next = { ...form.documents };
                                if (file) next[d.name] = file.name;
                                else delete next[d.name];
                                setField("documents", next);
                            }}
                            error={errors[`doc:${d.name}`]}
                        />
                    ))}
                </div>
            )}
        </Card>
        <Card title="Declaration" footer={footer}>
            <Checkbox
                label="I declare that the particulars furnished above are correct and complete to the best of my knowledge, and that I will refund any excess payment arising from an incorrect fixation."
                checked={form.declaration}
                onChange={(e) => setField("declaration", e.target.checked)}
                error={errors.declaration}
            />
        </Card>
    </div>
);
