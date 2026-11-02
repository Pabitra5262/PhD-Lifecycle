import { ArrowDownRight, ArrowUpRight, ChevronRight, Minus, type LucideIcon } from "lucide-react";
import { cn, toneSoft, type Tone } from "./tones";

/* Ported from hims-ui-new src/components/ui/Card/KpiCard.tsx (not in @mfe/components). Adds `note` and `onClick` (drill-down). */

export interface KpiCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    /** Small line under the label, e.g. "At Accounts / Establishment". */
    note?: string;
    /** Percentage change vs previous period. */
    trend?: number;
    /** Is an increase good? (e.g. false for "Pending requests"). */
    upIsGood?: boolean;
    trendLabel?: string;
    tone?: Tone;
    /** Makes the card a button that opens the matching list. */
    onClick?: () => void;
}

export function KpiCard({ label, value, icon: Icon, note, trend, upIsGood = true, trendLabel = "vs last month", tone = "primary", onClick }: KpiCardProps) {
    const direction = trend === undefined || trend === 0 ? "flat" : trend > 0 ? "up" : "down";
    const good = direction === "flat" ? null : (direction === "up") === upIsGood;
    const trendTone: Tone = good === null ? "neutral" : good ? "success" : "danger";
    const TrendIcon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

    const body = (
        <>
            <div className="flex items-start justify-between gap-3">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-md border", toneSoft[tone])} aria-hidden>
                    <Icon size={18} />
                </span>
                {trend !== undefined && (
                    <span className={cn("inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums", toneSoft[trendTone])}>
                        <TrendIcon size={12} />
                        {Math.abs(trend).toFixed(1)}%<span className="sr-only"> {trendLabel}</span>
                    </span>
                )}
                {onClick && trend === undefined && <ChevronRight size={16} className="text-muted-foreground" aria-hidden />}
            </div>
            <p className="mt-4 text-2xl font-semibold leading-tight tabular-nums text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            {note && <p className="mt-0.5 truncate text-xs text-muted-foreground">{note}</p>}
        </>
    );

    const base = "ui-card flex h-full w-full flex-col p-4 text-left";
    return onClick ? (
        <button type="button" onClick={onClick} className={cn(base, "cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary")}>
            {body}
        </button>
    ) : (
        <div className={base}>{body}</div>
    );
}

export default KpiCard;
