import React from "react";
import { useAppSelector } from "../../app/hooks";
import { Navigate, useLocation, Outlet } from "react-router-dom";

interface Props {
  sellerOnly?: boolean;
}

const ProtectedRoute: React.FC<Props> = ({ sellerOnly = false }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (sellerOnly && user.role !== "seller") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
