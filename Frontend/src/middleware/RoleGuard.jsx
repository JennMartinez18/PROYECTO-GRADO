// Import Dependencies
import { Navigate, useLocation, useOutlet } from "react-router";

// Local Imports
import { useAuthContext } from "app/contexts/auth/context";
import { hasAccess, ROLE_HOME } from "configs/roles.config";

// ----------------------------------------------------------------------

export default function RoleGuard({ allowedRoles }) {
  const outlet = useOutlet();
  const { user } = useAuthContext();
  const location = useLocation();

  const rolId = user?.rol_id;

  // Si tiene allowedRoles explícitos, verificar contra ellos
  if (allowedRoles && !allowedRoles.includes(rolId)) {
    return <Navigate to={ROLE_HOME[rolId] || "/"} replace />;
  }

  // Verificar acceso general por ruta
  if (!hasAccess(rolId, location.pathname)) {
    return <Navigate to={ROLE_HOME[rolId] || "/"} replace />;
  }

  return <>{outlet}</>;
}
