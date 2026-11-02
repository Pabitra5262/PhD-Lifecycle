import { z } from "zod";

export const profileConfig = {
    maxFileBytes: 5 * 1024 * 1024,
    minimumAge: null as number | null,
    maximumAge: null as number | null,
    categories: ["General", "SC", "ST", "OBC", "EWS"],
    qualificationTypes: ["Not Applicable", "NET", "URET", "NET & URET"],
};
export const today = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
export const ageOn = (dob: string, reference = today()) => {
    const [year, month, day] = dob.split("-").map(Number);
    const [currentYear, currentMonth, currentDay] = reference.split("-").map(Number);
    return currentYear - year - (currentMonth < month || (currentMonth === month && currentDay < day) ? 1 : 0);
};
const text = z.string().trim().min(1, "This field is required");
const numeric = (value: string) => value.trim() !== "" && Number.isFinite(Number(value));
const upload = z.custom<File>((value) => value instanceof File, "Upload the required document")
    .refine((file) => !(file instanceof File) || ((file.type === "application/pdf" && /\.pdf$/i.test(file.name)) || (file.type === "image/jpeg" && /\.jpe?g$/i.test(file.name)) || (file.type === "image/png" && /\.png$/i.test(file.name))), "Upload a PDF, JPG or PNG file")
    .refine((file) => !(file instanceof File) || (file.size > 0 && file.size <= profileConfig.maxFileBytes), "Upload a nonempty file up to 5 MB");
const optionalUpload = upload.nullable().optional();
export const candidateSchema = z.object({
    candidateId: text,
    fullName: text.max(150),
    mobile: z.string().regex(/^\d{10}$/, "Mobile number must contain exactly 10 digits"),
    email: z.email({ message: "Enter a valid email address" }),
    dateOfBirth: z.iso.date({ message: "Select a valid date of birth" }).refine((value) => value < today(), "Date of birth must be in the past"),
    currentAddress: text.max(1000),
    currentPin: z.string().regex(/^\d{6}$/, "PIN code must contain exactly 6 digits"),
    sameAddress: z.boolean(),
    permanentAddress: z.string().max(1000),
    permanentPin: z.string(),
    education: z.array(z.object({
        qualification: text.max(150), institution: text.max(200),
        year: z.string().regex(/^\d{4}$/, "Enter a four-digit passing year").refine((value) => Number(value) >= 1900 && Number(value) <= new Date().getFullYear(), "Passing year cannot be in the future"),
        marks: z.string().refine((value) => numeric(value) && Number(value) >= 0 && Number(value) <= 100, "Enter marks as a percentage from 0 to 100"),
    })).min(1, "Add at least one educational qualification"),
    qualificationType: z.string().refine((value) => profileConfig.qualificationTypes.includes(value), "Select a qualification type"),
    examName: z.string(), examYear: z.string(), examScore: z.string(), examRank: z.string(),
    qualificationCertificate: optionalUpload,
    category: z.string().refine((value) => profileConfig.categories.includes(value), "Select a category"),
    categoryProof: optionalUpload,
    identityDocument: optionalUpload,
    academicDocument: optionalUpload,
    supportingDocument: optionalUpload,
    declaration: z.boolean(),
}).superRefine((value, context) => {
    const error = (path: (string | number)[], message: string) => context.addIssue({ code: "custom", path, message });
    if (!(value.identityDocument instanceof File)) error(["identityDocument"], "Upload the identity document");
    if (!(value.academicDocument instanceof File)) error(["academicDocument"], "Upload academic documents");
    if (!value.declaration) error(["declaration"], "Accept the declaration before final submission");
    const age = ageOn(value.dateOfBirth);
    if (profileConfig.minimumAge !== null && age < profileConfig.minimumAge) error(["dateOfBirth"], `Minimum eligible age is ${profileConfig.minimumAge} years`);
    if (profileConfig.maximumAge !== null && age > profileConfig.maximumAge) error(["dateOfBirth"], `Maximum eligible age is ${profileConfig.maximumAge} years`);
    if (!value.sameAddress) {
        if (!value.permanentAddress.trim()) error(["permanentAddress"], "Enter permanent address");
        if (!/^\d{6}$/.test(value.permanentPin)) error(["permanentPin"], "PIN code must contain exactly 6 digits");
    }
    value.education.forEach((row, index) => {
        if (Number(row.year) < Number(value.dateOfBirth.slice(0, 4))) error(["education", index, "year"], "Passing year must not precede birth year");
    });
    if (value.qualificationType !== "Not Applicable") {
        if (!value.examName.trim()) error(["examName"], "Enter examination name and details");
        if (!/^\d{4}$/.test(value.examYear) || Number(value.examYear) < Math.max(1900, Number(value.dateOfBirth.slice(0, 4))) || Number(value.examYear) > new Date().getFullYear()) error(["examYear"], "Enter a valid examination year");
        if (!numeric(value.examScore) || Number(value.examScore) < 0) error(["examScore"], "Enter a valid nonnegative score");
        if (value.examRank && (!/^\d+$/.test(value.examRank) || !Number.isSafeInteger(Number(value.examRank)) || Number(value.examRank) < 1)) error(["examRank"], "Rank must be a positive whole number");
        if (!(value.qualificationCertificate instanceof File)) error(["qualificationCertificate"], "Upload the qualification certificate");
    }
    if (value.category !== "General" && !(value.categoryProof instanceof File)) error(["categoryProof"], "Upload category / reservation proof");
});
export type CandidateProfile = z.infer<typeof candidateSchema>;
export const emptyProfile = (candidateId: string): CandidateProfile => ({
    candidateId, fullName: "", mobile: "", email: "", dateOfBirth: "", currentAddress: "", currentPin: "", sameAddress: false,
    permanentAddress: "", permanentPin: "", education: [{ qualification: "", institution: "", year: "", marks: "" }],
    qualificationType: "Not Applicable", examName: "", examYear: "", examScore: "", examRank: "", qualificationCertificate: null,
    category: "General", categoryProof: null, identityDocument: null, academicDocument: null,
    supportingDocument: null, declaration: false,
});
