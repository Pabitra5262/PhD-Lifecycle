import { useSyncExternalStore } from "react";
import { createInitialData } from "../data/payfixData";
import type { AuditEntry, PayFixData } from "../types/payfix.types";
import { ROLES, roleKeyOf, workflowRoleOf, type RoleKey } from "../roles";

/*
 * In-memory Pay Fixation state shared by every page. Nothing is sent to a server.
 * A module-level store (no Provider), so the features folder works as-is inside any hplus_react module.
 * Replace with services + API calls when the backend exists.
 */

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: Listener) => {
    listeners.add(l);
    return () => listeners.delete(l);
};

let data: PayFixData = createInitialData();

const stamp = () => new Date().toISOString().slice(0, 16).replace("T", " ");

/** Change the data: the callback receives a copy it may edit in place. */
const update = (change: (draft: PayFixData) => void) => {
    const draft = structuredClone(data);
    change(draft);
    data = draft;
    emit();
};

/** Adds an entry at the top of the audit trail. */
const addLog = (entry: Omit<AuditEntry, "id" | "dt">) =>
    update((d) => {
        d.audit.unshift({ id: `AUD-${Date.now()}-${d.audit.length}`, dt: stamp(), ...entry });
    });

/** Adds an unread notification. */
const notify = (msg: string) =>
    update((d) => {
        d.notifications.unshift({ id: `N-${Date.now()}-${d.notifications.length}`, msg, date: stamp().slice(0, 10), read: false });
    });

const reset = () => {
    data = createInitialData();
    emit();
};

const actions = { update, addLog, notify, reset };

export const usePayFix = () => {
    const snapshot = useSyncExternalStore(subscribe, () => data);
    return { data: snapshot, ...actions };
};

/* ---- Active role --------------------------------------------------------------------------------
 * The wireframe header sets it (setActiveRole). Inside hplus_react nothing sets it, so the pages fall back to
 * the first role and show their own demo role switcher (see DemoRoleSwitcher).
 */

let role: string = ROLES[0].label;
let hostControlsRole = false;

/** Called by a host shell that owns the role (e.g. the wireframe header). */
export const setActiveRole = (label: string, fromHost = false) => {
    if (fromHost) hostControlsRole = true;
    if (label === role) return;
    role = label;
    emit();
};

export interface RoleValue {
    /** Name of the role, e.g. "Finance Officer (FO)". */
    role: string;
    workflowRole: string;
    roleKey: RoleKey;
    setRole: (role: string) => void;
    /** True when a host shell owns the role switcher (pages then hide their own). */
    hostControlsRole: boolean;
}

export const useRole = (): RoleValue => {
    const current = useSyncExternalStore(subscribe, () => role);
    return { role: current, workflowRole: workflowRoleOf(current), roleKey: roleKeyOf(current), setRole: (r) => setActiveRole(r), hostControlsRole };
};
