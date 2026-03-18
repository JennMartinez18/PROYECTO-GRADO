// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "middleware/AuthGuard";
import HomeRedirect from "app/pages/HomeRedirect";

// ----------------------------------------------------------------------

const protectedRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <HomeRedirect />,
        },
        // Dashboard
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/home")).default,
              }),
            },
          ],
        },
        // Clínica
        {
          path: "clinica",
          children: [
            {
              index: true,
              element: <Navigate to="/clinica/pacientes" />,
            },
            {
              path: "pacientes",
              lazy: async () => ({
                Component: (await import("app/pages/clinica/pacientes")).default,
              }),
            },
            {
              path: "citas",
              lazy: async () => ({
                Component: (await import("app/pages/clinica/citas")).default,
              }),
            },
            {
              path: "historias",
              lazy: async () => ({
                Component: (await import("app/pages/clinica/historias")).default,
              }),
            },
            {
              path: "tratamientos",
              lazy: async () => ({
                Component: (await import("app/pages/clinica/tratamientos")).default,
              }),
            },
          ],
        },
        // Administración
        {
          path: "admin",
          children: [
            {
              index: true,
              element: <Navigate to="/admin/facturas" />,
            },
            {
              path: "facturas",
              lazy: async () => ({
                Component: (await import("app/pages/admin/facturas")).default,
              }),
            },
            {
              path: "especialidades",
              lazy: async () => ({
                Component: (await import("app/pages/admin/especialidades")).default,
              }),
            },
            {
              path: "usuarios",
              lazy: async () => ({
                Component: (await import("app/pages/admin/usuarios")).default,
              }),
            },
            {
              path: "roles",
              lazy: async () => ({
                Component: (await import("app/pages/admin/roles")).default,
              }),
            },
            {
              path: "reportes",
              lazy: async () => ({
                Component: (await import("app/pages/admin/reportes")).default,
              }),
            },
          ],
        },
        // Portal del Paciente
        {
          path: "portal",
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (await import("app/pages/portal/inicio")).default,
              }),
            },
            {
              path: "mis-citas",
              lazy: async () => ({
                Component: (await import("app/pages/portal/mis-citas")).default,
              }),
            },
            {
              path: "mi-historial",
              lazy: async () => ({
                Component: (await import("app/pages/portal/mi-historial")).default,
              }),
            },
            {
              path: "mis-facturas",
              lazy: async () => ({
                Component: (await import("app/pages/portal/mis-facturas")).default,
              }),
            },
            {
              path: "consultas",
              lazy: async () => ({
                Component: (await import("app/pages/portal/consultas")).default,
              }),
            },
            {
              path: "mi-perfil",
              lazy: async () => ({
                Component: (await import("app/pages/portal/mi-perfil")).default,
              }),
            },
          ],
        },
        // Portal del Odontólogo
        {
          path: "odontologo",
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (await import("app/pages/odontologo/inicio")).default,
              }),
            },
            {
              path: "mis-citas",
              lazy: async () => ({
                Component: (await import("app/pages/odontologo/mis-citas")).default,
              }),
            },
            {
              path: "mis-pacientes",
              lazy: async () => ({
                Component: (await import("app/pages/odontologo/mis-pacientes")).default,
              }),
            },
            {
              path: "historias",
              lazy: async () => ({
                Component: (await import("app/pages/odontologo/historias")).default,
              }),
            },
            {
              path: "tratamientos",
              lazy: async () => ({
                Component: (await import("app/pages/odontologo/tratamientos")).default,
              }),
            },
          ],
        },
      ],
    },
    // App Layout routes
    {
      Component: AppLayout,
      children: [
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (await import("app/pages/settings/sections/General"))
                  .default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };
