// Roles del sistema
export const ROLES = {
  ADMIN: 1,
  PACIENTE: 2,
  RECEPCIONISTA: 3,
  ODONTOLOGO: 4,
};

// Rutas bloqueadas explícitamente por rol (tienen prioridad sobre ROLE_ACCESS)
export const ROLE_BLOCK = {
  [ROLES.RECEPCIONISTA]: [
    "/clinica/historias",
    "/clinica/tratamientos",
  ],
};

// Rutas permitidas por rol
export const ROLE_ACCESS = {
  [ROLES.ADMIN]: [
    "/dashboards",
    "/clinica",
    "/admin",
    "/settings",
  ],
  [ROLES.PACIENTE]: [
    "/portal",
    "/settings",
  ],
  [ROLES.RECEPCIONISTA]: [
    "/dashboards",
    "/clinica",
    "/admin/facturas",
    "/settings",
  ],
  [ROLES.ODONTOLOGO]: [
    "/odontologo",
    "/settings",
  ],
};

// Home por rol
export const ROLE_HOME = {
  [ROLES.ADMIN]: "/dashboards/home",
  [ROLES.PACIENTE]: "/portal",
  [ROLES.RECEPCIONISTA]: "/dashboards/home",
  [ROLES.ODONTOLOGO]: "/odontologo",
};

// Verificar si un rol tiene acceso a una ruta
export const hasAccess = (rolId, path) => {
  const allowed = ROLE_ACCESS[rolId];
  if (!allowed) return false;
  const blocked = ROLE_BLOCK[rolId] || [];
  if (blocked.some((prefix) => path.startsWith(prefix))) return false;
  return allowed.some((prefix) => path.startsWith(prefix));
};
