import { Select } from "@mfe/components";
import { ROLES } from "../roles";
import { useRole } from "../store/PayFixStore";

/**
 * Wireframe-only: lets reviewers switch actor when the host shell has no role switcher (e.g. inside hplus_react).
 * Hidden when the host owns the role (the wireframe header). Remove once roles come from @mfe/auth.
 */
export const DemoRoleSwitcher = () => {
    const { role, setRole, hostControlsRole } = useRole();
    if (hostControlsRole) return null;
    return (
        <Select
            label="Demo role"
            options={ROLES.map((r) => ({ value: r.label, label: r.label }))}
            value={role}
            onChange={(v) => setRole(String(v))}
            wrapperClassName="w-64"
        />
    );
};

export default DemoRoleSwitcher;
