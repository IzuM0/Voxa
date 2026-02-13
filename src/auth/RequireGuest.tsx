import { Navigate, Outlet } from "react-router";
import { LoadingSpinner } from "../components/loading-states/LoadingSpinner";
import { useAuth } from "./AuthProvider";

export function RequireGuest() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner text="Loading..." />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

