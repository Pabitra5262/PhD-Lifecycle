import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { cn, toneSoft } from "./tones";

/* Ported from hims-ui-new src/components/ui/Feedback/Alert.tsx (not in @mfe/components). */

export type AlertTone = "success" | "warning" | "danger" | "info";

const ICON = { success: CircleCheck, warning: TriangleAlert, danger: CircleAlert, info: Info } as const;

export interface AlertProps {
    tone?: AlertTone;
    title?: ReactNode;
    children?: ReactNode;
    onDismiss?: () => void;
    actions?: ReactNode;
    className?: string;
}

export function Alert({ tone = "info", title, children, onDismiss, actions, className }: AlertProps) {
    const Icon = ICON[tone];
    return (
        <div role={tone === "danger" || tone === "warning" ? "alert" : "status"} className={cn("flex gap-3 rounded-lg border p-4", toneSoft[tone], className)}>
            <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
                {title && <p className="text-sm font-semibold">{title}</p>}
                {children && <div className={cn("text-sm text-foreground", title ? "mt-1" : "")}>{children}</div>}
                {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
            </div>
            {onDismiss && (
                <button type="button" onClick={onDismiss} aria-label="Dismiss alert" className="-m-1 h-fit rounded-md p-1 opacity-80 hover:opacity-100">
                    <X size={16} />
                </button>
            )}
        </div>
    );
}

export default Alert;
