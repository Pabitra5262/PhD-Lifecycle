import type { ReactNode } from "react";
import { Tabs, type TabItem } from "@mfe/components";

interface TabsCardProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (key: string) => void;
    /** Accessible name for the tab list. */
    label: string;
    /** Shown at the right end of the tab row. */
    actions?: ReactNode;
    /** The active tab's content. */
    children: ReactNode;
    /** Defaults to "mb-4". */
    className?: string;
}

/**
 * Tabs always sit inside a card: the tab row is the card's header strip and the active tab's content is its body.
 *
 * The frame is drawn with utility classes, not the `ui-card` class: hplus_react and this project both strip a
 * DataTable's own border when it sits inside `.ui-card` (`.ui-card .dt-root { border: 0 }`), which cut the table's
 * edges here. Cards inside lose their shadow so they read as sections of this card.
 */
export const TabsCard = ({ tabs, activeTab, onChange, label, actions, children, className = "mb-4" }: TabsCardProps) => (
    <section className={`rounded-xl border border-border bg-[var(--card-bg,#ffffff)] shadow-sm ${className}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <Tabs label={label} tabs={tabs} activeTab={activeTab} onChange={onChange} />
            {actions}
        </div>
        <div className="p-4 [&_.ui-card]:shadow-none" role="tabpanel" aria-label={tabs.find((t) => t.key === activeTab)?.label}>
            {children}
        </div>
    </section>
);

export default TabsCard;
