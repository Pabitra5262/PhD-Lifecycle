import type { useSelectionConfiguration } from "../hooks/useSelectionConfiguration";

export interface SelectionConfigurationViewProps {
    controller: ReturnType<typeof useSelectionConfiguration>;
}
