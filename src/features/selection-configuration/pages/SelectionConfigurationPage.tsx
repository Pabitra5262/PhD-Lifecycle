import PageHeader from "@/shared/components/layout/PageHeader";
import { SelectionConfigurationCard } from "../components/SelectionConfigurationCard";
import { SelectionConfigurationList } from "../components/SelectionConfigurationList";
import { SelectionConfigurationDialogs } from "../components/SelectionConfigurationDialogs";
import { useSelectionConfiguration } from "../hooks/useSelectionConfiguration";

const SelectionConfigurationPage = () => {
    const controller = useSelectionConfiguration();
    const { records, load, setPending, revise, showHistory } = controller;
    return <>
        <PageHeader title="Selection Configuration" />
        <SelectionConfigurationCard controller={controller} />
        <SelectionConfigurationList records={records} onView={(row) => load(row, true)} onEdit={(row) => load(row)} onApprove={(row) => setPending({ row, status: "Approved" })} onActivate={(row) => setPending({ row, status: "Active" })} onRevise={revise} onHistory={showHistory} />
        <SelectionConfigurationDialogs controller={controller} />
    </>;
};
export default SelectionConfigurationPage;
