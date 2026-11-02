import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { homeOf } from "@/features/shared/roles";
import { useRole } from "@/features/shared/store/PayFixStore";
import type { RootState } from "../../app/store";

const PublicRoute = () => {
    const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const { role } = useRole();

    useEffect(() => {
        if (token && isAuthenticated) {
            navigate(homeOf(role), { replace: true });
        }
    }, [token, isAuthenticated, navigate, role]);

    return <Outlet />;
};

export default PublicRoute;

