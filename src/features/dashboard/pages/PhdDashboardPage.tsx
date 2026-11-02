import { CONTROL_FIELDS } from "../form-config/dashboardControls.fields";
import { configuredFieldProps } from "@/features/shared/formFields";
import { useState } from "react";
import { ClipboardCheck, Files, GraduationCap, Timer, Users } from "lucide-react";
import { Card, CardBody, CardHeader, DataTable, FilterPanel, KpiCard, Modal, type TableColumnDef } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { SearchableSelect } from "@/shared/components/ui/Forms";
import { useAppSelector } from "@/app/hooks";
import { useRole } from "@/features/shared/store/PayFixStore";
import { admissionConfig } from "@/features/shared/admissionMasters";
import { applicationsForDashboard } from "@/features/phd-application/model/applicationStore";
import { dashboardScope, LIFECYCLE_STAGES, scopedDashboardRecords, type DashboardRecord } from "../model/phdDashboard";
import { dashboardDemoRecords } from "../model/phdDashboardData";

const columns: TableColumnDef<DashboardRecord>[] = [
    { accessorKey: "reference", header: "Record Reference" },
    { accessorKey: "name", header: "Candidate / Scholar" },
    { accessorKey: "academicSession", header: "Academic Session" },
    { id: "university", header: "University", accessorFn: (row) => admissionConfig.universities.find((u) => u.id === row.university)?.label ?? row.university },
    { accessorKey: "department", header: "Department" },
    { accessorKey: "stage", header: "Lifecycle Stage" },
    { accessorKey: "status", header: "Status" },
];
const pendingColumns: TableColumnDef<DashboardRecord>[] = [
    ...columns,
    { accessorKey: "pendingAction", header: "Pending Action" },
    { accessorKey: "dueDate", header: "Due Date", accessorFn: (row) => row.dueDate ? new Date(`${row.dueDate}T00:00:00`).toLocaleDateString("en-GB") : "—" },
];
const options = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

/** UC-PHD-001 — University Dashboard. */
export default function PhdDashboardPage() {
    const [filtersHidden, setFiltersHidden] = useState(false);
    const { workflowRole: role, roleKey } = useRole();
    const identity: unknown = useAppSelector((state) => state.auth.user);
    const scope = dashboardScope(roleKey, identity);
    const universities = admissionConfig.universities.filter((u) => scope.universities.includes(u.id));
    const [session, setSession] = useState(admissionConfig.sessions[0] ?? "");
    const [university, setUniversity] = useState("");
    const [department, setDepartment] = useState("");
    const [stage, setStage] = useState("");
    const [applied, setApplied] = useState<{ session: string; university: string; department: string; stage: string } | null>(null);
    const [demoRecords] = useState(dashboardDemoRecords);
    const [detail, setDetail] = useState<string | null>(null);
    const [selected, setSelected] = useState<DashboardRecord | null>(null);
    const universityId = universities.some((u) => u.id === university) ? university : universities[0]?.id ?? "";
    const departments = (universities.find((u) => u.id === universityId)?.departments ?? []).filter((value) => !scope.departments.length || scope.departments.includes(value));
    const departmentName = departments.includes(department) ? department : departments[0] ?? "";
    const defaultUniversity = universities[0];
    const defaultDepartment = defaultUniversity?.departments.find((value) => !scope.departments.length || scope.departments.includes(value)) ?? "";
    const filters = applied ?? { session: admissionConfig.sessions[0] ?? "", university: defaultUniversity?.id ?? "", department: defaultDepartment, stage: "" };
    const valid = admissionConfig.sessions.includes(filters.session) && !!filters.university && !!filters.department;
    const records = scopedDashboardRecords([...demoRecords, ...applicationsForDashboard(role, scope.universities, scope.departments)], scope).filter((row) => valid && row.academicSession === filters.session && row.university === filters.university && row.department === filters.department && (!filters.stage || row.stage === filters.stage));
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const groups: { label: string; icon: typeof Files; rows: DashboardRecord[] }[] = [
        { label: "Applications", icon: Files, rows: records.filter((row) => row.stage === "Admission") },
        { label: "Admitted Scholars", icon: Users, rows: records.filter((row) => row.admitted) },
        { label: "Pending Approvals", icon: ClipboardCheck, rows: records.filter((row) => row.pendingWith && row.pendingAction?.includes("Approval")) },
        { label: "Overdue Milestones", icon: Timer, rows: records.filter((row) => row.dueDate && row.dueDate < today && row.status !== "Completed") },
        { label: "Degrees Awarded", icon: GraduationCap, rows: records.filter((row) => row.degreeAwarded) },
    ];
    const pending = records.filter((row) => row.pendingWith === role);
    return <>
        <PageHeader title="University Dashboard" />
        <FilterPanel hidden={filtersHidden} onHiddenChange={setFiltersHidden} floatingButton={false} title="Filters" className="mb-4" appliedCount={3 + Number(!!filters.stage)} onSubmit={() => {
            if (!admissionConfig.sessions.includes(session) || !universityId || !departmentName) return;
            setApplied({ session, university: universityId, department: departmentName, stage });
            setDetail(null); setSelected(null);
        }} onReset={() => {
            setSession(admissionConfig.sessions[0] ?? ""); setUniversity(""); setDepartment(""); setStage(""); setApplied(null); setDetail(null); setSelected(null);
        }}>
                <div className="grid grid-cols-12 gap-4">
                    <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.academicSession)} options={options(admissionConfig.sessions)} value={session} onChange={(value) => setSession(String(value))} />
                    <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.university)} options={universities.map((u) => ({ value: u.id, label: u.label }))} value={universityId} disabled={!universities.length} onChange={(value) => { setUniversity(String(value)); setDepartment(""); }} />
                    <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.department)} options={options(departments)} value={departmentName} disabled={!departments.length} onChange={(value) => setDepartment(String(value))} />
                    <SearchableSelect {...configuredFieldProps(CONTROL_FIELDS.lifecycleStage)} options={[{ value: "", label: "All Stages" }, ...options(LIFECYCLE_STAGES)]} value={stage} onChange={(value) => setStage(String(value))} />
                </div>
        </FilterPanel>
        <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {groups.map((group) => <KpiCard key={group.label} label={group.label} value={group.rows.length} icon={group.icon} onClick={() => setDetail(group.label)} />)}
        </div>
        <Card>
            <CardHeader title="Pending Tasks" divider />
            <CardBody><DataTable filterToggle={{ hidden: filtersHidden, onToggle: () => setFiltersHidden(!filtersHidden), appliedCount: 3 + Number(!!filters.stage) }} data={pending} columns={pendingColumns} getRowId={(row) => row.id} caption="Pending Tasks" emptyTitle="No pending tasks" renderPreview={null} actions={{ onView: setSelected }} /></CardBody>
        </Card>
        <Modal isOpen={detail !== null} title={detail ?? ""} size="full" onClose={() => { setDetail(null); setSelected(null); }}>
            <DataTable data={groups.find((group) => group.label === detail)?.rows ?? []} columns={columns} getRowId={(row) => row.id} caption={detail ?? ""} renderPreview={null} actions={{ onView: setSelected }} />
        </Modal>
        <Modal isOpen={selected !== null} title="Record Details" onClose={() => setSelected(null)}>
            {selected && <dl className="grid grid-cols-2 gap-3">{[
                ["Record Reference", selected.reference], ["Candidate / Scholar", selected.name],
                ["Academic Session", selected.academicSession], ["University", admissionConfig.universities.find((u) => u.id === selected.university)?.label],
                ["Department", selected.department], ["Lifecycle Stage", selected.stage], ["Status", selected.status],
            ].map(([label, value]) => <div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd>{value}</dd></div>)}</dl>}
        </Modal>
    </>;
}
