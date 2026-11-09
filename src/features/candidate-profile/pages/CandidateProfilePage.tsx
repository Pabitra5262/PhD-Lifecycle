import { ArrowRight, MailCheck, Save, ShieldCheck, Smartphone } from "lucide-react";
import { CONTROL_FIELDS } from "../form-config/profileControls.fields";
import { configuredFieldProps } from "@/features/shared/formFields";
import { candidateProfileFields } from "../form-config/profile.fields";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Card, CardBody, CardHeader, DynamicFormTable, FormGenerator, Input, Modal, showToast, type FormField } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { useAppSelector } from "@/app/hooks";
import { getJwtToken } from "@/shared/utils/cookieUtils";
import { candidateSchema, type CandidateProfile } from "../model/candidateProfile";
import { canEditCandidate, getCandidate, requestContactCode, saveCandidate, verifyContactCode } from "../model/candidateStore";
import { demoCandidateProfile } from "../model/candidateProfileData";


const ProfileForm = ({ account, verifiedHimsId, demo }: { account: string; verifiedHimsId?: string; demo: boolean }) => {
    const [record, setRecord] = useState(() => {
        const existing = getCandidate(account, verifiedHimsId);
        if (demo && !existing.updatedAt && !existing.profile.fullName && !verifiedHimsId) return saveCandidate(account, demoCandidateProfile(existing.profile.candidateId), false);
        return existing;
    });
    const [verification, setVerification] = useState<{ type: "mobile" | "email"; value: string; demoCode: string } | null>(null);
    const [code, setCode] = useState("");
    const [verificationError, setVerificationError] = useState("");
    const form = useForm<CandidateProfile>({ resolver: zodResolver(candidateSchema), defaultValues: record.profile });
    const { control, register, setValue, getValues, formState: { errors } } = form;
    const education = useFieldArray({ control, name: "education" });
    const mobile = useWatch({ control, name: "mobile" });
    const email = useWatch({ control, name: "email" });
    const qualificationType = useWatch({ control, name: "qualificationType" });
    const category = useWatch({ control, name: "category" });
    const sameAddress = useWatch({ control, name: "sameAddress" });
    const currentAddress = useWatch({ control, name: "currentAddress" });
    const currentPin = useWatch({ control, name: "currentPin" });
    const locked = !canEditCandidate(record.applicationStatus);
    const qualified = qualificationType !== "Not Applicable";
    useEffect(() => {
        if (sameAddress) { setValue("permanentAddress", currentAddress); setValue("permanentPin", currentPin); }
    }, [sameAddress, currentAddress, currentPin, setValue]);
    useEffect(() => { if (qualificationType === "Not Applicable") setValue("qualificationCertificate", null); }, [qualificationType, setValue]);
    useEffect(() => { if (category === "General") setValue("categoryProof", null); }, [category, setValue]);
    const startVerification = (type: "mobile" | "email") => {
        const value = getValues(type).trim();
        try { const demoCode = requestContactCode(account, type, value); setVerification({ type, value, demoCode }); setCode(""); setVerificationError(""); }
        catch (error) { showToast.error("Cannot verify contact", error instanceof Error ? error.message : "Verification failed"); }
    };
    const confirmVerification = () => {
        if (!verification) return;
        try {
            setRecord(verifyContactCode(account, verification.type, getValues(verification.type).trim(), code));
            form.clearErrors(verification.type);
            setVerification(null);
            showToast.success("Contact verified");
        } catch (error) { setVerificationError(error instanceof Error ? error.message : "Verification failed"); }
    };
    const save = (values: CandidateProfile, final: boolean) => {
        if (final && (record.verifiedMobile !== values.mobile || record.verifiedEmail !== values.email)) {
            if (record.verifiedMobile !== values.mobile) form.setError("mobile", { message: "Verify the current mobile number before submission" });
            if (record.verifiedEmail !== values.email) form.setError("email", { message: "Verify the current email address before submission" });
            return;
        }
        try { setRecord(saveCandidate(account, values, final)); showToast.success(final ? "Profile submitted" : "Draft saved", "Retained for this browser session."); }
        catch (error) { showToast.error("Cannot save profile", error instanceof Error ? error.message : "Save failed"); }
    };
    const renderFields = (fields: FormField[]) => <FormGenerator standalone fields={fields.map((item) => ({ ...item, disabled: locked || item.disabled }))} gridColumns={12} onSubmit={() => undefined} />;
    const fields = candidateProfileFields({ sameAddress, qualified, category });
    const cell = "border border-table-border p-2";
    return <>
        <PageHeader title="My Profile" />
        {locked && <Alert tone="info" className="mb-4" title="Profile is read-only">Profile updates are controlled while your application is {record.applicationStatus.toLowerCase()}.</Alert>}
        <FormProvider {...form}>
            <form noValidate onSubmit={form.handleSubmit((values) => save(values, true))}>
                <fieldset disabled={locked}>
                    <Card>
                        <CardHeader title="My Profile" divider />
                        <CardBody>
                            {renderFields(fields.personal)}
                            <div className="mt-4 grid grid-cols-12 gap-4">
                                <div className="col-span-12 sm:col-span-6 lg:col-span-4">
                                    <Controller control={control} name="mobile" render={({ field: input }) => <Input {...configuredFieldProps(CONTROL_FIELDS.mobileNumber)} {...input} onChange={(event) => input.onChange(event.target.value.replace(/\D/g, "").slice(0, 10))} type="tel" maxLength={10} error={errors.mobile?.message} />} />
                                    <Button icon={<Smartphone size={16} />} type="button" size="sm" variant="outline" className="mt-2" disabled={record.verifiedMobile === mobile && !!mobile} label={record.verifiedMobile === mobile && mobile ? "Mobile Verified" : "Verify Mobile"} onClick={() => startVerification("mobile")} />
                                </div>
                                <div className="col-span-12 sm:col-span-6 lg:col-span-4">
                                    <Controller control={control} name="email" render={({ field: input }) => <Input {...configuredFieldProps(CONTROL_FIELDS.emailAddress)} {...input} type="email" error={errors.email?.message} />} />
                                    <Button icon={<MailCheck size={16} />} type="button" size="sm" variant="outline" className="mt-2" disabled={record.verifiedEmail === email && !!email} label={record.verifiedEmail === email && email ? "Email Verified" : "Verify Email"} onClick={() => startVerification("email")} />
                                </div>
                            </div>
                        </CardBody>
                        <CardHeader title="Address Details" divider /><CardBody>{renderFields(fields.address)}</CardBody>
                        <CardHeader title="Educational Qualifications" divider />
                        <CardBody>
                            <DynamicFormTable rows={education.fields} disableAddRemove={locked} headers={["Qualification", "Institution / University", "Passing Year", "Marks (%)"]} onAdd={() => education.append({ qualification: "", institution: "", year: "", marks: "" })} onRemove={(index) => education.remove(index)} renderRow={(index) => <>
                                <td className={cell}><Input aria-label={`Qualification ${index + 1}`} required {...register(`education.${index}.qualification`)} error={errors.education?.[index]?.qualification?.message} /></td>
                                <td className={cell}><Input aria-label={`Institution ${index + 1}`} required {...register(`education.${index}.institution`)} error={errors.education?.[index]?.institution?.message} /></td>
                                <td className={cell}><Input aria-label={`Passing year ${index + 1}`} type="number" min={1900} max={new Date().getFullYear()} step={1} required {...register(`education.${index}.year`)} error={errors.education?.[index]?.year?.message} /></td>
                                <td className={cell}><Input aria-label={`Marks percentage ${index + 1}`} type="number" min={0} max={100} step="any" required {...register(`education.${index}.marks`)} error={errors.education?.[index]?.marks?.message} /></td>
                            </>} />
                            {errors.education?.message && <p className="ui-error" role="alert">{errors.education.message}</p>}
                        </CardBody>
                        <CardHeader title="NET / URET Details" divider />
                        <CardBody>{renderFields(fields.qualification)}</CardBody>
                        <CardHeader title="Category / Reservation Details" divider />
                        <CardBody>{renderFields(fields.category)}</CardBody>
                        <CardHeader title="Documents & Declaration" divider />
                        <CardBody>
                            {renderFields(fields.documents)}
                            <div className="mt-5 flex flex-wrap justify-start gap-2 border-t border-border pt-5">
                                <Button icon={<Save size={16} />} action="save" variant="outline" type="button" label="Save Draft" onClick={() => save(getValues(), false)} />
                                <Button rightIcon={ArrowRight} action="submit" type="submit" label="Submit Profile" />
                            </div>
                        </CardBody>
                    </Card>
                </fieldset>
            </form>
        </FormProvider>
        <Modal isOpen={verification !== null} title={`Verify ${verification?.type === "mobile" ? "Mobile Number" : "Email Address"}`} onClose={() => setVerification(null)} size="sm" footer={<div className="flex w-full justify-start"><Button icon={<ShieldCheck size={16} />} label="Verify Code" onClick={confirmVerification} /></div>}>
            <p className="mb-3 text-sm">Verification for {verification?.value}. No SMS or email is sent.</p>
            <p className="mb-3 text-sm">Verification code: <strong>{verification?.demoCode}</strong> (valid for 5 minutes).</p>
            <Input {...configuredFieldProps(CONTROL_FIELDS.verificationCode)} value={code} type="tel" maxLength={6} onChange={(event) => setCode(event.target.value)} error={verificationError} />
        </Modal>
    </>;
};

const CandidateProfilePage = () => {
    const auth = useAppSelector((state) => state.auth);
    const user: unknown = auth.user;
    const identity = user && typeof user === "object" ? user as Record<string, unknown> : {};
    const account = typeof identity.loginUserName === "string" && identity.loginUserName ? identity.loginUserName : auth.token || getJwtToken() || "demo-candidate";
    const verifiedHimsId = identity.himsIdVerified === true && typeof identity.himsId === "string" ? identity.himsId : undefined;
    return <ProfileForm key={account} account={account} verifiedHimsId={verifiedHimsId} demo={!identity.loginUserName && (auth.token === "dummy-token" || account === "demo-candidate")} />;
};
export default CandidateProfilePage;

