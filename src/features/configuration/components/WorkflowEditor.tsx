import { ArrowDown, ArrowUp } from "lucide-react";
import { Button, Card, Checkbox, Input, Stepper } from "@mfe/components";
import type { WorkflowStage } from "../../shared";

interface WorkflowEditorProps {
    stages: WorkflowStage[];
    onChange: (stages: WorkflowStage[]) => void;
}

/** SRS 1.7 — workflow stages and role mapping (Accounts → FO → Competent Authority), SLA per stage. */
export const WorkflowEditor = ({ stages, onChange }: WorkflowEditorProps) => {
    const sorted = [...stages].sort((a, b) => a.order - b.order);
    const set = (id: string, patch: Partial<WorkflowStage>) => onChange(stages.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    const move = (i: number, dir: -1 | 1) => {
        const next = [...sorted];
        const j = i + dir;
        if (j < 1 || j >= next.length) return; // Submission stays first.
        [next[i], next[j]] = [next[j], next[i]];
        onChange(next.map((s, k) => ({ ...s, order: k + 1 })));
    };

    return (
        <div className="flex flex-col gap-4">
            <Card title="Approval Chain">
                <Stepper steps={sorted.map((s) => ({ id: s.id, label: s.name, description: s.role + (s.optional ? " (if required)" : "") }))} current={sorted.length} />
            </Card>
            <Card title="Stages">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                                <th className="py-2 pr-2 font-medium">#</th>
                                <th className="py-2 pr-2 font-medium">Stage</th>
                                <th className="py-2 pr-2 font-medium">Role</th>
                                <th className="py-2 pr-2 font-medium">Actions</th>
                                <th className="py-2 pr-2 font-medium">SLA (days)</th>
                                <th className="py-2 pr-2 font-medium">Optional</th>
                                <th className="py-2" aria-label="Reorder" />
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((s, i) => (
                                <tr key={s.id} className="border-b border-border last:border-0 align-middle">
                                    <td className="py-2 pr-2 tabular-nums">{s.order}</td>
                                    <td className="py-2 pr-2"><Input aria-label="Stage name" value={s.name} onChange={(e) => set(s.id, { name: e.target.value })} wrapperClassName="w-36" /></td>
                                    <td className="py-2 pr-2">{s.role}</td>
                                    <td className="py-2 pr-2">{s.actions.join(" / ")}</td>
                                    <td className="py-2 pr-2"><Input aria-label="SLA days" type="number" min={0} value={String(s.slaDays)} onChange={(e) => set(s.id, { slaDays: Number(e.target.value) })} wrapperClassName="w-20" disabled={i === 0} /></td>
                                    <td className="py-2 pr-2"><Checkbox label="If required" checked={s.optional} disabled={i === 0} onChange={(e) => set(s.id, { optional: e.target.checked })} /></td>
                                    <td className="py-2 text-right whitespace-nowrap">
                                        <Button variant="ghost" size="sm" aria-label="Move up" icon={<ArrowUp size={14} />} disabled={i <= 1} onClick={() => move(i, -1)} />
                                        <Button variant="ghost" size="sm" aria-label="Move down" icon={<ArrowDown size={14} />} disabled={i === 0 || i === sorted.length - 1} onClick={() => move(i, 1)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default WorkflowEditor;
