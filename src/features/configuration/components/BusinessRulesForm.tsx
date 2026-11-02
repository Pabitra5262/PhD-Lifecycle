import { Card, Checkbox } from "@mfe/components";
import type { BusinessRules } from "../../shared";

const RULES: { key: keyof BusinessRules; label: string; help: string }[] = [
    { key: "blockDuplicateOpen", label: "Block duplicate open proposals", help: "Only one open proposal per officer and event (Submit exception E4)." },
    { key: "ruleEngine", label: "Validate proposed pay against the pay matrix", help: "Proposed basic must equal the matrix value of the chosen level / cell (exception E2)." },
    { key: "lockAfterApproval", label: "Lock proposals after approval", help: "Approved / sanctioned proposals cannot be edited; a revision needs a new proposal." },
    { key: "allowAdminOnBehalf", label: "Allow College / University Admin to submit on behalf of officers", help: "Where permitted, the institution admin may initiate proposals for its officers." },
    { key: "verifierCanEdit", label: "Accounts / Establishment may correct pay particulars", help: "Verified basic / level / cell can differ from the proposed figures." },
];

/** SRS 1.7 — business rules for duplicate detection and edit restrictions. */
export const BusinessRulesForm = ({ rules, onChange }: { rules: BusinessRules; onChange: (rules: BusinessRules) => void }) => (
    <Card title="Business Rules">
        <ul className="flex flex-col divide-y divide-border">
            {RULES.map((r) => (
                <li key={r.key} className="py-3 first:pt-0 last:pb-0">
                    <Checkbox label={r.label} helpText={r.help} checked={rules[r.key]} onChange={(e) => onChange({ ...rules, [r.key]: e.target.checked })} />
                </li>
            ))}
        </ul>
    </Card>
);

export default BusinessRulesForm;
