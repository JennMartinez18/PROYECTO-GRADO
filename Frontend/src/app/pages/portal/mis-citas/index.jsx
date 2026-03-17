import { useEffect, useState, useCallback } from "react";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import { formatHora } from "utils/formatHora";
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { useAuthContext } from "app/contexts/auth/context";
import { toast } from "sonner";

export default function MisCitas() {
  const { user } = useAuthContext();
  const [citas, setCitas] = useState([]);
  const [filtro, setFiltro] = useState("todas");

  const fetchCitas = useCallback(async () => {
    if (!user?.paciente_id) return;
    try {
      const res = await axios.get(`/citas/paciente/${user.paciente_id}`);
      if (Array.isArray(res.data.resultado)) setCitas(res.data.resultado);
    } catch {
      // silencioso
    }
  }, [user?.paciente_id]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  const handleCancelar = async (citaId) => {
    if (!window.confirm("¿Estás seguro de cancelar esta cita?")) return;
    try {
      const res = await axios.patch(`/citas/${citaId}/estado`, { estado: "Cancelada" });
      if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
      toast.success("Cita cancelada exitosamente");
      fetchCitas();
    } catch {
      toast.error("Error al cancelar la cita");
    }
  };

  const filtered = filtro === "todas"
    ? citas
    : citas.filter((c) => c.estado === filtro);

  const estadoConfig = {
    Programada: { color: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400", Icon: ClockIcon },
    Confirmada: { color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400", Icon: CalendarDaysIcon },
    Completada: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", Icon: CheckCircleIcon },
    Cancelada: { color: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400", Icon: XCircleIcon },
    No_Asistio: { color: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400", Icon: XCircleIcon },
    En_Curso: { color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400", Icon: ClockIcon },
  };

  const tabs = [
    { id: "todas", label: "Todas" },
    { id: "Programada", label: "Programadas" },
    { id: "Completada", label: "Completadas" },
    { id: "Cancelada", label: "Canceladas" },
  ];

  return (
    <Page title="Mis Citas">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
            <CalendarDaysIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Mis Citas</h2>
            <p className="text-sm text-gray-400 dark:text-dark-300">{citas.length} cita(s) registradas</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltro(tab.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filtro === tab.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-600 dark:text-dark-200 dark:hover:bg-dark-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lista de citas */}
        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <Card className="flex flex-col items-center rounded-xl py-12 text-center">
              <CalendarDaysIcon className="size-14 text-gray-300 dark:text-dark-400" />
              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-dark-300">No hay citas en esta categoría</p>
            </Card>
          ) : (
            filtered.map((cita, i) => {
              const cfg = estadoConfig[cita.estado] || estadoConfig.Programada;
              return (
                <Card key={i} className="rounded-xl p-4 transition-all hover:shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex size-14 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10">
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{cita.fecha?.split("-")[2]}</span>
                        <span className="text-[10px] font-medium uppercase text-indigo-400 dark:text-indigo-300">
                          {cita.fecha ? new Date(cita.fecha + "T00:00:00").toLocaleDateString("es", { month: "short" }) : ""}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-dark-50">{cita.motivo_consulta || "Consulta"}</p>
                        <p className="mt-0.5 text-sm text-gray-400 dark:text-dark-300">
                          {formatHora(cita.hora)} — Dr./Dra. {cita.doctor_nombre || "N/A"} {cita.doctor_apellido || ""}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-dark-400">
                          {cita.especialidad_nombre || "General"} • Consultorio {cita.consultorio}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-semibold ${cfg.color}`}>
                      <cfg.Icon className="size-3.5" />
                      {cita.estado?.replace("_", " ")}
                    </span>
                  </div>
                  {(cita.estado === "Programada" || cita.estado === "Confirmada") && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleCancelar(cita.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                      >
                        <XCircleIcon className="size-3.5" />
                        Cancelar cita
                      </button>
                    </div>
                  )}
                  {cita.observaciones && (
                    <p className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500 dark:border-dark-500 dark:bg-dark-600/50 dark:text-dark-300">
                      {cita.observaciones}
                    </p>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Page>
  );
}
