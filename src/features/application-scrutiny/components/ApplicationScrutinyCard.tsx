import { ArrowLeft, ArrowRight, Eye, History, Undo2 } from "lucide-react";
import { Button, Card, CardBody, CardHeader, Input, TextArea } from "@mfe/components";
import { SearchableSelect as Select } from "@/shared/components/ui/Forms";
import { CONTROL_FIELDS, documentVerificationField } from "../form-config/scrutiny.fields";
import { configuredFieldProps } from "@/features/shared/formFields";
import { DECISIONS, VERIFICATION_STATUSES } from "../form-config/scrutinyConfig";
import { ScrutinyCandidateDetails } from "./ScrutinyCandidateDetails";
import type { ScrutinyViewProps } from "../types/scrutinyView.types";

const options = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

export function ApplicationScrutinyCard({ controller }: ScrutinyViewProps) {
    const { advertisementId, matches, selected, editable, form, documents, errors, advertisements, selectAdvertisement, updateReview, prepare, index, remarksRequired, selectApplication, setDocument, setHistoryOpen } = controller;
    return <>
        <Card>
            <CardHeader title="Application Scrutiny" divider />
            <CardBody>
                <form noValidate onSubmit={(event) => { event.preventDefault(); prepare("Forward"); }} className="grid grid-cols-12 gap-4">
                    <Select {...configuredFieldProps(CONTROL_FIELDS.advertisementNumber)} value={advertisementId} options={advertisements.map((item) => ({ value: item.id, label: item.number }))} error={errors.advertisement} onChange={(value) => selectAdvertisement(String(value))} />
                    <div className="col-span-12 lg:col-span-4">
                        <Input {...configuredFieldProps(CONTROL_FIELDS.applicationNumberDisplay)} value={selected?.reference ?? ""} error={errors.application} />
                        {advertisementId && matches.length === 0 && <p className="mt-2 text-sm" role="status">No submitted applications for this advertisement.</p>}
                        {matches.length > 1 && <div className="mt-2 flex items-center gap-2" aria-label="Application navigation">
                            <Button icon={<ArrowLeft size={16} />} type="button" variant="outline" size="sm" label="Previous Application" disabled={index <= 0} onClick={() => { selectApplication(matches[index - 1].id); }} />
                            <span className="text-sm">{index + 1} of {matches.length}</span>
                            <Button icon={<ArrowRight size={16} />} type="button" variant="outline" size="sm" label="Next Application" disabled={index >= matches.length - 1} onClick={() => { selectApplication(matches[index + 1].id); }} />
                        </div>}
                    </div>
                    <ScrutinyCandidateDetails key={selected?.id ?? "unselected"} application={selected} />
                    <div className="col-span-12 lg:col-span-4">
                        <Select {...configuredFieldProps(CONTROL_FIELDS.netVerification)} disabled={!editable} value={form.netVerification} options={options(VERIFICATION_STATUSES)} error={errors.netVerification} helpText={selected ? [selected.profile?.qualificationType, selected.profile?.examName, selected.profile?.examYear, "Score: " + (selected.profile?.examScore ?? ""), "Rank: " + (selected.profile?.examRank ?? "")].filter(Boolean).join(" | ") : undefined} onChange={(value) => updateReview({ netVerification: String(value) })} />
                        {selected?.profile?.qualificationCertificate && <Button icon={<Eye size={16} />} type="button" size="sm" variant="outline" className="mt-2" label="View Qualification Evidence" onClick={() => setDocument(selected.profile?.qualificationCertificate ?? null)} />}
                    </div>
                    <fieldset className="col-span-12">
                        <legend className="ui-label">Document Verification<span className="ui-required">*</span></legend>
                        {documents.length === 0 ? <Select aria-label="Document Verification" disabled value="" wrapperClassName="w-full sm:w-56" options={options(VERIFICATION_STATUSES)} onChange={() => undefined} /> : <div className="grid grid-cols-12 gap-4">
                            {documents.map((item) => <div key={item.id} className="col-span-12 sm:col-span-6 lg:col-span-4">
                                <Select {...configuredFieldProps(documentVerificationField(item))} aria-label={item.label + " verification"} required disabled={!editable} value={form.documents[item.id] ?? ""} options={options(VERIFICATION_STATUSES)} error={errors["document." + item.id]} onChange={(value) => updateReview({ documents: { ...form.documents, [item.id]: String(value) } })} />
                                <p className="my-1 break-words text-xs">{item.file?.name ?? "Not uploaded"}</p>
                                {item.file && <Button icon={<Eye size={16} />} type="button" size="sm" variant="outline" label="View Document" onClick={() => setDocument(item.file ?? null)} />}
                            </div>)}
                        </div>}
                    </fieldset>
                    <TextArea {...configuredFieldProps(CONTROL_FIELDS.scrutinyRemarks)} rows={1} maxLength={3000} required={remarksRequired} disabled={!editable} value={form.remarks} error={errors.remarks} onChange={(event) => updateReview({ remarks: event.target.value })} />
                    <Select {...configuredFieldProps(CONTROL_FIELDS.decision)} disabled={!editable} value={form.decision} options={options(DECISIONS)} error={errors.decision} onChange={(value) => updateReview({ decision: String(value) })} />
                    {[errors.permission, errors.status, errors.revision].filter(Boolean).map((error) => <p key={error} className="ui-error" role="alert">{error}</p>)}
                    <div className="col-span-12 mt-5 flex flex-wrap justify-start gap-2 border-t border-border pt-5">
                        {selected && <Button icon={<History size={16} />} type="button" label="View History" variant="outline" onClick={() => setHistoryOpen(true)} />}
                        <Button icon={<ArrowRight size={16} />} type="submit" label="Forward" disabled={!editable} />
                        <Button icon={<Undo2 size={16} />} type="button" label="Return" variant="warning" disabled={!editable} onClick={() => prepare("Return")} />
                    </div>
                </form>
            </CardBody>
        </Card>
    </>;
}
