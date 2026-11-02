import { DataTable, DialogModal, Modal, type TableColumnDef } from "@mfe/components";
import { ScrutinyDocumentViewer } from "./ScrutinyDocumentViewer";
import { scrutinyPolicy } from "../form-config/scrutinyConfig";
import type { ScrutinyEvent } from "../types";
import type { ScrutinyViewProps } from "../types/scrutinyView.types";

const historyColumns: TableColumnDef<ScrutinyEvent>[] = [
    { accessorKey: "date", header: "Date / Time", Cell: ({ row }) => new Date(row.original.date).toLocaleString("en-IN") },
    { accessorKey: "user", header: "User" }, { accessorKey: "role", header: "Role" },
    { accessorKey: "action", header: "Action" }, { accessorKey: "decision", header: "Decision" },
    { accessorKey: "from", header: "From" }, { accessorKey: "to", header: "To" }, { accessorKey: "remarks", header: "Remarks" },
    { accessorKey: "netVerification", header: "NET/URET Verification" },
    { id: "documents", header: "Document Verification", accessorFn: (row) => Object.entries(row.documents ?? {}).map(([key, value]) => `${key}: ${value}`).join("; ") },
];

export function ApplicationScrutinyDialogs({ controller }: ScrutinyViewProps) {
    const { pending, closePending, confirm, document, setDocument, historyOpen, setHistoryOpen, selected } = controller;
    return <>
        <DialogModal isOpen={pending !== null} title={pending?.action === "Return" ? "Return Application for Clarification" : "Forward Application"} message={pending?.action === "Return" ? "Return " + pending.reference + " with the recorded remarks and a " + scrutinyPolicy.correctionDays + "-day correction period? The candidate will receive an in-app notice." : "Record the " + (pending?.form.decision ?? "") + " recommendation for " + (pending?.reference ?? "") + " and route it to the next configured stage?"} onClose={() => closePending()} onConfirm={confirm} />
        <Modal isOpen={document !== null} title={document?.name} size="xl" onClose={() => setDocument(null)}>{document && <ScrutinyDocumentViewer key={document.name + ":" + document.lastModified} file={document} />}</Modal>
        <Modal isOpen={historyOpen} title="Scrutiny History" size="full" onClose={() => setHistoryOpen(false)}><DataTable data={selected?.scrutinyHistory ?? []} columns={historyColumns} getRowId={(row) => row.id} caption="Scrutiny history" renderPreview={null} /></Modal>
    </>;
}
