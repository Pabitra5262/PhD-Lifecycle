import { candidateSchema, profileConfig, type CandidateProfile } from "@/features/candidate-profile/model/candidateProfile";
import type { AdmissionAdvertisement } from "../types/advertisement.types";
import type { ApplicationForm, PhdApplication } from "../types/application.types";
import type { ApplicationValidationContext } from "../types/applicationValidation.types";
import { isOpenAdvertisement } from "../service/advertisementService";

export const fileProblem = (file: File | null | undefined) => {
    if (!(file instanceof File)) return "Upload the required document";
    if (file.size === 0 || file.size > profileConfig.maxFileBytes) return "Upload a nonempty file up to 5 MB";
    const valid = (file.type === "application/pdf" && /\.pdf$/i.test(file.name)) || (file.type === "image/jpeg" && /\.jpe?g$/i.test(file.name)) || (file.type === "image/png" && /\.png$/i.test(file.name));
    return valid ? null : "Upload a PDF, JPG or PNG file";
};
export const qualifies = (profile: CandidateProfile, advertisement: AdmissionAdvertisement) => {
    if (advertisement.requirement === "None") return true;
    const net = profile.qualificationType === "NET" || profile.qualificationType === "NET & URET";
    const uret = profile.qualificationType === "URET" || profile.qualificationType === "NET & URET";
    return advertisement.requirement === "NET" ? net : advertisement.requirement === "NET or URET" ? net || uret : uret || (net && advertisement.netExemptFromUret);
};
export const correctionAllowed = (application: PhdApplication | undefined) => application?.status === "Returned" && !!application.correctionUntil && Date.now() <= new Date(application.correctionUntil).getTime();
export const validateApplicationForm = (form: ApplicationForm, { advertisement, profile, existing, paymentStatus, workflowActive }: ApplicationValidationContext) => {
    const errors: Record<string, string> = {};
    const correcting = correctionAllowed(existing);
    if (existing?.status === "Returned" && !correcting) errors.advertisement = "The configured correction period has ended";
    if (!advertisement || (!isOpenAdvertisement(advertisement) && !(correcting && advertisement.published && advertisement.status === "Published"))) errors.advertisement = "Select a published advertisement within its application period";
    if (!profile || !candidateSchema.safeParse(profile).success) errors.profile = "Complete, verify and submit My Profile before applying";
    if (!advertisement) return errors;
    if (!advertisement.researchAreas.includes(form.researchArea)) errors.researchArea = "Select a research area configured for this advertisement";
    if (profile) {
        if (!qualifies(profile, advertisement)) errors.qualification = `This advertisement requires ${advertisement.requirement}. Only its approved exemptions are allowed.`;
        const masters = /^(ma|msc|mcom|mtech|me|mba|mca|mphil|mastersdegree|masterof.+)$/;
        if (!profile.education.some((row) => masters.test(row.qualification.toLowerCase().replace(/[^a-z]/g, "")) && Number(row.marks) >= advertisement.minimumAcademicPercent)) errors.academics = `A master's qualification with at least ${advertisement.minimumAcademicPercent}% marks is required`;
    }
    if (!form.eligibilityConfirmed) errors.eligibilityConfirmed = "Confirm that you meet the advertisement's eligibility criteria";
    const hasText = form.synopsis.trim().length > 0;
    if (form.synopsis.length > 5000) errors.synopsis = "Research interest must not exceed 5,000 characters";
    if ((advertisement.synopsis === "Text" && !hasText) || (advertisement.synopsis === "Text or File" && !hasText && !form.synopsisFile)) errors.synopsis = "Enter research interest or upload a synopsis as required";
    if (advertisement.synopsis === "File" || form.synopsisFile) { const error = fileProblem(form.synopsisFile); if (error) errors.synopsisFile = error; }
    for (const document of advertisement.documents) {
        const file = form.documents[document.id];
        if (document.required || file) { const error = fileProblem(file); if (error) errors[`document.${document.id}`] = error; }
    }
    if (paymentStatus === "Pending") errors.payment = "Application fee must be paid successfully or covered by an approved exemption";
    if (!form.declaration) errors.declaration = "Accept the declaration before submission";
    if (!correcting && !workflowActive) errors.workflow = "The advertisement's selection configuration is not active";
    return errors;
};
