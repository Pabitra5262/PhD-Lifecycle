import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn, toneSoft, type Tone } from "./tones";

/* Ported from hims-ui-new src/components/ui/Card/SummaryTile.tsx (not in @mfe/components). */

export interface SummaryTileProps {
    icon: LucideIcon;
    label: string;
    value: ReactNode;
    tone?: Tone;
    /** Makes the tile a button (e.g. to switch a tab). */
    onClick?: () => void;
    /** Marks the tile as the current selection when it acts as a filter. */
    selected?: boolean;
}

/** Compact stat tile. */
export function SummaryTile({ icon: Icon, label, value, tone = "primary", onClick, selected }: SummaryTileProps) {
    const body = (
        <>
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md border", toneSoft[tone])} aria-hidden>
                <Icon size={18} />
            </span>
            <span className="min-w-0 text-left">
                <span className="block text-xl font-semibold leading-tight tabular-nums text-foreground">{value}</span>
                <span className="block truncate text-xs text-muted-foreground">{label}</span>
            </span>
        </>
    );
    const base = "ui-card flex min-w-36 items-center gap-3 px-4 py-3";
    if (!onClick) return <div className={base}>{body}</div>;
    return (
        <button type="button" onClick={onClick} aria-pressed={selected} className={cn(base, "hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary", selected && "ring-1 ring-primary")}>
            {body}
        </button>
    );
}

export default SummaryTile;
