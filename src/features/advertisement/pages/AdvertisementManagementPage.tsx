import { Plus, Save } from "lucide-react";
import { CONTROL_FIELDS } from "../form-config/advertisementFilters.fields";
import { configuredFieldProps } from "@/features/shared/formFields";
import { advertisementFields } from "../form-config/advertisement.fields";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, CardBody, CardHeader, DialogModal, FormGenerator, Input, showToast } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { useRole } from "@/features/shared/store/PayFixStore";
import { AdvertisementList } from "../components/AdvertisementList";
import { readAdvertisementRecords, saveAdvertisementRecord, transitionAdvertisement, type AdvertisementRecord, type AdvertisementStatus } from "../model/advertisementRecords";
import { admissionConfig, advertisementSchema, type AdvertisementForm } from "../form-config/advertisementConfig";



import { readAdvertisementDraft, saveAdvertisementDraft } from "../form-config/advertisementDraft";

const AdvertisementManagementPage = () => {
    const { workflowRole: role } = useRole();
    const [records, setRecords] = useState(readAdvertisementRecords);
    const [viewing, setViewing] = useState<AdvertisementRecord | null>(null);
    const [pending, setPending] = useState<{ row: AdvertisementRecord; status: AdvertisementStatus } | null>(null);
    const [sessionDraft] = useState(readAdvertisementDraft);
    const [advertisementNumber] = useState(() => sessionDraft?.advertisementNumber ?? `PHD/ADV/${new Date().getFullYear()}/${crypto.randomUUID().toUpperCase()}`);
    const form = useForm<AdvertisementForm>({
        resolver: zodResolver(advertisementSchema),
        defaultValues: sessionDraft ?? {
            advertisementNumber, advertisementDate: "", academicSession: "", university: "", department: "",
            researchArea: "", seatsApplicable: true, seats: "", eligibilityCriteria: "", qualificationRule: "",
            permittedExemptions: [], applicationStart: "", applicationEnd: "", selectionProcess: "",
            supportingDocument: null, status: "Draft",
        },
    });
    const { control, setValue, getValues } = form;
    const academicSession = useWatch({ control, name: "academicSession" });
    const university = useWatch({ control, name: "university" });
    const seatsApplicable = useWatch({ control, name: "seatsApplicable" });
    const qualificationRule = useWatch({ control, name: "qualificationRule" });
    useEffect(() => {
        const departments = admissionConfig.universities.find((item) => item.id === university)?.departments ?? [];
        if (!departments.includes(getValues("department"))) setValue("department", "");
    }, [university, setValue, getValues]);
    useEffect(() => {
        const allowed = admissionConfig.qualificationRules.find((item) => item.id === qualificationRule)?.exemptions ?? [];
        const current = getValues("permittedExemptions");
        if (current.some((value) => !allowed.includes(value))) setValue("permittedExemptions", current.filter((value) => allowed.includes(value)));
    }, [qualificationRule, setValue, getValues]);

    const fields = advertisementFields({ university, academicSession, seatsApplicable, qualificationRule });
    const save = form.handleSubmit((values) => {
        try {
            saveAdvertisementRecord(values, role);
            saveAdvertisementDraft(values);
            setRecords(readAdvertisementRecords());
            showToast.success("Draft saved");
        } catch (error) { showToast.error("Cannot save advertisement", error instanceof Error ? error.message : "Save failed"); }
    });
    const load = (row: AdvertisementRecord, readOnly: boolean) => {
        form.reset(row.form);
        setViewing(readOnly ? row : null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    return (
        <>
            <PageHeader title="Advertisement Mgmt" />
            <Card>
                <CardHeader title="Advertisement Mgmt" divider />
                <CardBody>
                <FormProvider {...form}>
                    <form onSubmit={save}>
                        <fieldset disabled={viewing !== null}>
                        <FormGenerator standalone fields={fields} gridColumns={12} onSubmit={() => undefined} />
                        <div className="mt-4 grid grid-cols-12 gap-4"><Input {...configuredFieldProps(CONTROL_FIELDS.statusDisplay)} value={viewing?.status ?? "Draft"} /></div>
                        {!viewing && <div className="mt-5 flex flex-wrap justify-start gap-2 border-t border-border pt-5"><Button icon={<Save size={16} />} action="save" type="submit" label="Save Draft" /></div>}
                        </fieldset>
                        {viewing && <div className="mt-5 flex flex-wrap justify-start gap-2 border-t border-border pt-5"><Button icon={<Plus size={16} />} type="button" label="New Advertisement" onClick={() => {
                            form.reset({ advertisementNumber: `PHD/ADV/${new Date().getFullYear()}/${crypto.randomUUID().toUpperCase()}`, advertisementDate: "", academicSession: "", university: "", department: "", researchArea: "", seatsApplicable: true, seats: "", eligibilityCriteria: "", qualificationRule: "", permittedExemptions: [], applicationStart: "", applicationEnd: "", selectionProcess: "", supportingDocument: null, status: "Draft" }); setViewing(null);
                        }} /></div>}
                    </form>
                </FormProvider>
                </CardBody>
            </Card>
            <AdvertisementList records={records} onView={(row) => load(row, true)} onEdit={(row) => load(row, false)} onTransition={(row, status) => setPending({ row, status })} />
            <DialogModal isOpen={pending !== null} title={pending ? `${pending.status === "Submitted" ? "Submit for Approval" : pending.status} Advertisement` : "Advertisement"} message={`Confirm this action for ${pending?.row.form.advertisementNumber ?? ""}?`} onClose={() => setPending(null)} onConfirm={() => {
                if (!pending) return;
                try { const updated = transitionAdvertisement(pending.row.id, pending.status, role); setRecords(readAdvertisementRecords()); if (viewing?.id === updated.id) setViewing(updated); setPending(null); showToast.success("Advertisement updated"); }
                catch (error) { showToast.error("Cannot update advertisement", error instanceof Error ? error.message : "Update failed"); setPending(null); }
            }} />
        </>
    );
};
export default AdvertisementManagementPage;
