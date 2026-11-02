import type { PhdApplication } from "@/features/phd-application/types/application.types";

export const scrutinyDocuments = (application: PhdApplication) => {
    const profile = application.profile;
    const documents: { id: string; label: string; file: File | null | undefined; required: boolean }[] = [
        { id: "identity", label: "Identity Document", file: profile?.identityDocument, required: true },
        { id: "academic", label: "Academic Documents", file: profile?.academicDocument, required: true },
        { id: "qualification", label: "NET / URET Certificate", file: profile?.qualificationCertificate, required: profile?.qualificationType !== "Not Applicable" },
        { id: "category", label: "Category / Reservation Proof", file: profile?.categoryProof, required: profile?.category !== "General" },
        { id: "supporting", label: "Profile Supporting Document", file: profile?.supportingDocument, required: false },
        { id: "synopsis", label: "Synopsis Document", file: application.form.synopsisFile, required: application.advertisement.synopsis === "File" || (application.advertisement.synopsis === "Text or File" && !application.form.synopsis.trim()) },
        ...application.advertisement.documents.map((document) => ({ id: `application:${document.id}`, label: document.label, file: application.form.documents[document.id], required: document.required })),
    ];
    return documents;
};
