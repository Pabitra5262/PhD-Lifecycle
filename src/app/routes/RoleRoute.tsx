import { Navigate, Outlet } from "react-router-dom";
import { useRole } from "@/features/shared/store/PayFixStore";
import { canOpen, homeOf, type PageKey } from "@/features/shared/roles";

/**
 * Opens the page only for roles that have it in their menu (ROLE_NAV);
 * any other role (e.g. after switching role in the header) goes to its own first page.
 */
const RoleRoute = ({ page }: { page: PageKey }) => {
    const { role } = useRole();
    return canOpen(role, page) ? <Outlet /> : <Navigate to={homeOf(role)} replace />;
};

export default RoleRoute;
