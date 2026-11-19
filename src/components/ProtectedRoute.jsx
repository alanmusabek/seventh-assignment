import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

// Wraps pages that need a logged-in user. Guests are sent to /login.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner text="Checking your session…" />;
  // Remember where the user wanted to go, so login can send them back.
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
