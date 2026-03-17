import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  HomeIcon,
  UserCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from "constants/app.constant";

export const portal = {
  id: "portal",
  type: NAV_TYPE_ROOT,
  path: "/portal",
  title: "Mi Portal",
  transKey: "Gestión Portal",
  Icon: HomeIcon,
  childs: [
    {
      id: "portal.inicio",
      path: "/portal",
      type: NAV_TYPE_ITEM,
      title: "Inicio",
      transKey: "Gestión Inicio",
      Icon: HomeIcon,
    },
    {
      id: "portal.mis-citas",
      path: "/portal/mis-citas",
      type: NAV_TYPE_ITEM,
      title: "Mis Citas",
      transKey: "Gestión Mis Citas",
      Icon: CalendarDaysIcon,
    },
    {
      id: "portal.mi-historial",
      path: "/portal/mi-historial",
      type: NAV_TYPE_ITEM,
      title: "Mi Historial",
      transKey: "Gestión Mi Historial",
      Icon: ClipboardDocumentListIcon,
    },
    {
      id: "portal.mis-facturas",
      path: "/portal/mis-facturas",
      type: NAV_TYPE_ITEM,
      title: "Mis Facturas",
      transKey: "Gestión Mis Facturas",
      Icon: BanknotesIcon,
    },
    {
      id: "portal.consultas",
      path: "/portal/consultas",
      type: NAV_TYPE_ITEM,
      title: "Servicios y Precios",
      transKey: "Servicios y Precios",
      Icon: SparklesIcon,
    },
    {
      id: "portal.mi-perfil",
      path: "/portal/mi-perfil",
      type: NAV_TYPE_ITEM,
      title: "Mi Perfil",
      transKey: "Gestión Mi Perfil",
      Icon: UserCircleIcon,
    },
  ],
};
