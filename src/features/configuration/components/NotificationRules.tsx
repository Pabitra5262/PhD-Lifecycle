import { Card, Checkbox, Input } from "@mfe/components";
import type { NotificationRule } from "../../shared";

const CHANNELS = ["In-app", "Email", "SMS"];

/** SRS 1.7 — notification triggers and recipients for status changes. */
export const NotificationRules = ({ rules, onChange }: { rules: NotificationRule[]; onChange: (rules: NotificationRule[]) => void }) => {
    const set = (id: string, patch: Partial<NotificationRule>) => onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    return (
        <Card title="Notification Triggers">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                    <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                            <th className="py-2 pr-2 font-medium">Enabled</th>
                            <th className="py-2 pr-2 font-medium">Trigger</th>
                            <th className="py-2 pr-2 font-medium">Recipients</th>
                            <th className="py-2 font-medium">Channels</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rules.map((r) => (
                            <tr key={r.id} className={`border-b border-border last:border-0 ${r.enabled ? "" : "opacity-60"}`}>
                                <td className="py-2 pr-2"><Checkbox label="On" checked={r.enabled} onChange={(e) => set(r.id, { enabled: e.target.checked })} /></td>
                                <td className="py-2 pr-2 font-medium">{r.trigger}</td>
                                <td className="py-2 pr-2"><Input aria-label={`Recipients for ${r.trigger}`} value={r.recipients} onChange={(e) => set(r.id, { recipients: e.target.value })} wrapperClassName="w-72" /></td>
                                <td className="py-2">
                                    <div className="flex flex-wrap gap-3">
                                        {CHANNELS.map((c) => (
                                            <Checkbox
                                                key={c}
                                                label={c}
                                                checked={r.channels.includes(c)}
                                                onChange={() => set(r.id, { channels: r.channels.includes(c) ? r.channels.filter((x) => x !== c) : [...r.channels, c] })}
                                            />
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default NotificationRules;
