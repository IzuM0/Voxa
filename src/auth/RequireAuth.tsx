import { Navigate, Outlet, useLocation } from "react-router";
import { LoadingSpinner } from "../components/loading-states/LoadingSpinner";
import { useAuth } from "./AuthProvider";

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner text="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

