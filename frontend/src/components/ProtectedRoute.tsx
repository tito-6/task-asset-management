import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAppSelector } from "../app/hooks.js";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
