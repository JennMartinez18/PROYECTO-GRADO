import { dashboards } from "./dashboards";
import { clinica } from "./clinica";
import { administracion } from "./administracion";
import { portal } from "./portal";
import { odontologo } from "./odontologo";
import { ROLES } from "configs/roles.config";

// Navegación completa (legacy export)
export const navigation = [
    dashboards,
    clinica,
    administracion,
]

// Navegación filtrada para Recepcionista: sin Especialidades, Usuarios, Roles
const adminRecepcion = {
    ...administracion,
    childs: administracion.childs.filter((c) => c.id === "admin.facturas"),
};

// Clínica para recepcionista: sin Tratamientos
const clinicaRecepcion = {
    ...clinica,
    childs: clinica.childs.filter((c) => c.id !== "clinica.tratamientos"),
};

// Navegación por rol
export const getNavigationByRole = (rolId) => {
    switch (rolId) {
        case ROLES.ADMIN:
            return [dashboards, clinica, administracion];
        case ROLES.RECEPCIONISTA:
            return [dashboards, clinicaRecepcion, adminRecepcion];
        case ROLES.ODONTOLOGO:
            return [odontologo];
        case ROLES.PACIENTE:
            return [portal];
        default:
            return [];
    }
};

export { baseNavigation } from './baseNavigation'
