import type { ReactNode } from "react";

interface PanelCardProps {
    title: ReactNode;
    /** Shown at the right end of the title row. */
    actions?: ReactNode;
    children: ReactNode;
    /** Defaults to "mb-4". */
    className?: string;
}

/**
 * Card with a title strip that can also hold a DataTable.
 *
 * Drawn with utility classes, not the `ui-card` class: hplus_react and this project both hide a `ui-card`'s header and
 * strip the table's border when a DataTable sits inside it. Cards inside lose their shadow so they read as sections.
 */
export const PanelCard = ({ title, actions, children, className = "mb-4" }: PanelCardProps) => (
    <section className={`rounded-xl border border-border bg-[var(--card-bg,#ffffff)] shadow-sm ${className}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {actions}
        </div>
        <div className="p-4 [&_.ui-card]:shadow-none">{children}</div>
    </section>
);

export default PanelCard;
