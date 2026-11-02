import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* hplus_react `useTableFilters` (packages/components/ui/FilterPanel/useTableFilters.ts): same name, arguments and return. */

type FilterValues = Record<string, unknown>;

/** A filter counts as applied when it has a value other than its starting one ('' / null / [] mean "All"). */
const isApplied = (value: unknown, initial: unknown) => {
    if (value === undefined || value === null || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== initial;
};

const readHidden = (key: string) => {
    try {
        return localStorage.getItem(key) === "true";
    } catch {
        return false;
    }
};

const writeHidden = (key: string, hidden: boolean) => {
    try {
        localStorage.setItem(key, String(hidden));
    } catch {
        /* storage blocked: the panel just opens shown next time */
    }
};

/**
 * Fields change `draft` only; the Filter button copies it to `applied` (and calls `onApply`, e.g. to call the API).
 * Filter rows with `filters.applied`. Spread `panelProps` on FilterPanel.
 */
export function useTableFilters<T extends FilterValues>(initialValues: T, options: { onApply?: (values: T) => void; storageKey?: string } = {}) {
    const pathname = globalThis.location?.pathname ?? "";
    const [initial] = useState(initialValues);
    const onApplyRef = useRef(options.onApply);
    useEffect(() => {
        onApplyRef.current = options.onApply;
    }, [options.onApply]);
    const hiddenKey = `hims.filters.hidden.${options.storageKey ?? pathname}`;

    const [draft, setDraft] = useState<T>(initial);
    const [applied, setApplied] = useState<T>(initial);
    const [hidden, setHiddenState] = useState(() => readHidden(hiddenKey));

    const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => setDraft((prev) => ({ ...prev, [key]: value })), []);

    const apply = useCallback(() => {
        setApplied(draft);
        onApplyRef.current?.(draft);
    }, [draft]);

    const reset = useCallback(() => {
        setDraft(initial);
        setApplied(initial);
        onApplyRef.current?.(initial);
    }, [initial]);

    const setHidden = useCallback(
        (value: boolean) => {
            setHiddenState(value);
            writeHidden(hiddenKey, value);
        },
        [hiddenKey],
    );

    const appliedCount = useMemo(() => Object.keys(applied).filter((key) => isApplied(applied[key], initial[key])).length, [applied, initial]);

    return {
        draft,
        applied,
        appliedCount,
        set,
        apply,
        reset,
        hidden,
        setHidden,
        /** Spread on FilterPanel: Filter / Reset, count, hide / show. */
        panelProps: { onSubmit: apply, onReset: reset, appliedCount, hidden, onHiddenChange: setHidden, floatingButton: false },
        /** Pass to DataTable `filterToggle`: its filter icon shows / hides the panel. */
        tableToggle: { hidden, onToggle: () => setHidden(!hidden), appliedCount },
    };
}

export default useTableFilters;
