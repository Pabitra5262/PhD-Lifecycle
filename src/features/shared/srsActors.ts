/** Six actor groups shown in the SRS opening use-case diagram. */
export const srsActors = [
    {
        "key": "university",
        "label": "University Authority",
        "workflowRole": "University Authority",
        "pages": [
            "phdDashboard",
            "advertisements",
            "selectionConfiguration",
            "selectionSchedule",
            "resultsAdmission",
            "researchRegistration",
            "scholarRequests",
            "thesisSubmission",
            "examinerManagement",
            "vivaVoce",
            "degreeAward",
            "reportsAnalytics",
            "notifications",
            "courseworkExams",
            "adminManagement",
            "auditTrail"
        ]
    },
    {
        "key": "departmentAuthority",
        "label": "Department Authority / Committees",
        "workflowRole": "Department Authority / Course Coordinator",
        "pages": [
            "applicationScrutiny",
            "selectionSchedule",
            "coursework",
            "courseworkExams",
            "researchRegistration",
            "progressMonitoring",
            "scholarRequests",
            "preSubmissionSeminar",
            "thesisSubmission",
            "vivaVoce",
            "reportsAnalytics",
            "notifications",
            "resultsAdmission"
        ]
    },
    {
        "key": "scholar",
        "label": "Student / PhD Scholar",
        "workflowRole": "Student / Candidate / Scholar",
        "pages": [
            "myProfile",
            "apply",
            "coursework",
            "courseworkExams",
            "progressMonitoring",
            "scholarRequests",
            "thesisSubmission",
            "notifications",
            "preSubmissionSeminar",
            "vivaVoce",
            "degreeAward"
        ]
    },
    {
        "key": "supervisor",
        "label": "Supervisor",
        "workflowRole": "Supervisor / Co-Supervisor",
        "pages": [
            "researchRegistration",
            "progressMonitoring",
            "scholarRequests",
            "preSubmissionSeminar",
            "notifications"
        ]
    },
    {
        "key": "examiner",
        "label": "Examiner / Viva Panel",
        "workflowRole": "Thesis Examiner",
        "pages": [
            "examinerManagement",
            "vivaVoce",
            "notifications"
        ]
    },
    {
        "key": "dhe",
        "label": "HED Official",
        "workflowRole": "Authorized HED Official / Auditor",
        "pages": [
            "phdDashboard",
            "reportsAnalytics",
            "auditTrail"
        ]
    }
] as const;
