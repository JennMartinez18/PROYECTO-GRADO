import { NAV_TYPE_ITEM } from "constants/app.constant";
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import SettingIcon from 'assets/dualicons/setting.svg?react';

export const baseNavigation = [
    {
        id: 'dashboards',
        type: NAV_TYPE_ITEM,
        path: '/dashboards',
        title: 'Dashboard',
        transKey: 'Dashboards',
        Icon: DashboardsIcon,
    },
    {
        id: 'clinica',
        type: NAV_TYPE_ITEM,
        path: '/clinica',
        title: 'Clínica',
        transKey: 'Clinica',
        Icon: ClipboardDocumentListIcon,
    },
    {
        id: 'administracion',
        type: NAV_TYPE_ITEM,
        path: '/admin',
        title: 'Administración',
        transKey: 'Administracion',
        Icon: SettingIcon,
    },
]
