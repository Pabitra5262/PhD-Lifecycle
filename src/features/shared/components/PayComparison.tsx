import type { PayParticulars } from "../types/payfix.types";
import { rupees } from "../workflow";

interface PayComparisonProps {
    existing: PayParticulars;
    proposed: PayParticulars;
    verified?: PayParticulars;
}

const Row = ({ label, p, highlight }: { label: string; p?: PayParticulars; highlight?: boolean }) => (
    <tr className={highlight ? "font-semibold" : undefined}>
        <th scope="row" className="py-2 pr-4 text-left font-medium text-muted-foreground">{label}</th>
        <td className="py-2 pr-4 text-right tabular-nums">{p ? rupees(p.basic) : "—"}</td>
        <td className="py-2 pr-4">{p?.level ?? "—"}</td>
        <td className="py-2 text-right tabular-nums">{p?.cell || "—"}</td>
    </tr>
);

/** Existing vs proposed (vs verified) pay: Basic / Level / Cell, with the monthly difference. */
export const PayComparison = ({ existing, proposed, verified }: PayComparisonProps) => {
    const final = verified ?? proposed;
    const diff = final.basic - existing.basic;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2 pr-4 text-left font-medium">Particulars</th>
                        <th className="py-2 pr-4 text-right font-medium">Basic Pay</th>
                        <th className="py-2 pr-4 text-left font-medium">Pay Level</th>
                        <th className="py-2 text-right font-medium">Cell</th>
                    </tr>
                </thead>
                <tbody>
                    <Row label="Existing Pay" p={existing} />
                    <Row label="Proposed Pay" p={proposed} highlight={!verified} />
                    {verified && <Row label="Verified Pay" p={verified} highlight />}
                </tbody>
            </table>
            <p className="mt-2 text-xs text-muted-foreground">
                Monthly difference in basic: <strong className={diff >= 0 ? "text-success" : "text-danger"}>{diff >= 0 ? "+" : "−"}₹{Math.abs(diff).toLocaleString("en-IN")}</strong>
            </p>
        </div>
    );
};

export default PayComparison;
