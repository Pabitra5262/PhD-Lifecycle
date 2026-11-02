import { lazy } from "react";
import type { PageKey } from "@/features/shared/roles";

export const lifecyclePageRoutes = [
    { key: "selectionSchedule" as PageKey, path: "/phd/admissions/selection-schedule", Component: lazy(() => import("@/features/selection-schedule").then((module) => ({ default: module.SelectionSchedulePage }))) },
    { key: "resultsAdmission" as PageKey, path: "/phd/admissions/results-admission", Component: lazy(() => import("@/features/results-admission").then((module) => ({ default: module.ResultsAdmissionPage }))) },
    { key: "coursework" as PageKey, path: "/phd/coursework/course-management", Component: lazy(() => import("@/features/coursework").then((module) => ({ default: module.CourseworkPage }))) },
    { key: "courseworkExams" as PageKey, path: "/phd/coursework/examination-certificate", Component: lazy(() => import("@/features/coursework-exams").then((module) => ({ default: module.CourseworkExamsPage }))) },
    { key: "researchRegistration" as PageKey, path: "/phd/research-registration/supervisor-allocation", Component: lazy(() => import("@/features/research-registration").then((module) => ({ default: module.ResearchRegistrationPage }))) },
    { key: "progressMonitoring" as PageKey, path: "/phd/research/progress-monitoring", Component: lazy(() => import("@/features/progress-monitoring").then((module) => ({ default: module.ProgressMonitoringPage }))) },
    { key: "scholarRequests" as PageKey, path: "/phd/requests", Component: lazy(() => import("@/features/scholar-requests").then((module) => ({ default: module.ScholarRequestsPage }))) },
    { key: "preSubmissionSeminar" as PageKey, path: "/phd/thesis/pre-submission-seminar", Component: lazy(() => import("@/features/pre-submission-seminar").then((module) => ({ default: module.PreSubmissionSeminarPage }))) },
    { key: "thesisSubmission" as PageKey, path: "/phd/thesis/final-submission", Component: lazy(() => import("@/features/thesis-submission").then((module) => ({ default: module.ThesisSubmissionPage }))) },
    { key: "examinerManagement" as PageKey, path: "/phd/thesis/examiner-management", Component: lazy(() => import("@/features/examiner-management").then((module) => ({ default: module.ExaminerManagementPage }))) },
    { key: "vivaVoce" as PageKey, path: "/phd/viva-voce", Component: lazy(() => import("@/features/viva-voce").then((module) => ({ default: module.VivaVocePage }))) },
    { key: "degreeAward" as PageKey, path: "/phd/degree-award", Component: lazy(() => import("@/features/degree-award").then((module) => ({ default: module.DegreeAwardPage }))) },
    { key: "reportsAnalytics" as PageKey, path: "/phd/reports-analytics", Component: lazy(() => import("@/features/reports-analytics").then((module) => ({ default: module.ReportsAnalyticsPage }))) },
    { key: "notifications" as PageKey, path: "/phd/notifications", Component: lazy(() => import("@/features/notifications").then((module) => ({ default: module.NotificationsPage }))) },
    { key: "adminManagement" as PageKey, path: "/phd/administration/users", Component: lazy(() => import("@/features/admin-management").then((module) => ({ default: module.AdminManagementPage }))) },
    { key: "auditTrail" as PageKey, path: "/phd/administration/audit-trail", Component: lazy(() => import("@/features/audit-trail").then((module) => ({ default: module.AuditTrailPage }))) },
];
