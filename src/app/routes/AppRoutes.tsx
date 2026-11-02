import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { routes } from "./routeConfig";
import { lifecyclePageRoutes } from "@/features/lifecycle-shared/routes";
import { homeOf } from "@/features/shared/roles";
import { useRole } from "@/features/shared/store/PayFixStore";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import AuthLayout from "@/shared/components/layout/AuthLayout";
import MainLayout from "@/shared/components/layout/MainLayout";
import PublicRoute from "./PublicRoute";

const PhdDashboardPage = lazy(() => import("@/features/dashboard").then((m) => ({ default: m.PhdDashboardPage })));

const ApplicationScrutinyPage = lazy(() => import("@/features/application-scrutiny").then((m) => ({ default: m.ApplicationScrutinyPage })));

const ApplyPage = lazy(() => import("@/features/phd-application").then((m) => ({ default: m.ApplyPage })));

const CandidateProfilePage = lazy(() => import("@/features/candidate-profile").then((m) => ({ default: m.CandidateProfilePage })));

const SelectionConfigurationPage = lazy(() => import("@/features/selection-configuration").then((m) => ({ default: m.SelectionConfigurationPage })));

const AdvertisementManagementPage = lazy(() => import("@/features/advertisement").then((m) => ({ default: m.AdvertisementManagementPage })));

const Login = lazy(() => import("@/features/auth/pages/Login"));
// Pages load from each feature's barrel (hplus_react rule: never deep-import a feature).

const AppRoutes = () => {
  const { role } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      void navigate(customEvent.detail);
    };
    window.addEventListener("auth-redirect", handleAuthRedirect);
    return () =>
      window.removeEventListener("auth-redirect", handleAuthRedirect);
  }, [navigate]);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-300 h-16 w-16 mb-4" />
            <div className="h-4 bg-gray-300 rounded w-48 mb-4" />
            <div className="h-4 bg-gray-300 rounded w-64 mb-4" />
            <div className="h-4 bg-gray-300 rounded w-40" />
          </div>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Navigate to={routes.login.path} replace />} />

        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={routes.login.path} element={<Login />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Each page opens only for the roles that have it in their menu (src/features/shared/roles.ts). */}
            <Route element={<RoleRoute page="phdDashboard" />}><Route path={routes.phdDashboard.path} element={<PhdDashboardPage />} /></Route>
            <Route element={<RoleRoute page="applicationScrutiny" />}>
              <Route path={routes.applicationScrutiny.path} element={<ApplicationScrutinyPage />} />
            </Route>
            <Route element={<RoleRoute page="apply" />}>
              <Route path={routes.apply.path} element={<ApplyPage />} />
            </Route>
            <Route element={<RoleRoute page="myProfile" />}>
              <Route path={routes.myProfile.path} element={<CandidateProfilePage />} />
            </Route>
            <Route element={<RoleRoute page="selectionConfiguration" />}>
              <Route path={routes.selectionConfiguration.path} element={<SelectionConfigurationPage />} />
            </Route>
            <Route element={<RoleRoute page="advertisements" />}>
              <Route path={routes.advertisements.path} element={<AdvertisementManagementPage />} />
            </Route>
            {lifecyclePageRoutes.map(({ key, path, Component }) => <Route key={key} element={<RoleRoute page={key} />}><Route path={path} element={<Component />} /></Route>)}
            <Route path="/phd" element={null} />

            <Route path="*" element={<Navigate to={homeOf(role)} replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;


