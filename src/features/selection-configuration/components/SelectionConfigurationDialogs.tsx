import { DataTable, DialogModal, Modal } from "@mfe/components";
import { describeConfiguration } from "../form-config/selectionConfigurationConfig";
import type { SelectionConfigurationViewProps } from "../types";

export function SelectionConfigurationDialogs({ controller }: SelectionConfigurationViewProps) {
    const { pending, setPending, history, setHistory, confirmTransition } = controller;
    return <>
            <DialogModal isOpen={pending !== null} title={pending?.status === "Approved" ? "Approve Selection Configuration" : "Activate Selection Configuration"} message={pending?.status === "Approved" ? "Confirm that these selection rules have been approved by the competent university authority. Approval locks this version for editing." : "Activate this approved configuration for advertisement mapping, scheduling and assessment? An approved revision replaces its previous active version. All changes are logged."} onClose={() => setPending(null)} onConfirm={confirmTransition} />
            <Modal isOpen={history !== null} onClose={() => setHistory(null)} title="Selection Configuration Change Log" size="xl">
                <DataTable data={history ?? []} getRowId={(row, index) => row.recordId + row.date + index} columns={[
                    { accessorKey: "date", header: "Date", Cell: ({ row }) => new Date(row.original.date).toLocaleString("en-IN") },
                    { accessorKey: "role", header: "Changed By" }, { accessorKey: "action", header: "Action" },
                    { accessorKey: "previousStatus", header: "Previous Status" }, { accessorKey: "status", header: "Status" },
                    { id: "details", header: "Changes", Cell: ({ row }) => <details><summary>View recorded values</summary><div className="space-y-2 text-sm">{row.original.before && <div><strong>Before</strong>{describeConfiguration(row.original.before).map(([label, value]) => <p key={label}>{label}: {value}</p>)}</div>}<div><strong>After</strong>{describeConfiguration(row.original.after).map(([label, value]) => <p key={label}>{label}: {value}</p>)}</div></div></details> },
                ]} caption="Configuration audit history" renderPreview={null} />
            </Modal>
    </>;
}
