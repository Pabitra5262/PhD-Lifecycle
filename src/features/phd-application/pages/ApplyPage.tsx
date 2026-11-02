import { ArrowRight, CreditCard, Pencil, Save } from "lucide-react";
import { CONTROL_FIELDS, applicationDocumentField } from "../form-config/apply.fields";
import { configuredFieldProps } from "@/features/shared/formFields";
import { useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Checkbox, DataTable, DialogModal, DynamicFormTable, Input, Modal, TextArea, UploadFile, showToast, useAppNavigate, type TableColumnDef } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { useAppSelector } from "@/app/hooks";
import { getJwtToken } from "@/shared/utils/cookieUtils";
import { admissionConfig } from "@/features/shared/admissionMasters";
import { candidateForApplication, getCandidate } from "@/features/candidate-profile/model/candidateStore";
import { activeAdvertisements, findAdvertisement } from "../service/advertisementService";
import { correctionAdvertisementsFor, feeFor, readMyApplications, readApplicationNotifications, recordDemoPayment, saveApplication, getApplicationValidationContext } from "../service/applicationService";

import { SearchableSelect as Select } from "@/shared/components/ui/Forms";
import { ApplicationFilters } from "../components/ApplicationFilters";
import { emptyApplicationFilters } from "../model/applicationFilters";
import { demoApplications } from "../model/applicationDemoData";

import type { ApplicationForm, PhdApplication } from "../types/application.types";
import { emptyApplication } from "../model/applicationForm";
import { validateApplicationForm } from "../validation/applicationValidation";

const applicationColumns: TableColumnDef<PhdApplication>[] = [
    { id: "university", header: "University", accessorFn: (row) => admissionConfig.universities.find((item) => item.id === row.advertisement.university)?.label ?? row.advertisement.university },
    { id: "department", header: "Department", accessorFn: (row) => row.advertisement.department },
    { accessorKey: "reference", header: "Application Reference" },
    { id: "advertisement", header: "Advertisement", accessorFn: (row) => `${row.advertisement.number} - ${row.advertisement.title}` },
    { id: "research", header: "Research Area", accessorFn: (row) => row.form.researchArea },
    { accessorKey: "status", header: "Status", Cell: ({ row }) => <Badge variant={row.original.status === "Submitted" ? "success" : "secondary"}>{row.original.status}</Badge> },
    { accessorKey: "paymentStatus", header: "Payment Status" },
    { accessorKey: "scrutinyOutcome", header: "Scrutiny Outcome" },
    { accessorKey: "scrutinyRemarks", header: "Scrutiny Remarks" },
    { accessorKey: "correctionUntil", header: "Correction Deadline", Cell: ({ row }) => row.original.correctionUntil ? new Date(row.original.correctionUntil).toLocaleString("en-IN") : "" },
    { accessorKey: "submittedAt", header: "Submitted On", Cell: ({ row }) => row.original.submittedAt ? new Date(row.original.submittedAt).toLocaleString("en-IN") : "Not submitted" },
];
const displayDate = (date: string) => date.split("-").reverse().join("/");
const ApplyForm = ({ account, verifiedHimsId, demo }: { account: string; verifiedHimsId?: string; demo: boolean }) => {
    const navigate = useAppNavigate();
    const [candidate] = useState(() => getCandidate(account, verifiedHimsId));
    const profile = candidateForApplication(account);
    const [form, setForm] = useState<ApplicationForm>(() => emptyApplication());
    const [applications, setApplications] = useState(() => readMyApplications(account));
    const [samples] = useState(() => demo ? demoApplications(candidate.profile.candidateId) : []);
    const [filtersHidden, setFiltersHidden] = useState(false);
    const [filters, setFilters] = useState(emptyApplicationFilters);
    const [applied, setApplied] = useState(emptyApplicationFilters);
    const allRows = [...applications, ...samples];
    const shown = allRows.filter((row) => (!applied.advertisement || row.advertisement.id === applied.advertisement) && (!applied.status || row.status === applied.status) && (!applied.university || row.advertisement.university === applied.university) && (!applied.department || row.advertisement.department === applied.department));
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [preview, setPreview] = useState<PhdApplication | null>(null);
    const [, refreshPayment] = useState(0);
    const openAdvertisements = activeAdvertisements();
    const correctionAdvertisements = correctionAdvertisementsFor(account);
    const advertisements = [...new Map([...openAdvertisements, ...correctionAdvertisements].map((row) => [row.id, row])).values()];
    const notifications = readApplicationNotifications(account);
    const advertisement = findAdvertisement(form.advertisement);
    const current = applications.find((row) => row.form.advertisement === form.advertisement);
    const submitted = current !== undefined && !["Draft", "Returned"].includes(current.status);
    const errors = validateApplicationForm(form, getApplicationValidationContext(account, form.advertisement));
    const fee = advertisement ? feeFor(account, advertisement) : null;
    const setField = <K extends keyof ApplicationForm>(key: K, value: ApplicationForm[K]) => setForm((previous) => ({ ...previous, [key]: value }));
    const selectAdvertisement = (id: string) => {
        const existing = applications.find((row) => row.form.advertisement === id);
        setForm(existing ? { ...existing.form, documents: { ...existing.form.documents }, declaration: existing.status === "Returned" ? false : existing.form.declaration, eligibilityConfirmed: existing.status === "Returned" ? false : existing.form.eligibilityConfirmed } : emptyApplication(id));
    };
    const save = (final: boolean) => {
        try {
            const result = saveApplication(account, form, final);
            if (!result.ok) { showToast.error("Application is incomplete", Object.values(result.errors).join(" ")); return; }
            setApplications(readMyApplications(account));
            showToast.success(final ? "Application submitted" : "Application draft saved", final ? `Reference: ${result.application.reference}` : "Retained for this browser session.");
        } catch (error) { showToast.error("Cannot save application", error instanceof Error ? error.message : "Save failed"); }
    };
    const cell = "border border-table-border p-2";
    return <>
        <PageHeader title="Apply" />
        <form noValidate onSubmit={(event) => { event.preventDefault(); save(true); }}>
            <Card>
                <CardHeader title="Apply for PhD Admission" divider />
                <CardBody className="grid grid-cols-12 gap-4">
                    <Select {...configuredFieldProps(CONTROL_FIELDS.advertisement)} value={form.advertisement} options={advertisements.map((item) => ({ value: item.id, label: `${item.number} - ${item.title}` }))} onChange={(value) => selectAdvertisement(String(value))} error={form.advertisement ? errors.advertisement : undefined} />
                    {!advertisements.length && <p role="status" className="mt-3 text-sm">No published advertisements are currently open for applications.</p>}
                </CardBody>
                <fieldset disabled={!advertisement || submitted}>
                    <CardBody>
                        <div className="grid grid-cols-12 gap-4">
                            <Input {...configuredFieldProps(CONTROL_FIELDS.universityDisplay)} value={admissionConfig.universities.find((item) => item.id === advertisement?.university)?.label ?? ""} />
                            <Input {...configuredFieldProps(CONTROL_FIELDS.departmentDisplay)} value={advertisement?.department ?? ""} />
                            <Select {...configuredFieldProps(CONTROL_FIELDS.researchArea)} disabled={!advertisement || submitted} value={form.researchArea} options={advertisement?.researchAreas.map((value) => ({ value, label: value })) ?? []} error={advertisement ? errors.researchArea : undefined} onChange={(value) => setField("researchArea", String(value))} />
                            <Input {...configuredFieldProps(CONTROL_FIELDS.academicSessionDisplay)} value={advertisement?.academicSession ?? ""} />
                            <Input {...configuredFieldProps(CONTROL_FIELDS.applicationPeriodDisplay)} value={advertisement ? `${displayDate(advertisement.starts)} - ${displayDate(advertisement.ends)}` : ""} />
                            <Input {...configuredFieldProps(CONTROL_FIELDS.applicationStatusDisplay)} value={current?.status ?? "Draft"} />
                        </div>
                        {advertisement && <p className="mt-3 text-sm">Eligibility: {advertisement.eligibility}</p>}
                    </CardBody>
                    <CardHeader title="Academic Details" divider />
                    <CardBody>
                        <div className="mb-4 grid grid-cols-12 gap-4">
                            <Input {...configuredFieldProps(CONTROL_FIELDS.candidateIdDisplay)} value={candidate.profile.candidateId} />
                            <Input {...configuredFieldProps(CONTROL_FIELDS.candidateNameDisplay)} value={profile?.fullName ?? candidate.profile.fullName} />
                            <Input {...configuredFieldProps(CONTROL_FIELDS.qualificationTypeDisplay)} value={profile?.qualificationType ?? ""} />
                        </div>
                        <DynamicFormTable rows={profile?.education ?? []} showAction={false} headers={["Qualification", "Institution / University", "Passing Year", "Marks (%)"]} renderRow={(index) => {
                            const row = profile!.education[index];
                            return <><td className={cell}>{row.qualification}</td><td className={cell}>{row.institution}</td><td className={cell}>{row.year}</td><td className={cell}>{row.marks}</td></>;
                        }} />
                        <div className="mt-3"><Button icon={<Pencil size={16} />} type="button" variant="outline" label="Complete / Update My Profile" onClick={() => navigate("/public-portal/my-profile")} /></div>
                        {advertisement && errors.profile && <p role="alert" className="ui-error">{errors.profile}</p>}
                        {errors.academics && <p role="alert" className="ui-error">{errors.academics}</p>}
                        {errors.qualification && <p role="alert" className="ui-error">{errors.qualification}</p>}
                        <Checkbox {...configuredFieldProps(CONTROL_FIELDS.eligibilityConfirmed)} checked={form.eligibilityConfirmed} error={advertisement ? errors.eligibilityConfirmed : undefined} onChange={(event) => setField("eligibilityConfirmed", event.target.checked)} />
                    </CardBody>
                    {advertisement && advertisement.synopsis !== "None" && <>
                        <CardHeader title="Synopsis / Research Interest" divider />
                        <CardBody><div className="grid grid-cols-12 gap-4">
                            {advertisement.synopsis !== "File" && <TextArea {...configuredFieldProps(CONTROL_FIELDS.researchInterest)} rows={1} maxLength={5000} required={advertisement.synopsis === "Text"} value={form.synopsis} onChange={(event) => setField("synopsis", event.target.value)} error={errors.synopsis} />}
                            {advertisement.synopsis !== "Text" && <UploadFile {...configuredFieldProps(CONTROL_FIELDS.synopsisDocument)} required={advertisement.synopsis === "File"} value={form.synopsisFile} accept=".pdf,.jpg,.jpeg,.png" helpText="PDF, JPG or PNG; up to 5 MB." onChange={(file) => setField("synopsisFile", file)} error={errors.synopsisFile ?? (advertisement.synopsis === "Text or File" ? errors.synopsis : undefined)} />}
                        </div></CardBody>
                    </>}
                    <CardHeader title="Supporting Documents" divider />
                    <CardBody><div className="grid grid-cols-12 gap-4">
                        {advertisement?.documents.map((document) => <UploadFile {...configuredFieldProps(applicationDocumentField(document))} key={document.id} value={form.documents[document.id]} accept=".pdf,.jpg,.jpeg,.png" helpText="PDF, JPG or PNG; up to 5 MB." error={errors[`document.${document.id}`]} onChange={(file) => setField("documents", { ...form.documents, [document.id]: file })} />)}
                    </div></CardBody>
                    <CardHeader title="Application Fee & Declaration" divider />
                    <CardBody>
                        <div className="grid grid-cols-12 gap-4">
                            <Input {...configuredFieldProps(CONTROL_FIELDS.applicationFeeDisplay)} value={advertisement ? advertisement.fee.toLocaleString("en-IN") : ""} />
                            <Input {...configuredFieldProps(CONTROL_FIELDS.paymentStatusDisplay)} value={fee?.status ?? ""} />
                            <Input {...configuredFieldProps(CONTROL_FIELDS.paymentReferenceDisplay)} value={fee?.reference ?? ""} />
                        </div>
                        {fee?.status === "Pending" && <Button icon={<CreditCard size={16} />} type="button" variant="outline" className="mt-3" label="Pay Application Fee" disabled={!profile} onClick={() => setPaymentOpen(true)} />}
                        {errors.payment && <p role="alert" className="ui-error">{errors.payment}</p>}
                        {errors.workflow && <p role="alert" className="ui-error">{errors.workflow}</p>}
                        <Checkbox {...configuredFieldProps(CONTROL_FIELDS.declaration)} checked={form.declaration} error={advertisement ? errors.declaration : undefined} onChange={(event) => setField("declaration", event.target.checked)} />
                        {submitted && <p role="status" className="mb-4 text-sm">Application submitted. Reference: {current.reference}</p>}
                        <div className="mt-5 flex flex-wrap justify-start gap-2 border-t border-border pt-5">
                            <Button icon={<Save size={16} />} action="save" type="button" variant="outline" label="Save Draft" disabled={!profile} onClick={() => save(false)} />
                            <Button icon={<ArrowRight size={16} />} action="submit" type="submit" label={current?.status === "Returned" ? "Resubmit Application" : "Submit Application"} disabled={submitted || Object.keys(errors).length > 0} />
                        </div>
                    </CardBody>
                </fieldset>
            </Card>
        </form>
        <ApplicationFilters hidden={filtersHidden} onHiddenChange={setFiltersHidden} value={filters} applied={applied} rows={allRows} onChange={setFilters} onApply={() => setApplied({ ...filters })} onReset={() => { setFilters(emptyApplicationFilters); setApplied(emptyApplicationFilters); }} />
        <Card title="My PhD Applications" containerClassName="mt-4 ui-card--with-header">
            <DataTable filterToggle={{ hidden: filtersHidden, onToggle: () => setFiltersHidden(!filtersHidden), appliedCount: Object.values(applied).filter(Boolean).length }} columns={applicationColumns} data={shown} getRowId={(row) => row.id} caption="My PhD applications" renderPreview={null} emptyTitle="No applications yet" emptyDescription="Your saved and submitted applications will appear here." actions={{ onView: setPreview, more: (row) => !row.id.startsWith("APPLICATION-PREVIEW-") && ["Draft", "Returned"].includes(row.status) ? [{ id: "edit", label: row.status === "Returned" ? "Correct & Resubmit" : "Continue Application", icon: ArrowRight, onSelect: () => { if (!advertisements.some((item) => item.id === row.form.advertisement)) { showToast.error("Advertisement is closed"); return; } selectAdvertisement(row.form.advertisement); window.scrollTo({ top: 0, behavior: "smooth" }); } }] : [] }} />
            {notifications.length > 0 && <div className="mt-4 space-y-2" aria-label="Application notifications">{notifications.map((notice) => <p key={notice.id} role="status" className="text-sm">{notice.message}</p>)}</div>}
        </Card>
        <DialogModal isOpen={paymentOpen} title="Application Fee Payment" message={`Record a simulated successful payment of INR ${fee?.amount.toLocaleString("en-IN") ?? "0"}? No money will be charged. This is a wireframe payment demonstration.`} confirmText="Simulate Successful Payment" onClose={() => setPaymentOpen(false)} onConfirm={() => {
            try { recordDemoPayment(account, form.advertisement); refreshPayment((value) => value + 1); setPaymentOpen(false); showToast.success("Payment simulation recorded", "No money was charged."); }
            catch (error) { showToast.error("Payment failed", error instanceof Error ? error.message : "Try again"); }
        }} />
        <Modal isOpen={preview !== null} onClose={() => setPreview(null)} title="Application Details" size="lg">
            {preview && <div className="grid grid-cols-12 gap-4">
                <Input {...configuredFieldProps(CONTROL_FIELDS.applicationReferenceDisplay)} value={preview.reference} /><Input {...configuredFieldProps(CONTROL_FIELDS.statusDisplay)} value={preview.status} />
                <Input {...configuredFieldProps(CONTROL_FIELDS.advertisementDisplay)} value={preview.advertisement.number} /><Input {...configuredFieldProps(CONTROL_FIELDS.researchAreaDisplay)} value={preview.form.researchArea} />
                <Input {...configuredFieldProps(CONTROL_FIELDS.scrutinyOutcomeDisplay)} value={preview.scrutinyOutcome ?? ""} /><TextArea {...configuredFieldProps(CONTROL_FIELDS.scrutinyRemarksDisplay)} value={preview.scrutinyRemarks ?? ""} rows={1} /><Input {...configuredFieldProps(CONTROL_FIELDS.correctionDeadlineDisplay)} value={preview.correctionUntil ? new Date(preview.correctionUntil).toLocaleString("en-IN") : ""} /><Input {...configuredFieldProps(CONTROL_FIELDS.candidateNameDisplay)} value={preview.profile?.fullName ?? ""} /><Input {...configuredFieldProps(CONTROL_FIELDS.paymentStatusDisplay)} value={preview.paymentStatus} />
                <TextArea {...configuredFieldProps(CONTROL_FIELDS.researchInterestDisplay)} value={preview.form.synopsis} rows={1} /><Input {...configuredFieldProps(CONTROL_FIELDS.synopsisDocumentDisplay)} value={preview.form.synopsisFile?.name ?? ""} />
                {preview.advertisement.documents.map((document) => <Input {...configuredFieldProps(applicationDocumentField(document, true))} key={document.id} value={preview.form.documents[document.id]?.name ?? ""} />)}
            </div>}
        </Modal>
    </>;
};
const ApplyPage = () => {
    const auth = useAppSelector((state) => state.auth);
    const user: unknown = auth.user;
    const identity = user && typeof user === "object" ? user as Record<string, unknown> : {};
    const account = typeof identity.loginUserName === "string" && identity.loginUserName ? identity.loginUserName : auth.token || getJwtToken() || "demo-candidate";
    const verifiedHimsId = identity.himsIdVerified === true && typeof identity.himsId === "string" ? identity.himsId : undefined;
    return <ApplyForm key={account} account={account} verifiedHimsId={verifiedHimsId} demo={!identity.loginUserName && (auth.token === "dummy-token" || account === "demo-candidate")} />;
};
export default ApplyPage;

