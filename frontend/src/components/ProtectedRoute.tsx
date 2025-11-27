import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { authService } from "../services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string;
}

const ProtectedRoute = ({
  children,
  requireAuth = false,
  requireRole,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Compute auth from Redux OR persisted storage to avoid redirect on refresh
  const storedUser = authService.getUser();
  const hasToken = !!authService.getAccessToken();
  const isAuthed = isAuthenticated || (!!storedUser && hasToken);

  // Check authentication requirement
  if (requireAuth && !isAuthed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentUser = user || storedUser;

  // Check role requirement
  if (requireRole && currentUser && currentUser.role !== requireRole) {
    // Redirect to appropriate dashboard based on user's actual role
    if (currentUser.role === 'guide') {
      return <Navigate to="/guide" replace />;
    } else if (currentUser.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (currentUser.role === 'user') {
      return <Navigate to="/dashboard" replace />;
    } else {
      // Fallback for unknown roles
      return <Navigate to="/" replace />;
    }
  }

  // Legacy seller check removed - not applicable to healthcare platform

  return <>{children}</>;
};

export default ProtectedRoute;
