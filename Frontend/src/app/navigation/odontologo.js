import {
  HomeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from "constants/app.constant";

export const odontologo = {
  id: "odontologo",
  type: NAV_TYPE_ROOT,
  path: "/odontologo",
  title: "Mi Consultorio",
  transKey: "Gestión Odontólogo",
  Icon: ClipboardDocumentListIcon,
  childs: [
    {
      id: "odontologo.inicio",
      path: "/odontologo",
      type: NAV_TYPE_ITEM,
      title: "Inicio",
      transKey: "Inicio Odontólogo",
      Icon: HomeIcon,
    },
    {
      id: "odontologo.mis-citas",
      path: "/odontologo/mis-citas",
      type: NAV_TYPE_ITEM,
      title: "Mis Citas",
      transKey: "Mis Citas Odontólogo",
      Icon: CalendarDaysIcon,
    },
    {
      id: "odontologo.mis-pacientes",
      path: "/odontologo/mis-pacientes",
      type: NAV_TYPE_ITEM,
      title: "Mis Pacientes",
      transKey: "Mis Pacientes Odontólogo",
      Icon: UserGroupIcon,
    },
    {
      id: "odontologo.historias",
      path: "/odontologo/historias",
      type: NAV_TYPE_ITEM,
      title: "Historias Clínicas",
      transKey: "Historias Odontólogo",
      Icon: ClipboardDocumentListIcon,
    },
  ],
};
