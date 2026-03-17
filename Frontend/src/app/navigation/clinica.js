import {
    UserGroupIcon,
    CalendarDaysIcon,
    ClipboardDocumentListIcon,
    BeakerIcon,
} from '@heroicons/react/24/outline';
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant';

export const clinica = {
    id: 'clinica',
    type: NAV_TYPE_ROOT,
    path: '/clinica',
    title: 'Clínica',
    transKey: 'Gestión Clínica',
    Icon: ClipboardDocumentListIcon,
    childs: [
        {
            id: 'clinica.pacientes',
            path: '/clinica/pacientes',
            type: NAV_TYPE_ITEM,
            title: 'Pacientes',
            transKey: 'Gestión Pacientes',
            Icon: UserGroupIcon,
        },
        {
            id: 'clinica.citas',
            path: '/clinica/citas',
            type: NAV_TYPE_ITEM,
            title: 'Citas',
            transKey: 'Gestión Citas',
            Icon: CalendarDaysIcon,
        },
        {
            id: 'clinica.historias',
            path: '/clinica/historias',
            type: NAV_TYPE_ITEM,
            title: 'Historias Clínicas',
            transKey: 'Gestión Historias Clínicas',
            Icon: ClipboardDocumentListIcon,
        },
        {
            id: 'clinica.tratamientos',
            path: '/clinica/tratamientos',
            type: NAV_TYPE_ITEM,
            title: 'Tratamientos',
            transKey: 'Gestion Tratamientos',
            Icon: BeakerIcon,
        },
    ],
};
