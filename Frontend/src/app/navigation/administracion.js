import {
    BanknotesIcon,
    AcademicCapIcon,
    UsersIcon,
    ShieldCheckIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import SettingIcon from 'assets/dualicons/setting.svg?react';
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant';

export const administracion = {
    id: 'administracion',
    type: NAV_TYPE_ROOT,
    path: '/admin',
    title: 'Administración',
    transKey: 'Gestión Administración',
    Icon: SettingIcon,
    childs: [
        {
            id: 'admin.facturas',
            path: '/admin/facturas',
            type: NAV_TYPE_ITEM,
            title: 'Facturas',
            transKey: 'Gestión Facturas',
            Icon: BanknotesIcon,
        },
        {
            id: 'admin.especialidades',
            path: '/admin/especialidades',
            type: NAV_TYPE_ITEM,
            title: 'Especialidades',
            transKey: 'Gestión Especialidades',
            Icon: AcademicCapIcon,
        },
        {
            id: 'admin.usuarios',
            path: '/admin/usuarios',
            type: NAV_TYPE_ITEM,
            title: 'Usuarios',
            transKey: 'Gestión Usuarios',
            Icon: UsersIcon,
        },
        {
            id: 'admin.roles',
            path: '/admin/roles',
            type: NAV_TYPE_ITEM,
            title: 'Roles',
            transKey: 'Gestión Roles',
            Icon: ShieldCheckIcon,
        },
        {
            id: 'admin.reportes',
            path: '/admin/reportes',
            type: NAV_TYPE_ITEM,
            title: 'Reportes',
            transKey: 'Gestión Reportes',
            Icon: ChartBarIcon,
        },
    ],
};
