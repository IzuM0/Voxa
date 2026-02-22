import { Navigate, Outlet, useLocation } from "react-router";
import { LoadingSpinner } from "../components/loading-states/LoadingSpinner";
import { DemoModeBanner } from "../components/DemoModeBanner";
import { useAuth } from "./AuthProvider";

export function RequireAuth() {
  const { isAuthenticated, isLoading, isDemoMode } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner text="Checking your session..." />;
  }

  if (!isAuthenticated && !isDemoMode) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return (
    <>
      {isDemoMode && <DemoModeBanner />}
      <Outlet />
    </>
  );
}

