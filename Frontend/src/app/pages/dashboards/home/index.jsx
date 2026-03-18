import { useEffect, useState } from "react";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import {
  UserGroupIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { useAuthContext } from "app/contexts/auth/context";
import { formatHora } from "utils/formatHora";

export default function Home() {
  const { user } = useAuthContext();
  const [metrics, setMetrics] = useState(null);
  const [citasHoy, setCitasHoy] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, citasRes] = await Promise.all([
          axios.get("/dashboard/metricas"),
          axios.get("/dashboard/citas-hoy"),
        ]);
        if (metricsRes.data.resultado && typeof metricsRes.data.resultado === "object") setMetrics(metricsRes.data.resultado);
        if (Array.isArray(citasRes.data.resultado)) setCitasHoy(citasRes.data.resultado);
      } catch {
        // silencioso
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: "Pacientes", value: metrics?.total_pacientes ?? "—", Icon: UserGroupIcon, gradient: "from-indigo-500 to-blue-600" },
    { title: "Citas Hoy", value: metrics?.citas_hoy ?? "—", Icon: CalendarDaysIcon, gradient: "from-emerald-500 to-teal-600" },
    { title: "Ingresos del Mes", value: metrics?.ingresos_mes ? `$${Number(metrics.ingresos_mes).toLocaleString()}` : "—", Icon: BanknotesIcon, gradient: "from-amber-500 to-orange-600" },
    { title: "Citas Próximas", value: metrics?.citas_proximas ?? "—", Icon: ClipboardDocumentListIcon, gradient: "from-violet-500 to-purple-600" },
  ];

  const estadoIcon = (estado) => {
    if (estado === "Completada") return <CheckCircleIcon className="size-4" />;
    if (estado === "En_Curso") return <ArrowTrendingUpIcon className="size-4" />;
    return <ClockIcon className="size-4" />;
  };

  const estadoColor = (estado) => {
    if (estado === "Completada") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400";
    if (estado === "Cancelada" || estado === "No_Asistio") return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
    if (estado === "En_Curso") return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  };

  return (
    <Page title="Dashboard">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header con gradiente */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 p-6 text-white shadow-lg sm:p-8">
          <div className="absolute -right-10 -top-10 size-44 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-12 size-36 rounded-full bg-white/5" />
          <div className="absolute right-20 top-4 size-16 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-sm font-medium text-indigo-200">
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">¡Hola, {user?.nombre || "Usuario"}!</h2>
            <p className="mt-2 max-w-md text-sm text-indigo-200">Resumen del consultorio odontológico María Luiza Balza</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {statCards.map((card) => (
            <Card key={card.title} className="group relative overflow-hidden rounded-xl p-5 transition-all hover:shadow-lg">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 transition-opacity group-hover:opacity-[0.03]`} />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-dark-300">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-dark-50">{card.value}</p>
                </div>
                <div className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-md`}>
                  <card.Icon className="size-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Citas de Hoy */}
        <div className="mt-6">
          <Card className="rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm">
                  <CalendarDaysIcon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-dark-50">Citas de Hoy</h3>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
                {citasHoy.length} cita(s)
              </span>
            </div>
            <div className="mt-4">
              {citasHoy.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <CalendarDaysIcon className="size-14 text-gray-200 dark:text-dark-500" />
                  <p className="mt-4 text-sm text-gray-400 dark:text-dark-300">No hay citas programadas para hoy</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {citasHoy.map((cita, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-100 p-3.5 transition-colors hover:bg-gray-50/50 dark:border-dark-500 dark:hover:bg-dark-600/30">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        {formatHora(cita.hora)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-dark-50">{cita.paciente_nombre} {cita.paciente_apellido}</p>
                        <p className="text-xs text-gray-400 dark:text-dark-300">{cita.motivo_consulta || "Consulta general"}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${estadoColor(cita.estado)}`}>
                        {estadoIcon(cita.estado)}
                        {cita.estado?.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </Page>
  );
}
