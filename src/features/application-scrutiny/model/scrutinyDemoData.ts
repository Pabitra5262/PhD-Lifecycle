import { demoCandidateProfile } from "@/features/candidate-profile/model/candidateProfileData";
import { getCandidate, requestContactCode, saveCandidate, verifyContactCode } from "@/features/candidate-profile/model/candidateStore";
import { activeAdvertisements } from "@/features/phd-application/service/advertisementService";
import { readMyApplications, recordDemoPayment, saveApplication } from "@/features/phd-application/service/applicationService";
import { emptyApplication } from "@/features/phd-application/model/applicationForm";
import type { ScrutinyActor } from "../types";

const names = ["Ananya Das", "Rohan Mishra", "Priya Sahoo", "Arjun Nayak", "Sneha Mohanty"];

function supportingDocument(candidateName: string, documentType: string) {
    const title = `${documentType} - ${candidateName}`.replace(/([\\()])/g, "\\$1");
    const content = `BT /F1 14 Tf 40 100 Td (${title}) Tj ET`;
    const objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 500 160] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const filename = `${candidateName}_${documentType}`.replace(/[^a-zA-Z0-9]+/g, "_").replace(/_+$/, "");
    return new File([pdf], `${filename}.pdf`, { type: "application/pdf" });
}

/** Called only for dummy-token login. Samples use the same local submission checks as candidate applications. */
export function ensureScrutinyDemoApplications(actor: ScrutinyActor) {
    const advertisement = activeAdvertisements().find((row) => row.university === actor.university && (actor.role !== "Department Authority / Course Coordinator" || actor.departments.includes(row.department)));
    if (!advertisement) return;
    names.forEach((name, index) => {
        const account = `scrutiny-demo:${advertisement.id}:${index}`;
        if (readMyApplications(account).length) return;
        const profile = {
            ...demoCandidateProfile(getCandidate(account).profile.candidateId), fullName: name,
            mobile: `900000000${index + 1}`, email: `scholar${index + 1}@example.com`,
            qualificationType: "NET & URET", examName: "NET / URET", examYear: "2025", examScore: "180", examRank: String(index + 1),
            identityDocument: supportingDocument(name, "Identity Proof"), academicDocument: supportingDocument(name, "Academic Transcripts"), qualificationCertificate: supportingDocument(name, "NET URET Certificate"), declaration: true,
        };
        for (const type of ["mobile", "email"] as const) {
            const code = requestContactCode(account, type, profile[type]);
            verifyContactCode(account, type, profile[type], code);
        }
        saveCandidate(account, profile, true);
        if (advertisement.fee > 0) recordDemoPayment(account, advertisement.id);
        saveApplication(account, {
            ...emptyApplication(advertisement.id), researchArea: advertisement.researchAreas[index % advertisement.researchAreas.length],
            synopsis: `Research proposal in ${advertisement.researchAreas[index % advertisement.researchAreas.length]}.`, synopsisFile: supportingDocument(name, "Research Synopsis"),
            documents: Object.fromEntries(advertisement.documents.map((document) => [document.id, supportingDocument(name, document.label)])),
            eligibilityConfirmed: true, declaration: true,
        }, true);
    });
}
