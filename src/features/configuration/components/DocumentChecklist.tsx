import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge, Button, Checkbox, DataTable, Input, Modal, ModalFooter, type TableColumnDef } from "@mfe/components";
import { EVENTS, PROPOSAL_TYPES, type DocumentRequirement } from "../../shared";

interface DocumentChecklistProps {
    documents: DocumentRequirement[];
    onSave: (doc: DocumentRequirement) => void;
    onDelete: (id: string) => void;
}

const columns: TableColumnDef<DocumentRequirement>[] = [
    { accessorKey: "name", header: "Document", Cell: ({ row }) => <strong>{row.original.name}</strong> },
    { id: "types", header: "Proposal Types", accessorFn: (r) => r.types.join(", ") },
    { id: "events", header: "Events", accessorFn: (r) => (r.events.length ? r.events.join(", ") : "All events") },
    {
        accessorKey: "mandatory",
        header: "Requirement",
        Cell: ({ row }) => (row.original.mandatory ? <Badge variant="danger" size="sm">Mandatory</Badge> : <Badge variant="secondary" size="sm">Optional</Badge>),
    },
];

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** SRS 1.7 — proposal types and their mandatory document checklists. */
export const DocumentChecklist = ({ documents, onSave, onDelete }: DocumentChecklistProps) => {
    const [editing, setEditing] = useState<DocumentRequirement | null>(null);
    const [error, setError] = useState<string>();

    const open = (d?: DocumentRequirement) => {
        setError(undefined);
        setEditing(d ? structuredClone(d) : { id: `DOC-${Date.now()}`, name: "", types: [...PROPOSAL_TYPES], events: [], mandatory: true });
    };
    const save = () => {
        if (!editing) return;
        if (!editing.name.trim()) return setError("Document name is required");
        if (!editing.types.length) return setError("Select at least one proposal type");
        onSave({ ...editing, name: editing.name.trim() });
        setEditing(null);
    };

    return (
        <>
            <DataTable
                caption="Document checklist"
                data={documents}
                columns={columns}
                getRowId={(r) => r.id}
                renderPreview={null}
                exportFileName="document_checklist"
                toolbarActions={<Button size="sm" icon={<Plus size={14} />} label="Add Document" onClick={() => open()} />}
                actions={{ onEdit: (r) => open(r), onDelete: (r) => onDelete(r.id) }}
            />
            <Modal
                isOpen={!!editing}
                onClose={() => setEditing(null)}
                size="lg"
                title={editing && documents.some((d) => d.id === editing.id) ? "Edit Document Requirement" : "Add Document Requirement"}
                footer={<ModalFooter onClose={() => setEditing(null)} onConfirm={save} confirmText="Apply" />}
            >
                {editing && (
                    <div className="flex flex-col gap-4">
                        <Input label="Document Name" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} error={error} placeholder="e.g. Last Pay Certificate" />
                        <fieldset>
                            <legend className="mb-2 text-sm font-medium">Applies to proposal types</legend>
                            <div className="flex flex-wrap gap-4">
                                {PROPOSAL_TYPES.map((t) => (
                                    <Checkbox key={t} label={t} checked={editing.types.includes(t)} onChange={() => setEditing({ ...editing, types: toggle(editing.types, t) })} />
                                ))}
                            </div>
                        </fieldset>
                        <fieldset>
                            <legend className="mb-1 text-sm font-medium">Required for events</legend>
                            <p className="mb-2 text-xs text-muted-foreground">Leave all unticked to require it for every event.</p>
                            <div className="flex flex-wrap gap-4">
                                {EVENTS.map((ev) => (
                                    <Checkbox key={ev} label={ev} checked={editing.events.includes(ev)} onChange={() => setEditing({ ...editing, events: toggle(editing.events, ev) })} />
                                ))}
                            </div>
                        </fieldset>
                        <Checkbox label="Mandatory (proposal cannot be submitted without it)" checked={editing.mandatory} onChange={(e) => setEditing({ ...editing, mandatory: e.target.checked })} />
                    </div>
                )}
            </Modal>
        </>
    );
};

export default DocumentChecklist;
