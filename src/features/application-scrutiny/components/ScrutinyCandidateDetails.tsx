import { FormProvider, useForm } from "react-hook-form";
import { Card, CardBody, CardHeader, DynamicFormTable, FormGenerator, type FormField } from "@mfe/components";
import { candidateProfileFields } from "@/features/candidate-profile/form-config/profile.fields";
import { CONTROL_FIELDS as PROFILE_FIELDS } from "@/features/candidate-profile/form-config/profileControls.fields";
import { emptyProfile } from "@/features/candidate-profile/model/candidateProfile";
import { admissionConfig } from "@/features/shared/admissionMasters";
import type { PhdApplication } from "@/features/phd-application/types/application.types";
import { CANDIDATE_INSTITUTION_FIELDS } from "../form-config/scrutiny.fields";

export function ScrutinyCandidateDetails({ application }: { application: PhdApplication | null }) {
    const profile = application?.profile ?? emptyProfile("");
    const fields = candidateProfileFields({ sameAddress: profile.sameAddress, qualified: profile.qualificationType !== "Not Applicable", category: profile.category });
    const methods = useForm({ defaultValues: {
        ...profile,
        dateOfBirth: profile.dateOfBirth.split("-").reverse().join("/"),
        qualificationCertificate: profile.qualificationCertificate?.name ?? "",
        categoryProof: profile.categoryProof?.name ?? "",
        identityDocument: profile.identityDocument?.name ?? "",
        academicDocument: profile.academicDocument?.name ?? "",
        supportingDocument: profile.supportingDocument?.name ?? "",
        declaration: profile.declaration ? "Accepted" : "",
        university: admissionConfig.universities.find((item) => item.id === application?.advertisement.university)?.label ?? "",
        department: application?.advertisement.department ?? "",
    } });
    const display = (items: FormField[]) => <FormGenerator standalone gridColumns={12} fields={items.map((field) => ({
        ...field,
        type: field.type === "textarea" ? "textarea" : "text",
        required: false,
        readOnly: true,
        disabled: false,
        ...(field.name === "declaration" ? { label: "Declaration" } : {}),
    }))} onSubmit={() => undefined} />;
    const cell = "border border-table-border p-2";
    return <section className="col-span-12" aria-label="Candidate Details">
        <FormProvider {...methods}>
            <Card>
                <CardHeader title="Candidate Details" divider />
                <CardBody>
                    {display([...fields.personal, PROFILE_FIELDS.mobileNumber, PROFILE_FIELDS.emailAddress, ...CANDIDATE_INSTITUTION_FIELDS])}
                </CardBody>
                <CardHeader title="Address Details" divider />
                <CardBody>{display(fields.address.filter((field) => field.name !== "sameAddress"))}</CardBody>
                <CardHeader title="Educational Qualifications" divider />
                <CardBody>
                    {application?.profile && <DynamicFormTable rows={profile.education} showAction={false} headers={["Qualification", "Institution / University", "Passing Year", "Marks (%)"]} renderRow={(index) => {
                        const row = profile.education[index];
                        return <><td className={cell}>{row.qualification}</td><td className={cell}>{row.institution}</td><td className={cell}>{row.year}</td><td className={cell}>{row.marks}</td></>;
                    }} />}
                </CardBody>
                <CardHeader title="NET / URET Details" divider />
                <CardBody>{display(fields.qualification)}</CardBody>
                <CardHeader title="Category / Reservation Details" divider />
                <CardBody>{display(fields.category)}</CardBody>
                <CardHeader title="Documents & Declaration" divider />
                <CardBody>{display(fields.documents)}</CardBody>
            </Card>
        </FormProvider>
    </section>;
}
