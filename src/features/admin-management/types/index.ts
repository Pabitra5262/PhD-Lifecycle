import type { Values, RecordRow } from "@/features/lifecycle-shared/types";
export interface AdminManagementValues extends Values {
    username: string;
    name: string;
    mobile: string;
    email: string;
    role: string;
    university: string;
    department: string;
    permissions: string[];
}
export type AdminManagementRecord = RecordRow;
