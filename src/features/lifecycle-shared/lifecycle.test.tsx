import { AuditTrailList } from "@/features/audit-trail/components/AuditTrailList";
import { ReportsAnalyticsCard } from "@/features/reports-analytics/components/ReportsAnalyticsCard";
import { definition as coursework, courseworkFields } from "@/features/coursework/form-config/coursework.fields";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { store } from "@/app/store";
import { setActiveRole } from "@/features/shared/store/PayFixStore";
import { lifecycleFeatures } from "./featureRegistry";
import { makeFeatureService, recordOptions, resolveLifecycleActor, scopedScholars, dateToday, summarizeLifecycleIndicators } from "./service/lifecycleStore";
import { validateLifecycle } from "./validation/lifecycleValidation";
import { useLifecyclePage } from "./hooks/useLifecyclePage";
import { LifecycleFormCard } from "./components/LifecycleFormCard";
import { LifecycleList } from "./components/LifecycleList";
import type { Definition, FieldContext } from "./types";
import type { FormField } from "@/shared/components/ui/Forms";
import { courseworkExamsFields, definition as examination } from "@/features/coursework-exams/form-config/courseworkExams.fields";
import { selectionScheduleFields, definition as scheduling } from "@/features/selection-schedule/form-config/selectionSchedule.fields";
import { definition as users, adminManagementFields } from "@/features/admin-management/form-config/adminManagement.fields";

beforeAll(() => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("min-width"), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn() }));
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});

const modules = import.meta.glob<Record<string, unknown>>("../*/form-config/*.fields.ts", { eager: true });
const fieldsFor = (def: Definition) => {
    const module = Object.values(modules).find((item) => item.definition === def)!;
    return module[def.key + "Fields"] as (context: FieldContext) => FormField[];
};
function Harness({ def }: { def: Definition }) {
    const controller = useLifecyclePage(def, makeFeatureService(def), fieldsFor(def));
    return <>{def.key === "reportsAnalytics" ? <ReportsAnalyticsCard controller={controller} /> : <LifecycleFormCard controller={controller} />}{def.key === "auditTrail" ? <AuditTrailList controller={controller} /> : <LifecycleList controller={controller} />}</>;
}

describe("remaining SRS wireframes", () => {
    it.each(lifecycleFeatures.map((def) => [def.title, def] as const))("renders %s with scoped records", (_title, def) => {
        act(() => setActiveRole(def.writers[0] ?? def.roles[0]));
        const rendered = render(<Provider store={store}><MemoryRouter><Harness def={def} /></MemoryRouter></Provider>);
        expect(screen.getAllByRole("table").length).toBeGreaterThan(0);
        expect(screen.getAllByText(def.key === "notifications" ? "Notification History" : def.title).length).toBeGreaterThan(0);
        if (!def.readOnly) expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
        if (def.key === "reportsAnalytics") {
            const indicators = screen.getByRole("region", { name: "Dashboard Indicators" });
            for (const label of ["Admissions", "Coursework", "Progress", "Thesis", "Degree Award"]) expect(within(indicators).getByText(label)).toBeInTheDocument();
            expect(within(indicators).queryByRole("textbox")).not.toBeInTheDocument();
        }
        if (def.key === "notifications") {
            expect(screen.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
            for (const label of ["Event Type", "Recipient", "Message", "Due Date", "Delivery Channel", "Delivery Status"]) expect(screen.getAllByText(label).length).toBeGreaterThan(0);
        }
        if (def.key === "adminManagement") expect(screen.getByRole("button", { name: "Permissions" })).toBeInTheDocument();
        rendered.unmount();
    });
    it("restricts examiner and scholar groups to their assigned workflows", () => {
        const degree = lifecycleFeatures.find((feature) => feature.key === "degreeAward")!;
        const actor = resolveLifecycleActor("Examiner / Viva Panel", null);
        expect(makeFeatureService(degree).read(actor)).toEqual([]);
        expect(() => makeFeatureService(degree).save(actor, {}, {}, [])).toThrow(/cannot submit/);
        const vivaActor = resolveLifecycleActor("Examiner / Viva Panel", null, "vivaVoce");
        expect(scopedScholars(vivaActor, "vivaVoce").length).toBeGreaterThan(0);
        const unassignedExaminer = resolveLifecycleActor("Examiner / Viva Panel", { universityId: "utkal" }, "vivaVoce");
        expect(scopedScholars(unassignedExaminer, "vivaVoce")).toEqual([]);
        const results = lifecycleFeatures.find((feature) => feature.key === "resultsAdmission")!;
        expect(makeFeatureService(results).read(resolveLifecycleActor("Student / PhD Scholar", null))).toEqual([]);
    });
    it("blocks writes from unrelated roles and reads outside institution scope", () => {
        const service = makeFeatureService(examination);
        const actor = resolveLifecycleActor("Department Authority / Course Coordinator", { universityId: "ravenshaw", departmentNames: ["English"] });
        expect(service.read(actor)).toEqual([]);
        expect(() => service.save(resolveLifecycleActor("Thesis Examiner", null), {}, {}, [])).toThrow(/cannot submit/);
    });
    it("calculates indicator counts and status summaries from report records", () => {
        const actor = resolveLifecycleActor("Department Authority / Course Coordinator", null);
        const rows = makeFeatureService(examination).read(actor).slice(0, 2).map((row, index) => ({ ...row, status: index ? "Submitted" : "Completed", values: { ...row.values, lifecycleStage: "Coursework" } }));
        const summary = summarizeLifecycleIndicators(rows);
        expect(summary).toContain("Coursework: 2 (Completed: 1, Submitted: 1)");
        expect(summary).toContain("Admissions: 0");
        expect(summary).toContain("Degree Award: 0");
    });
    it("requires attendance separately for every enrolled scholar", () => {
        const actor = resolveLifecycleActor("Department Authority / Course Coordinator", null);
        const values = { attendance: "Present" };
        const fields = courseworkFields({ actor, values, options: recordOptions(actor, coursework.key, values), scholars: [] });
        const enrollment = [{ scholar: "PHD/2026/001", attendance: "Present" }, { scholar: "PHD/2026/002", attendance: "" }];
        expect(validateLifecycle(coursework, values, { enrollment }, fields, actor).enrollment).toMatch(/every enrolled scholar/);
        enrollment[1].attendance = "Invalid";
        expect(validateLifecycle(coursework, values, { enrollment }, fields, actor).enrollment).toBeTruthy();
        enrollment[1].attendance = "Absent";
        expect(validateLifecycle(coursework, values, { enrollment }, fields, actor).enrollment).toBeUndefined();
    });
    it("enforces attendance, score limits, and required assessment grids", () => {
        const actor = resolveLifecycleActor("University Authority", null);
        const values = { advertisement: "PHD-DEMO-CS", stage: "Written Examination", schedule: dateToday() + "T12:00", venue: "Seminar Hall", panel: ["Prof. S. K. Behera"], maximumMarks: "100" };
        const fields = selectionScheduleFields({ actor, values, options: recordOptions(actor, scheduling.key, values), scholars: [] });
        expect(validateLifecycle(scheduling, values, { assessments: [{ candidate: "APP/2027/001", attendance: "Absent", marks: "80", outcome: "Qualified" }] }, fields, actor).assessments).toMatch(/blocked|Absent/);
        expect(validateLifecycle(scheduling, values, { assessments: [] }, fields, actor).assessments).toBeTruthy();
    });
    it("does not issue coursework certificates for failed results", () => {
        const actor = resolveLifecycleActor("Department Authority / Course Coordinator", null);
        const values = { scholar: scopedScholars(actor, examination.key)[0].id, examinationDate: dateToday(), issueDate: dateToday(), signatory: "Prof. S. K. Behera", marks: "20" };
        const fields = courseworkExamsFields({ actor, values, options: recordOptions(actor, examination.key, values), scholars: scopedScholars(actor, examination.key) });
        const result = makeFeatureService(examination).save(actor, values, {}, fields);
        expect(result.values.result).toBe("Failed");
        expect(result.values.certificateNumber).toBeUndefined();
    });
    it("requires permissions and valid contact details for user accounts", () => {
        const actor = resolveLifecycleActor("System Administrator", null);
        const values = { username: "registrar", name: "Registrar", email: "invalid", mobile: "123", role: "University Authority", university: "utkal", department: "Computer Science", permissions: [] };
        const fields = adminManagementFields({ actor, values, options: recordOptions(actor, users.key, values), scholars: [] });
        const errors = validateLifecycle(users, values, {}, fields, actor);
        expect(errors.email).toBeTruthy(); expect(errors.mobile).toBeTruthy(); expect(errors.permissions).toBeTruthy();
    });
    it("shows audit search and read-only change details without an empty filter toggle", () => {
        act(() => setActiveRole("HED Official"));
        const def = lifecycleFeatures.find((feature) => feature.key === "auditTrail")!;
        const rendered = render(<Provider store={store}><MemoryRouter><Harness def={def} /></MemoryRouter></Provider>);
        expect(screen.getByPlaceholderText("Audit Search")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Show filters|Hide filters/ })).not.toBeInTheDocument();
        fireEvent.click(screen.getAllByRole("button", { name: /^View / })[0]);
        expect(screen.getByRole("textbox", { name: "Change Details" })).toHaveAttribute("readonly");
        expect(screen.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
        rendered.unmount();
    });
    it("supports searching and selecting multiple permissions with the reusable picker", () => {
        act(() => setActiveRole("University Authority"));
        const rendered = render(<Provider store={store}><MemoryRouter><Harness def={users} /></MemoryRouter></Provider>);
        const picker = screen.getByRole("button", { name: "Permissions" });
        fireEvent.click(picker);
        const list = screen.getByRole("listbox");
        expect(within(list).getAllByRole("option")).toHaveLength(6);
        fireEvent.change(within(list).getByPlaceholderText("Search..."), { target: { value: "Approve" } });
        fireEvent.click(within(list).getByRole("option", { name: "Approve" }));
        fireEvent.change(within(list).getByPlaceholderText("Search..."), { target: { value: "View" } });
        fireEvent.click(within(list).getByRole("option", { name: "View" }));
        expect(picker).toHaveTextContent("2 items selected");
        rendered.unmount();
    });
});
