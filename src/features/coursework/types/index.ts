import type { Values, RecordRow } from "@/features/lifecycle-shared/types";
export interface CourseworkValues extends Values {
    academicSession: string;
    department: string;
    course: string;
    credits: string;
    duration: string;
    faculty: string;
    classDate: string;
    startTime: string;
    endTime: string;
    location: string;
    attendance: string;
    courseStatus: string;
}
export type CourseworkRecord = RecordRow;
