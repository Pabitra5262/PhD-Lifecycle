import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { Button, Card, Input, Select } from "@mfe/components";
import { CADRES, payAt, rupees, type PayLevel } from "../../shared";

interface PayMatrixEditorProps {
    levels: PayLevel[];
    onChange: (levels: PayLevel[]) => void;
}

/** SRS 1.7 — pay level / cell masters used by the rule engine (cell n = entry pay +3 % per cell, rounded to ₹100). */
export const PayMatrixEditor = ({ levels, onChange }: PayMatrixEditorProps) => {
    const [preview, setPreview] = useState(levels[0]?.level ?? "");
    const set = (i: number, patch: Partial<PayLevel>) => onChange(levels.map((l, j) => (j === i ? { ...l, ...patch } : l)));
    const shown = levels.find((l) => l.level === preview);

    return (
        <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
            <Card title="Pay Levels" actions={<Button size="sm" icon={<Plus size={14} />} label="Add Level" onClick={() => onChange([...levels, { level: `AL-${levels.length + 10}`, entryPay: 0, cells: 1, cadre: CADRES[1] }])} />}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                                <th className="py-2 pr-2 font-medium">Level</th>
                                <th className="py-2 pr-2 font-medium">Cadre</th>
                                <th className="py-2 pr-2 font-medium">Entry Pay (₹)</th>
                                <th className="py-2 pr-2 font-medium">Cells</th>
                                <th className="py-2 pr-2 text-right font-medium">Max (last cell)</th>
                                <th className="py-2" aria-label="Actions" />
                            </tr>
                        </thead>
                        <tbody>
                            {levels.map((l, i) => (
                                <tr key={i} className="border-b border-border last:border-0 align-top">
                                    <td className="py-2 pr-2"><Input aria-label="Level" value={l.level} onChange={(e) => set(i, { level: e.target.value })} wrapperClassName="w-28" /></td>
                                    <td className="py-2 pr-2"><Select options={CADRES.map((c) => ({ value: c, label: c }))} value={l.cadre} onChange={(v) => set(i, { cadre: String(v) })} wrapperClassName="w-52" /></td>
                                    <td className="py-2 pr-2"><Input aria-label="Entry pay" type="number" min={0} value={String(l.entryPay)} onChange={(e) => set(i, { entryPay: Number(e.target.value) })} wrapperClassName="w-32" /></td>
                                    <td className="py-2 pr-2"><Input aria-label="Cells" type="number" min={1} value={String(l.cells)} onChange={(e) => set(i, { cells: Number(e.target.value) })} wrapperClassName="w-20" /></td>
                                    <td className="py-2 pr-2 pt-4 text-right tabular-nums">{rupees(payAt(l, l.cells))}</td>
                                    <td className="py-2 pt-3 text-right">
                                        <Button variant="ghost" size="sm" aria-label={`Remove ${l.level}`} icon={<Trash size={14} />} onClick={() => onChange(levels.filter((_, j) => j !== i))} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <Card title="Cell Values">
                <Select label="Pay Level" options={levels.map((l) => ({ value: l.level, label: l.level }))} value={preview} onChange={(v) => setPreview(String(v))} />
                {shown && (
                    <ol className="mt-4 grid max-h-80 grid-cols-2 gap-x-6 gap-y-1 overflow-y-auto text-sm sm:grid-cols-3">
                        {Array.from({ length: Math.min(shown.cells, 40) }, (_, c) => (
                            <li key={c} className="flex justify-between gap-2 border-b border-border py-1">
                                <span className="text-muted-foreground">Cell {c + 1}</span>
                                <span className="tabular-nums">{payAt(shown, c + 1).toLocaleString("en-IN")}</span>
                            </li>
                        ))}
                    </ol>
                )}
            </Card>
        </div>
    );
};

export default PayMatrixEditor;
