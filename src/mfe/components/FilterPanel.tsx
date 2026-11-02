import type { ReactNode } from "react";
import { Filter, RotateCcw } from "lucide-react";
import { FilterPanel as WireFilterPanel } from "@/shared/components/ui/Table/DataTable/FilterPanel";
import { Button } from "./Button";

/* hplus_react `@mfe/components` FilterPanel API (Filter / Reset buttons built in), drawn with the wireframe FilterPanel. */

export interface FilterPanelProps {
    /** Filter fields (Select, Input, DatePicker …). */
    children: ReactNode;
    /** Filter button / Enter in a field. */
    onSubmit: () => void;
    /** Reset button; without it only the Filter button shows. */
    onReset?: () => void;
    /** Own buttons instead of Filter / Reset. */
    actions?: ReactNode;
    title?: string;
    appliedCount?: number;
    status?: string;
    hidden?: boolean;
    onHiddenChange?: (hidden: boolean) => void;
    floatingButton?: boolean;
    className?: string;
}

export const FilterPanel = ({ onSubmit, onReset, actions, ...rest }: Readonly<FilterPanelProps>) => (
    <WireFilterPanel
        {...rest}
        onSubmit={onSubmit}
        actions={
            actions ?? (
                <>
                    {onReset && <Button type="button" variant="outline" icon={<RotateCcw size={16} />} label="Reset" onClick={onReset} />}
                    <Button type="submit" icon={<Filter size={16} />} label="Filter" />
                </>
            )
        }
    />
);

export default FilterPanel;
