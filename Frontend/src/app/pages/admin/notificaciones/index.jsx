import { useEffect, useState, useCallback } from "react";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { toast } from "sonner";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

const EstadoBadge = ({ estado }) => {
  const cfg = {
    enviado:  "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
    fallido:  "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    pendiente:"bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  };
  const Icon = { enviado: CheckCircleIcon, fallido: XCircleIcon, pendiente: ClockIcon }[estado] ?? ClockIcon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg[estado] ?? ""}`}>
      <Icon className="h-3.5 w-3.5" />
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
};

const StatCard = ({ label, value, color, Icon }) => (
  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-dark-500 dark:bg-dark-700">
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800 dark:text-dark-50">{value ?? "—"}</p>
      <p className="text-sm text-gray-500 dark:text-dark-300">{label}</p>
    </div>
  </div>
);

export default function Notificaciones() {
  const [notifs, setNotifs]   = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [ejecutando, setEjecutando] = useState(false);
  const [filtro, setFiltro]   = useState("todos");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rList, rStats] = await Promise.all([
        axios.get("/notificaciones"),
        axios.get("/notificaciones/estadisticas"),
      ]);
      if (Array.isArray(rList.data.resultado)) setNotifs(rList.data.resultado);
      if (rStats.data.resultado) setStats(rStats.data.resultado);
    } catch {
      toast.error("Error al cargar notificaciones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEjecutar = async () => {
    if (!window.confirm("¿Deseas ejecutar el proceso de recordatorios ahora?")) return;
    setEjecutando(true);
    try {
      const res = await axios.post("/notificaciones/ejecutar");
      if (res.data.error) {
        toast.error(`Error: ${res.data.error}`);
      } else {
        toast.success(`Proceso completado: ${res.data.enviadas ?? 0} enviadas de ${res.data.procesadas ?? 0} citas`);
        fetchData();
      }
    } catch {
      toast.error("Error al ejecutar recordatorios");
    } finally {
      setEjecutando(false);
    }
  };

  const filtradas = filtro === "todos" ? notifs : notifs.filter((n) => n.estado === filtro);

  return (
    <Page title="Notificaciones WhatsApp">
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-50">
              Recordatorios WhatsApp
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
              Historial de notificaciones enviadas automáticamente. El sistema envía
              recordatorios diariamente a las 8:00 AM para citas en las próximas 24 horas.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-200"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Actualizar
            </button>
            <button
              onClick={handleEjecutar}
              disabled={ejecutando}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              <PlayIcon className="h-4 w-4" />
              {ejecutando ? "Ejecutando..." : "Ejecutar ahora"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total enviadas" value={stats?.total} color="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400" Icon={BellIcon} />
          <StatCard label="Exitosas" value={stats?.enviadas} color="bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400" Icon={CheckCircleIcon} />
          <StatCard label="Fallidas" value={stats?.fallidas} color="bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400" Icon={XCircleIcon} />
          <StatCard label="Pendientes" value={stats?.pendientes} color="bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400" Icon={ClockIcon} />
        </div>

        {/* Info Twilio config */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">⚙️ Configuración Twilio:</span> Para activar el envío real de mensajes, agrega en el archivo{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-500/20">.env</code> del backend:{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-500/20">TWILIO_ACCOUNT_SID</code>,{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-500/20">TWILIO_AUTH_TOKEN</code>,{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-500/20">TWILIO_WHATSAPP_FROM</code> y{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-500/20">CLINIC_ADDRESS</code>.
          </p>
        </div>

        {/* Tabla */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-dark-500">
            <h2 className="font-semibold text-gray-800 dark:text-dark-50">
              Historial ({filtradas.length})
            </h2>
            <div className="flex gap-1">
              {["todos", "enviado", "fallido"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    filtro === f
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-dark-300 dark:hover:bg-dark-500"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <ArrowPathIcon className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <BellIcon className="h-12 w-12 text-gray-300 dark:text-dark-500" />
              <p className="text-gray-500 dark:text-dark-300">
                {filtro === "todos"
                  ? "No hay notificaciones registradas aún."
                  : `No hay notificaciones con estado "${filtro}".`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 dark:border-dark-500 dark:bg-dark-600">
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-dark-300">Paciente</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-dark-300">Teléfono</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-dark-300">Cita</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-dark-300">Tipo</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-dark-300">Estado</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-dark-300">Enviado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-500">
                  {filtradas.map((n) => (
                    <tr key={n.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-600/50">
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-dark-100">
                        {n.paciente_nombre} {n.paciente_apellido}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-dark-300">
                        {n.telefono || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-dark-300">
                        {n.cita_fecha} {n.cita_hora}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-dark-300">
                        {n.tipo === "recordatorio_24h" ? "24 horas antes" : n.tipo}
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge estado={n.estado} />
                        {n.estado === "fallido" && n.mensaje_error && (
                          <p className="mt-0.5 text-xs text-red-500">{n.mensaje_error}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-dark-400">
                        {n.fecha_envio ? dayjs(n.fecha_envio).format("DD/MM/YYYY HH:mm") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
}
