import { Badge, Card } from "@mfe/components";
import type { WorkflowStage } from "../../shared";

/** SRS 1.4 Workflow Summary (Step · Actor · Action), driven by the configured stages. */
export const WorkflowSummaryTable = ({ stages, currentRole }: { stages: WorkflowStage[]; currentRole?: string }) => (
    <Card title="Workflow Summary">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2 pr-3 font-medium">Step</th>
                        <th className="py-2 pr-3 font-medium">Actor</th>
                        <th className="py-2 pr-3 font-medium">Actions</th>
                        <th className="py-2 text-right font-medium">SLA</th>
                    </tr>
                </thead>
                <tbody>
                    {[...stages].sort((a, b) => a.order - b.order).map((s) => (
                        <tr key={s.id} className={`border-b border-border last:border-0 ${s.role === currentRole ? "bg-primary/5 font-medium" : ""}`}>
                            <td className="py-2 pr-3 tabular-nums">{s.order}</td>
                            <td className="py-2 pr-3">
                                {s.role}
                                {s.optional && <span className="ml-1 text-xs text-muted-foreground">(if required)</span>}
                                {s.role === currentRole && <Badge variant="info" size="sm" className="ml-2">You</Badge>}
                            </td>
                            <td className="py-2 pr-3">{s.actions.join(" / ")}</td>
                            <td className="py-2 text-right tabular-nums">{s.slaDays ? `${s.slaDays} days` : "—"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
);

export default WorkflowSummaryTable;
