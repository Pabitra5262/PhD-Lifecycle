import type { Movement } from "../types/payfix.types";
import { ActivityTimeline, type ActivityEvent } from "@mfe/components";

const toneOf = (action: string): ActivityEvent["tone"] => {
    if (/reject/i.test(action)) return "danger";
    if (/return/i.test(action)) return "warning";
    if (/verified|approved|sanctioned|forwarded/i.test(action)) return "success";
    return "neutral";
};

/** Movement history: every action on the proposal, newest first (audit trail view). */
export const MovementHistory = ({ items }: { items: Movement[] }) => (
    <ActivityTimeline
        events={items.map((m, i) => ({
            id: `${m.date}-${i}`,
            action: m.action,
            actor: m.by,
            meta: m.role,
            at: m.date,
            note: m.remarks && m.remarks !== "—" ? m.remarks : undefined,
            tone: toneOf(m.action),
        }))}
    />
);

export default MovementHistory;
