import PropTypes from "prop-types";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../config/app";
import { useAuth } from "../hooks/useAuth";

// Deja pasar solo a usuarios autenticados (y, opcionalmente, con alguno de los roles indicados).
export function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={ROUTES.dashboard} replace />;
  return <Outlet />;
}

// Login y registro: si ya hay sesión, se redirige a donde la persona quería ir.
export function PublicOnlyRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (user) return <Navigate to={location.state?.from?.pathname ?? ROUTES.dashboard} replace />;
  return <Outlet />;
}

ProtectedRoute.propTypes = { roles: PropTypes.arrayOf(PropTypes.string) };
