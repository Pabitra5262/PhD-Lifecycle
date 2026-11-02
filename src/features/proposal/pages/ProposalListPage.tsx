import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DialogModal, FilterPanel, Select, showToast, useAppNavigate, useTableFilters } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { CADRES, INSTITUTIONS, PROPOSAL_TYPES, STAGE_ROLE, STATUS_LABEL, TabsCard, canOpen, isEditable, useCurrentUser, type Proposal } from "../../shared";
import { ProposalTable } from "../components/ProposalTable";
import { useProposalList } from "../hooks/useProposalList";
import { useProposalMutations } from "../hooks/useProposalMutations";
import type { ProposalGroup } from "../types/proposal.types";

const GROUPS: { key: ProposalGroup; label: string }[] = [
    { key: "all", label: "All" },
    { key: "draft", label: "Draft" },
    { key: "process", label: "In Process" },
    { key: "closed", label: "Approved / Sanctioned" },
    { key: "returned", label: "Returned / Rejected" },
];

const ACT_LABEL: Record<string, string> = { accounts: "Verify", fo: "Approve / Forward", dhe: "Sanction" };

const opts = (values: string[]) => [{ value: "", label: "All" }, ...values.map((v) => ({ value: v, label: v }))];
const FIELD = "min-w-48 flex-1";

/** SRS 1.3 — View, Track and Manage Proposals. */
const ProposalListPage = () => {
    const navigate = useAppNavigate();
    const [params] = useSearchParams();
    const { role, roleKey } = useCurrentUser();
    const { remove } = useProposalMutations();
    const [group, setGroup] = useState<ProposalGroup>(GROUPS.find((g) => g.key === params.get("status"))?.key ?? "all");
    const [deleting, setDeleting] = useState<Proposal | null>(null);
    const { rows, counts, periods } = useProposalList(group);
    const filters = useTableFilters({ status: "", type: "", period: "", institution: "", cadre: "" });
    // Applied filters (empty = All) narrow the rows of the chosen status tab.
    const shown = rows.filter((r) => (Object.keys(filters.applied) as (keyof typeof filters.applied)[]).every((k) => !filters.applied[k] || String(r[k]) === filters.applied[k]));

    const canSubmit = canOpen(role, "submit");
    const canAct = (p: Proposal) => STAGE_ROLE[p.status] === roleKey;
    const canEdit = (p: Proposal) => canSubmit && isEditable(p);
    const showInstitution = roleKey !== "officer" && roleKey !== "college";


    return (
        <>
            <PageHeader
                title="View Proposals"
                
            />

            {/* SRS 1.3 filters: Status, Type, Period, Institution. The filter icon in the table toolbar hides / shows them. */}
            <FilterPanel {...filters.panelProps} className="mb-4" status={`${shown.length} proposals shown`}>
                <Select label="Status" placeholder="All" options={[{ value: "", label: "All" }, ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))]} value={filters.draft.status} onChange={(v) => filters.set("status", String(v))} wrapperClassName={FIELD} />
                <Select label="Proposal Type" placeholder="All" options={opts(PROPOSAL_TYPES)} value={filters.draft.type} onChange={(v) => filters.set("type", String(v))} wrapperClassName={FIELD} />
                <Select label="Period" placeholder="All" options={opts(periods)} value={filters.draft.period} onChange={(v) => filters.set("period", String(v))} wrapperClassName={FIELD} />
                {showInstitution && <Select label="Institution" placeholder="All" options={opts(INSTITUTIONS)} value={filters.draft.institution} onChange={(v) => filters.set("institution", String(v))} wrapperClassName={FIELD} />}
                <Select label="Cadre" placeholder="All" options={opts(CADRES)} value={filters.draft.cadre} onChange={(v) => filters.set("cadre", String(v))} wrapperClassName={FIELD} />
            </FilterPanel>

            <TabsCard
                label="Proposal status"
                activeTab={group}
                onChange={(k) => setGroup(k as ProposalGroup)}
                tabs={GROUPS.map((g) => ({ key: g.key, label: g.label, count: counts[g.key] }))}
            >
                <ProposalTable
                    rows={shown}
                    filterToggle={filters.tableToggle}
                    onView={(p) => navigate(`/proposals/${p.id}`)}
                    canEdit={canEdit}
                    onEdit={(p) => navigate(`/proposals/${p.id}/edit`)}
                    onDelete={setDeleting}
                    canAct={canAct}
                    onAct={(p) => navigate(`/verification/${p.id}`)}
                    actLabel={ACT_LABEL[roleKey] ?? "Act"}
                />
            </TabsCard>

            <DialogModal
                isOpen={!!deleting}
                onClose={() => setDeleting(null)}
                title="Delete draft?"
                message={`Draft ${deleting?.id} for ${deleting?.officerName} will be deleted. This cannot be undone.`}
                confirmText="Delete"
                type="danger"
                onConfirm={() => {
                    if (deleting) {
                        remove(deleting.id);
                        showToast.success("Draft deleted", deleting.id);
                    }
                    setDeleting(null);
                }}
            />
        </>
    );
};

export default ProposalListPage;
