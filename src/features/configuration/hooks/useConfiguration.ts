import { useCallback, useState } from "react";
import { useCurrentUser, usePayFix, type PayFixConfig } from "../../shared";

/** E1: incomplete or inconsistent configuration. */
export const validateConfig = (c: PayFixConfig): string[] => {
    const problems: string[] = [];
    for (const type of ["Pay Fixation", "Pay Protection"] as const) {
        if (!c.documents.some((d) => d.mandatory && d.types.includes(type))) problems.push(`${type} has no mandatory document in the checklist.`);
    }
    if (c.documents.some((d) => !d.name.trim())) problems.push("Every document needs a name.");
    if (c.documents.some((d) => d.types.length === 0)) problems.push("Every document must apply to at least one proposal type.");
    const names = c.documents.map((d) => d.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) problems.push("Document names must be unique.");

    const required = c.workflow.filter((w) => !w.optional);
    if (required.length < 2) problems.push("The workflow needs a submission stage and at least one approval stage.");
    const orders = c.workflow.map((w) => w.order);
    if (new Set(orders).size !== orders.length) problems.push("Workflow stage order numbers must be unique.");
    if (c.workflow.some((w) => w.actions.length === 0)) problems.push("Every workflow stage needs at least one action.");
    if (c.workflow.some((w) => w.slaDays < 0)) problems.push("SLA days cannot be negative.");

    if (c.payLevels.some((l) => l.entryPay <= 0 || l.cells < 1)) problems.push("Each pay level needs an entry pay above 0 and at least 1 cell.");
    const levels = c.payLevels.map((l) => l.level);
    if (new Set(levels).size !== levels.length) problems.push("Pay level names must be unique.");
    return problems;
};

/** SRS 1.7 — edit a working copy of the configuration; Save validates, applies to new proposals and is audited. */
export const useConfiguration = () => {
    const { data, update, addLog } = usePayFix();
    const user = useCurrentUser();
    const [draft, setDraft] = useState<PayFixConfig>(() => structuredClone(data.config));

    const dirty = JSON.stringify(draft) !== JSON.stringify(data.config);

    const change = useCallback((fn: (d: PayFixConfig) => void) => {
        setDraft((prev) => {
            const next = structuredClone(prev);
            fn(next);
            return next;
        });
    }, []);

    const save = useCallback((): { ok: boolean; problems: string[] } => {
        if (user.roleKey !== "admin") return { ok: false, problems: ["You are not authorised to change the configuration."] };
        const problems = validateConfig(draft);
        if (problems.length) return { ok: false, problems };
        update((d) => {
            d.config = structuredClone(draft);
        });
        addLog({ user: user.name, role: user.role, action: "Updated Pay Fixation configuration (rules, documents, workflow, notifications)", ref: "CONFIG" });
        return { ok: true, problems: [] };
    }, [draft, update, addLog, user]);

    const discard = useCallback(() => setDraft(structuredClone(data.config)), [data.config]);

    return { draft, change, save, discard, dirty, audit: data.audit };
};
