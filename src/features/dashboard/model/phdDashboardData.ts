import { admissionConfig } from "@/features/shared/admissionMasters";
import { LIFECYCLE_STAGES, type DashboardRecord } from "./phdDashboard";

const names = ["Ananya Das", "Rohan Mishra", "Priya Sahoo", "Arjun Nayak", "Sneha Mohanty"];
const dueDate = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
};

// Dashboard-only dummy records; these never enter application or approval stores.
export const dashboardDemoRecords = (): DashboardRecord[] => admissionConfig.sessions.flatMap((academicSession) =>
    admissionConfig.universities.flatMap((university) => university.departments.flatMap((department) =>
        LIFECYCLE_STAGES.flatMap((stage, stageIndex) => names.map((name, index) => {
            const id = `DEMO-${academicSession}-${university.id}-${department}-${stageIndex}-${index + 1}`;
            const completed = stage === "Degree";
            const pendingWith = stage === "Research" ? "Authorized HED Official / Auditor" : "University Authority";
            return {
                id, reference: `${stage === "Admission" ? "APP" : "PHD"}/${academicSession.slice(0, 4)}/${stageIndex + 1}${String(index + 1).padStart(3, "0")}`,
                name, academicSession, university: university.id, department, stage,
                status: completed ? "Completed" : stage === "Admission" ? "Submitted" : "Under Review",
                admitted: stage !== "Admission", degreeAwarded: completed,
                pendingWith: completed ? undefined : pendingWith,
                pendingAction: completed ? undefined : stage === "Admission" ? "Admission Approval" : `${stage} Approval`,
                dueDate: completed ? undefined : dueDate(stage === "Research" || stage === "Thesis" ? -(index + 1) : index + 1),
            };
        })),
    )),
);

