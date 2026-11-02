import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SelectionConfigurationCard } from "./SelectionConfigurationCard";
import { useSelectionConfiguration } from "../hooks/useSelectionConfiguration";
import { readSelectionRecords } from "../service/selectionConfigurationService";
import { setActiveRole } from "@/features/shared/store/PayFixStore";

function FormHarness() {
    const controller = useSelectionConfiguration();
    return <SelectionConfigurationCard controller={controller} />;
}

describe("configuration card and generated fields", () => {
    it("saves generated fields and editable stage rows together through the service", () => {
        setActiveRole("University Authority");
        render(<FormHarness />);
        const choose = (label: RegExp, option: string) => {
            fireEvent.click(screen.getByRole("button", { name: label }));
            fireEvent.click(screen.getByRole("option", { name: option }));
        };
        choose(/^University/, "Utkal University");
        choose(/^Academic Session/, "2026-27");
        fireEvent.click(screen.getByRole("checkbox", { name: "Written Examination" }));
        fireEvent.change(screen.getByLabelText("Written Examination maximum marks"), { target: { value: "100" } });
        fireEvent.change(screen.getByLabelText("Written Examination weightage"), { target: { value: "100" } });
        fireEvent.change(screen.getByLabelText("Written Examination qualifying score"), { target: { value: "50" } });
        choose(/^Merit Calculation Rule/, "Weighted stage scores (total weightage 100%)");
        choose(/^First Tie-breaking Rule/, "Higher written examination score");
        const before = readSelectionRecords().length;
        fireEvent.click(screen.getByRole("button", { name: "Submit" }));
        const rows = readSelectionRecords();
        expect(rows).toHaveLength(before + 1);
        expect(rows.at(-1)?.configuration).toMatchObject({
            university: "utkal", academicSession: "2026-27", meritMethod: "weighted",
            firstTieBreaker: "written", stages: [{ id: "written", marks: "100", weightage: "100", qualifyingScore: "50" }],
        });
        expect(screen.queryByRole("button", { name: "New Configuration" })).toBeNull();
        fireEvent.change(screen.getByLabelText("Written Examination maximum marks"), { target: { value: "120" } });
        fireEvent.click(screen.getByRole("button", { name: "Reset" }));
        expect(screen.getByLabelText("Written Examination maximum marks")).toHaveValue(100);
        expect(readSelectionRecords()).toHaveLength(before + 1);
    });
});
