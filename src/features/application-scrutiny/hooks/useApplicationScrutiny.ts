import { useState } from "react";
import { showToast } from "@mfe/components";
import { canScrutinize, initialReview, readScrutinyApplications, recordScrutinyDecision, assignedAdvertisements } from "../service/scrutinyService";
import { scrutinyDocuments } from "../form-config/scrutinyDocuments";
import { validateScrutiny } from "../validation/scrutinyValidation";
import type { ScrutinyActor, ScrutinyForm, PendingScrutiny } from "../types";

export function useApplicationScrutiny(actor: ScrutinyActor, demo = false, combinedCommittee = false) {
    const [rows, setRows] = useState(() => readScrutinyApplications(actor, demo));
    const [advertisementId, setAdvertisementId] = useState("");
    const [applicationId, setApplicationId] = useState("");
    const [reviews, setReviews] = useState<Record<string, ScrutinyForm>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [pending, setPending] = useState<PendingScrutiny | null>(null);
    const [document, setDocument] = useState<File | null>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const assigned = assignedAdvertisements(actor);
    const advertisements = [...new Map([...assigned, ...rows.map((row) => row.advertisement)].map((item) => [item.id, item])).values()];
    const matches = rows.filter((row) => row.advertisement.id === advertisementId);
    const selected = matches.find((row) => row.id === applicationId) ?? null;
    const actorFor = (application: { pendingWith?: string }): ScrutinyActor => combinedCommittee && application.pendingWith === "Scrutiny / Selection / Research Committee" ? { ...actor, role: "Scrutiny / Selection / Research Committee" } : actor;
    const reviewActor = selected ? actorFor(selected) : actor;
    const editable = selected !== null && canScrutinize(selected, reviewActor);
    const form = selected ? reviews[selected.id] ?? initialReview(selected, reviewActor) : { netVerification: "", documents: {}, remarks: "", decision: "", revision: 0 } as ScrutinyForm;
    const documents = selected ? scrutinyDocuments(selected) : [];
    const selectAdvertisement = (id: string) => {
        const latest = readScrutinyApplications(actor);
        const applications = latest.filter((row) => row.advertisement.id === id);
        const first = applications.find((row) => canScrutinize(row, actorFor(row))) ?? applications[0];
        setRows(latest); setAdvertisementId(id); setApplicationId(first?.id ?? ""); setReviews({}); setErrors({});
    };
    const updateReview = (patch: Partial<ScrutinyForm>) => {
        if (!selected) return;
        setReviews((current) => ({ ...current, [selected.id]: { ...(current[selected.id] ?? initialReview(selected, reviewActor)), ...patch } }));
        setErrors({});
    };
    const prepare = (action: "Forward" | "Return") => {
        if (!advertisementId) { setErrors({ advertisement: "Select a valid advertisement" }); return; }
        if (!selected) { setErrors({ application: "No submitted application is available for this advertisement" }); return; }
        const next = validateScrutiny(selected, reviewActor, form, action); setErrors(next);
        if (!Object.keys(next).length) setPending({ id: selected.id, reference: selected.reference, action, form: { ...form, documents: { ...form.documents } } });
    };
    const confirm = () => {
        if (!pending) return;
        try {
            const result = recordScrutinyDecision(pending.id, reviewActor, pending.form, pending.action);
            if (!result.ok) { setErrors(result.errors); setPending(null); return; }
            setRows(readScrutinyApplications(actor));
            setReviews((current) => { const next = { ...current }; delete next[pending.id]; return next; });
            setErrors({}); setPending(null);
            showToast.success(pending.action === "Return" ? "Application returned for correction" : "Application forwarded", "Reference: " + result.application.reference);
        } catch (error) { setPending(null); showToast.error("Cannot record scrutiny", error instanceof Error ? error.message : "Action failed"); }
    };
    const index = matches.findIndex((row) => row.id === applicationId);
    const remarksRequired = ["Deficient", "Ineligible"].includes(form.decision) || form.netVerification === "Deficient" || Object.values(form.documents).includes("Deficient");
    return { actor: reviewActor, rows, advertisementId, matches, selected, editable, form, documents, errors, pending, document, setDocument, historyOpen, setHistoryOpen, advertisements, selectAdvertisement, updateReview, prepare, confirm, index, remarksRequired, selectApplication: (id: string) => { setApplicationId(id); setErrors({}); }, closePending: () => setPending(null) };
}
