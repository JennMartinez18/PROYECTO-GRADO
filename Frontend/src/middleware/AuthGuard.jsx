// Import Dependencies
import { Navigate, useLocation, useOutlet } from "react-router";

// Local Imports
import { useAuthContext } from "app/contexts/auth/context";
import { GHOST_ENTRY_PATH, REDIRECT_URL_KEY } from "../constants/app.constant";
import { hasAccess, ROLE_HOME } from "configs/roles.config";

// ----------------------------------------------------------------------

export default function AuthGuard() {
  const outlet = useOutlet();
  const { isAuthenticated, user } = useAuthContext();

  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`${GHOST_ENTRY_PATH}?${REDIRECT_URL_KEY}=${location.pathname}`}
        replace
      />
    );
  }

  // Redirigir a home del rol si intenta acceder a ruta no permitida
  const rolId = user?.rol_id;
  if (rolId && !hasAccess(rolId, location.pathname) && location.pathname !== "/") {
    return <Navigate to={ROLE_HOME[rolId] || "/"} replace />;
  }

  return <>{outlet}</>;
}
