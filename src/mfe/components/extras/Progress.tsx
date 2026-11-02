import { cn, toneBar, type Tone } from "./tones";

/* Ported from hims-ui-new src/components/ui/Status/Status.tsx (Progress; not in @mfe/components). `count` shows a number instead of %. */

export interface ProgressProps {
    value: number;
    max?: number;
    tone?: Tone;
    label?: string;
    showValue?: boolean;
    /** Show this number on the right instead of the percentage (e.g. a count of proposals). */
    count?: number;
    size?: "sm" | "md";
    className?: string;
}

export function Progress({ value, max = 100, tone = "primary", label, showValue, count, size = "md", className }: ProgressProps) {
    const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
    return (
        <div className={className}>
            {(label || showValue || count !== undefined) && (
                <div className="mb-1 flex justify-between text-sm text-foreground">
                    <span>{label}</span>
                    {count !== undefined ? <span className="font-semibold tabular-nums">{count}</span> : showValue && <span className="tabular-nums">{Math.round(pct)}%</span>}
                </div>
            )}
            <div
                role="progressbar"
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={label ?? "Progress"}
                className={cn("w-full overflow-hidden rounded-full bg-muted", size === "sm" ? "h-1.5" : "h-2.5")}
            >
                <div className={cn("h-full rounded-full transition-[width] duration-300", toneBar[tone])} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export default Progress;
