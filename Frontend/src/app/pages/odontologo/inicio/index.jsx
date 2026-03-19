import { useEffect, useState } from "react";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import {
  CalendarDaysIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { useAuthContext } from "app/contexts/auth/context";
import { formatHora } from "utils/formatHora";

export default function OdontologoInicio() {
  const { user } = useAuthContext();
  const [metrics, setMetrics] = useState(null);
  const [citasHoy, setCitasHoy] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, citasRes] = await Promise.all([
          axios.get("/dashboard/metricas-doctor"),
          axios.get("/dashboard/citas-hoy-doctor"),
        ]);
        if (metricsRes.data.resultado && typeof metricsRes.data.resultado === "object")
          setMetrics(metricsRes.data.resultado);
        if (Array.isArray(citasRes.data.resultado))
          setCitasHoy(citasRes.data.resultado);
      } catch {
        // silencioso
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: "Citas Hoy", value: metrics?.citas_hoy ?? "—", Icon: CalendarDaysIcon, gradient: "from-indigo-500 to-blue-600" },
    { title: "Mis Pacientes", value: metrics?.total_pacientes ?? "—", Icon: UserGroupIcon, gradient: "from-emerald-500 to-teal-600" },
    { title: "Citas Próximas", value: metrics?.citas_proximas ?? "—", Icon: ClockIcon, gradient: "from-violet-500 to-purple-600" },
    { title: "Historias Clínicas", value: metrics?.total_historias ?? "—", Icon: ClipboardDocumentListIcon, gradient: "from-rose-500 to-pink-600" },
    { title: "Completadas este Mes", value: metrics?.completadas_mes ?? "—", Icon: CheckCircleIcon, gradient: "from-cyan-500 to-teal-600" },
  ];

  const estadoColor = (estado) => {
    if (estado === "Completada") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400";
    if (estado === "Cancelada" || estado === "No_Asistio") return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
    if (estado === "En_Curso") return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
    if (estado === "Confirmada") return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400";
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  };

  const estadoIcon = (estado) => {
    if (estado === "Completada") return <CheckCircleIcon className="size-4" />;
    if (estado === "En_Curso") return <ArrowTrendingUpIcon className="size-4" />;
    return <ClockIcon className="size-4" />;
  };

  return (
    <Page title="Mi Consultorio">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header con gradiente */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 p-6 text-white shadow-lg sm:p-8">
          <div className="absolute -right-10 -top-10 size-44 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-12 size-36 rounded-full bg-white/5" />
          <div className="absolute right-20 top-4 size-16 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-sm font-medium text-teal-200">
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">¡Hola, Dr. {user?.nombre || "Doctor"}!</h2>
            <p className="mt-2 max-w-md text-sm text-teal-200">
              Resumen de tu actividad en el consultorio odontológico María Luiza Balza
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {statCards.map((card) => (
            <Card key={card.title} className="group relative overflow-hidden rounded-xl border-0 p-5 transition-all hover:shadow-lg">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 transition-opacity group-hover:opacity-5`} />
              <div className="flex items-center gap-4">
                <div className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-md`}>
                  <card.Icon className="size-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-300">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-dark-50">{card.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Citas de Hoy */}
        <div className="mt-6">
          <Card className="rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400">
                <CalendarDaysIcon className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-dark-50">Mi Agenda de Hoy</h3>
              <span className="ml-auto rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700 dark:bg-teal-500/15 dark:text-teal-400">
                {citasHoy.length} cita(s)
              </span>
            </div>
            <div className="mt-4">
              {citasHoy.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <CalendarDaysIcon className="size-12 text-gray-300 dark:text-dark-400" />
                  <p className="mt-3 text-sm text-gray-400 dark:text-dark-300">No tienes citas programadas para hoy</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {citasHoy.map((cita) => (
                    <div key={cita.id} className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-dark-600 dark:hover:bg-dark-500">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400">
                        <ClockIcon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-dark-50 truncate">
                          {cita.paciente_nombre} {cita.paciente_apellido}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-dark-300">
                          {formatHora(cita.hora)} · {cita.especialidad_nombre}
                          {cita.motivo_consulta && ` · ${cita.motivo_consulta}`}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${estadoColor(cita.estado)}`}>
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
