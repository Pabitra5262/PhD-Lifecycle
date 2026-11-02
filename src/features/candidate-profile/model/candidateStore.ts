import { candidateSchema, emptyProfile, type CandidateProfile } from "./candidateProfile";

export type ApplicationStatus = "Not Applied" | "Draft" | "Submitted" | "Under Review" | "Returned" | "Selected" | "Rejected";
type Contact = "mobile" | "email";
interface Verification { value: string; code: string; expires: number; attempts: number }
export interface CandidateRecord {
    profile: CandidateProfile;
    applicationStatus: ApplicationStatus;
    verifiedMobile: string;
    verifiedEmail: string;
    completed: boolean;
    updatedAt?: string;
}
const records = new Map<string, CandidateRecord>();
const challenges = new Map<string, Verification>();
const copy = (record: CandidateRecord) => ({ ...record, profile: { ...record.profile, education: record.profile.education.map((row) => ({ ...row })) } });
export const canEditCandidate = (status: ApplicationStatus) => ["Not Applied", "Draft", "Returned"].includes(status);
export const getCandidate = (account: string, verifiedHimsId?: string) => {
    let record = records.get(account);
    if (!record) {
        record = { profile: emptyProfile(verifiedHimsId || `PHD-CAN-${crypto.randomUUID().toUpperCase()}`), applicationStatus: "Not Applied", verifiedMobile: "", verifiedEmail: "", completed: false };
        records.set(account, record);
    }
    return copy(record);
};
// Local verification preview for the wireframe. Replace with server-side OTP delivery and validation.
export const requestContactCode = (account: string, type: Contact, value: string) => {
    if (!(type === "mobile" ? /^\d{10}$/.test(value) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) throw new Error(`Enter a valid ${type} first.`);
    if (!records.has(account)) throw new Error("Candidate is not authenticated.");
    const code = String(100000 + crypto.getRandomValues(new Uint32Array(1))[0] % 900000);
    challenges.set(`${account}:${type}`, { value, code, expires: Date.now() + 5 * 60 * 1000, attempts: 0 });
    return code;
};
export const verifyContactCode = (account: string, type: Contact, value: string, code: string) => {
    const key = `${account}:${type}`;
    const challenge = challenges.get(key);
    if (!challenge || Date.now() > challenge.expires || challenge.attempts >= 5 || challenge.value !== value) throw new Error("Verification expired or contact changed. Request a new code.");
    challenge.attempts += 1;
    if (challenge.code !== code) throw new Error("Incorrect verification code.");
    const record = records.get(account);
    if (!record) throw new Error("Candidate is not authenticated.");
    if (type === "mobile") record.verifiedMobile = value;
    else record.verifiedEmail = value;
    challenges.delete(key);
    return copy(record);
};
export const saveCandidate = (account: string, profile: CandidateProfile, final: boolean) => {
    const record = records.get(account);
    if (!record) throw new Error("Candidate is not authenticated.");
    if (!canEditCandidate(record.applicationStatus)) throw new Error("Profile editing is locked for the current application status.");
    if (profile.candidateId !== record.profile.candidateId) throw new Error("Candidate ID cannot be changed.");
    const value = final ? candidateSchema.parse(profile) : profile;
    if (final && (record.verifiedMobile !== value.mobile || record.verifiedEmail !== value.email)) throw new Error("Verify both the current mobile number and email before submitting.");
    if (final && !value.declaration) throw new Error("Accept the declaration before final submission.");
    record.profile = { ...value, permanentAddress: value.sameAddress ? value.currentAddress : value.permanentAddress, permanentPin: value.sameAddress ? value.currentPin : value.permanentPin, education: value.education.map((row) => ({ ...row })) };
    record.completed = final; record.updatedAt = new Date().toISOString();
    return copy(record);
};
/** Called by the future application workflow; candidates cannot change this status from My Profile. */
export const setCandidateApplicationStatus = (account: string, status: ApplicationStatus) => {
    const record = records.get(account);
    if (!record) throw new Error("Candidate not found.");
    record.applicationStatus = status;
};
/** Applications consume only a completed profile whose current contacts remain verified. */
export const candidateForApplication = (account: string) => {
    const record = records.get(account);
    if (!record?.completed || record.verifiedMobile !== record.profile.mobile || record.verifiedEmail !== record.profile.email) return null;
    return copy(record).profile;
};
