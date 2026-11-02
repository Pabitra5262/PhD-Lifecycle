// Local wireframe masters. Replace these with configured admission master services.
export const admissionConfig = {
    researchAreaMaxLength: 200,
    maxFileBytes: 5 * 1024 * 1024,
    sessions: ["2026-27", "2027-28"],
    universities: [
        { id: "utkal", label: "Utkal University", departments: ["Computer Science", "Physics", "Chemistry"] },
        { id: "ravenshaw", label: "Ravenshaw University", departments: ["Computer Science", "English", "Commerce"] },
        { id: "sambalpur", label: "Sambalpur University", departments: ["Mathematics", "Life Sciences", "Management"] },
    ],
    qualificationRules: [
        { id: "net-uret", label: "NET or URET qualification required", approved: true, exemptions: [] as string[] },
        { id: "net-exempt", label: "NET qualified applicants exempt from URET", approved: true, exemptions: ["NET-qualified applicants"] },
        { id: "uret", label: "URET qualification required", approved: true, exemptions: [] as string[] },
    ],
    selectionProcesses: [
        { id: "test-interview", label: "Entrance Test and Interview", approved: true, active: true },
        { id: "net-interview", label: "NET Qualification and Interview", approved: true, active: true },
    ],
};
