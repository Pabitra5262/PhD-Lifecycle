import { cn } from "./tones";

/* Ported from hims-ui-new src/components/ui/Status/ActivityTimeline.tsx (not in @mfe/components). */

export interface ActivityEvent {
    id: string;
    /** What happened, e.g. "Approved the request". */
    action: string;
    actor: string;
    /** Second line under the actor, e.g. the stage / role. */
    meta?: string;
    at: string;
    note?: string;
    tone?: "neutral" | "success" | "warning" | "danger";
}

const DOT = { neutral: "bg-muted-foreground", success: "bg-success", warning: "bg-warning", danger: "bg-danger" };

/** Newest-first list of who did what and when. */
export function ActivityTimeline({ events, title, className }: { events: ActivityEvent[]; title?: string; className?: string }) {
    const sorted = [...events].reverse();
    return (
        <section aria-label={title ?? "Activity"} className={className}>
            {title && <h4 className="mb-3 text-sm font-semibold text-foreground">{title}</h4>}
            {sorted.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
                <ol className="relative ml-1.5 border-l border-border">
                    {sorted.map((e) => (
                        <li key={e.id} className="relative pb-4 pl-5 last:pb-0">
                            <span aria-hidden className={cn("absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-background", DOT[e.tone ?? "neutral"])} />
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                                <p className="text-sm text-foreground">
                                    <span className="font-medium">{e.actor}</span> — {e.action}
                                </p>
                                <time dateTime={e.at} className="text-xs text-muted-foreground">{e.at}</time>
                            </div>
                            {e.meta && <p className="text-xs text-muted-foreground">{e.meta}</p>}
                            {e.note && <p className="mt-0.5 text-sm text-muted-foreground">“{e.note}”</p>}
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}

export default ActivityTimeline;
