import { useState } from "react";
import { Bell, FileCheck, IndianRupee, ListChecks, Save, ScrollText, Undo2, Workflow } from "lucide-react";
import { Alert, Button, StatusModal, showToast } from "@mfe/components";
import PageHeader from "@/shared/components/layout/PageHeader";
import { DemoRoleSwitcher, TabsCard } from "../../shared";
import { AuditTrailTable } from "../components/AuditTrailTable";
import { BusinessRulesForm } from "../components/BusinessRulesForm";
import { DocumentChecklist } from "../components/DocumentChecklist";
import { NotificationRules } from "../components/NotificationRules";
import { PayMatrixEditor } from "../components/PayMatrixEditor";
import { WorkflowEditor } from "../components/WorkflowEditor";
import { useConfiguration } from "../hooks/useConfiguration";

const TABS = [
    { key: "documents", label: "Proposal Types & Documents", icon: FileCheck },
    { key: "matrix", label: "Pay Levels & Cells", icon: IndianRupee },
    { key: "workflow", label: "Workflow Stages", icon: Workflow },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "rules", label: "Business Rules", icon: ListChecks },
    { key: "audit", label: "Audit Trail", icon: ScrollText },
];

/** SRS 1.7 — Configure Rules and Approval Workflow (System Administrator / Functional Admin). */
const ConfigurationPage = () => {
    const { draft, change, save, discard, dirty, audit } = useConfiguration();
    const [tab, setTab] = useState("documents");
    const [problems, setProblems] = useState<string[]>([]);

    const onSave = () => {
        const r = save();
        setProblems(r.problems);
        if (r.ok) showToast.success("Configuration saved", "Applies to proposals submitted from now on.");
    };

    return (
        <>
            <PageHeader
                title="Configuration"
                
                actions={
                    <div className="flex flex-wrap items-end gap-2">
                        <DemoRoleSwitcher />
                        <Button variant="outline" icon={<Undo2 size={16} />} label="Discard changes" disabled={!dirty} onClick={discard} />
                        <Button icon={<Save size={16} />} label="Save Configuration" disabled={!dirty} onClick={onSave} />
                    </div>
                }
            />

            {dirty && (
                <Alert tone="info" className="mb-4" title="Unsaved changes">
                    New configuration applies to proposals submitted after saving. In-flight proposals keep the rules in force when they were submitted.
                </Alert>
            )}

            <TabsCard label="Configuration sections" activeTab={tab} onChange={setTab} tabs={TABS.map((t) => (t.key === "audit" ? { ...t, count: audit.length } : t))}>
                {tab === "documents" && (
                    <DocumentChecklist
                        documents={draft.documents}
                        onSave={(doc) =>
                            change((c) => {
                                const i = c.documents.findIndex((d) => d.id === doc.id);
                                if (i >= 0) c.documents[i] = doc;
                                else c.documents.push(doc);
                            })
                        }
                        onDelete={(id) => change((c) => void (c.documents = c.documents.filter((d) => d.id !== id)))}
                    />
                )}
                {tab === "matrix" && <PayMatrixEditor levels={draft.payLevels} onChange={(levels) => change((c) => void (c.payLevels = levels))} />}
                {tab === "workflow" && <WorkflowEditor stages={draft.workflow} onChange={(stages) => change((c) => void (c.workflow = stages))} />}
                {tab === "notifications" && <NotificationRules rules={draft.notifications} onChange={(rules) => change((c) => void (c.notifications = rules))} />}
                {tab === "rules" && <BusinessRulesForm rules={draft.rules} onChange={(rules) => change((c) => void (c.rules = rules))} />}
                {tab === "audit" && <AuditTrailTable entries={audit} />}
            </TabsCard>

            <StatusModal
                isOpen={problems.length > 0}
                type="error"
                title="Configuration is incomplete or inconsistent"
                message={problems.join(" ")}
                onClose={() => setProblems([])}
            />
        </>
    );
};

export default ConfigurationPage;
