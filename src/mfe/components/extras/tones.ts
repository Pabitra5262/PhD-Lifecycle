/* Semantic tone → class map (ported from hims-ui-new src/lib/tones.ts), using theme tokens hplus_react also has. */
export type Tone = "neutral" | "primary" | "secondary" | "success" | "warning" | "danger" | "info";

export const toneSoft: Record<Tone, string> = {
    neutral: "bg-muted text-muted-foreground border-border",
    primary: "bg-primary/10 text-primary border-primary/25",
    secondary: "bg-secondary/10 text-secondary border-secondary/30",
    success: "bg-success/10 text-success border-success/30",
    warning: "bg-warning/10 text-warning border-warning/40",
    danger: "bg-danger/10 text-danger border-danger/30",
    info: "bg-info/10 text-info border-info/30",
};

export const toneBar: Record<Tone, string> = {
    neutral: "bg-muted-foreground",
    primary: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
};

export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");
