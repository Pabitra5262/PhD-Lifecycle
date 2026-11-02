import type { SCRUTINY_ROLES, VERIFICATION_STATUSES, DECISIONS } from "../form-config/scrutinyConfig";

export type ScrutinyRole = typeof SCRUTINY_ROLES[number];
export interface ScrutinyActor { userId: string; name: string; role: ScrutinyRole; university: string; departments: string[] }
export type VerificationStatus = typeof VERIFICATION_STATUSES[number];
export type ScrutinyDecision = typeof DECISIONS[number];
export interface ScrutinyForm { netVerification: string; documents: Record<string, string>; remarks: string; decision: string; revision: number }
export interface ScrutinyEvent {
    id: string; date: string; userId: string; user: string; role: string; action: "Forward" | "Return" | "Resubmitted";
    decision?: ScrutinyDecision; remarks: string; from: string; to: string; netVerification?: string; documents?: Record<string, string>;
}

export interface PendingScrutiny { id: string; reference: string; action: "Forward" | "Return"; form: ScrutinyForm }
