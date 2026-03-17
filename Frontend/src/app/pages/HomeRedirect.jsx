import { Navigate } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";
import { ROLE_HOME } from "configs/roles.config";

export default function HomeRedirect() {
  const { user } = useAuthContext();
  const home = ROLE_HOME[user?.rol_id] || "/dashboards/home";
  return <Navigate to={home} replace />;
}
