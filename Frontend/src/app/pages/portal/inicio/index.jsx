import { useEffect, useState } from "react";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import { formatHora } from "utils/formatHora";
import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { useAuthContext } from "app/contexts/auth/context";

export default function PortalInicio() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState({ citas: 0, historias: 0, facturas: 0, saldoPendiente: 0 });
  const [proximasCitas, setProximasCitas] = useState([]);

  useEffect(() => {
    if (!user?.paciente_id) return;
    const fetchData = async () => {
      try {
        const [citasR, historiasR, facturasR] = await Promise.all([
          axios.get(`/citas/paciente/${user.paciente_id}`),
          axios.get(`/historias-clinicas/paciente/${user.paciente_id}`),
          axios.get(`/facturas/paciente/${user.paciente_id}`),
        ]);
        const citas = Array.isArray(citasR.data.resultado) ? citasR.data.resultado : [];
        const historias = Array.isArray(historiasR.data.resultado) ? historiasR.data.resultado : [];
        const facturas = Array.isArray(facturasR.data.resultado) ? facturasR.data.resultado : [];
        const saldoPendiente = facturas
          .filter((f) => f.estado === "Pendiente")
          .reduce((sum, f) => sum + (parseFloat(f.total) || 0), 0);
        setStats({ citas: citas.length, historias: historias.length, facturas: facturas.length, saldoPendiente });
        setProximasCitas(
          citas
            .filter((c) => c.estado === "Programada" || c.estado === "Confirmada")
            .slice(0, 5)
        );
      } catch {
        // silencioso
      }
    };
    fetchData();
  }, [user?.paciente_id]);

  const cards = [
    { title: "Mis Citas", value: stats.citas, Icon: CalendarDaysIcon, gradient: "from-indigo-500 to-blue-600" },
    { title: "Historiales", value: stats.historias, Icon: ClipboardDocumentListIcon, gradient: "from-emerald-500 to-teal-600" },
    { title: "Facturas", value: stats.facturas, Icon: BanknotesIcon, gradient: "from-amber-500 to-orange-600" },
    { title: "Saldo Pendiente", value: `$${stats.saldoPendiente.toLocaleString()}`, Icon: BanknotesIcon, gradient: stats.saldoPendiente > 0 ? "from-red-500 to-rose-600" : "from-emerald-500 to-green-600" },
  ];

  return (
    <Page title="Mi Portal">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white shadow-lg sm:p-8">
          <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-sm font-medium text-indigo-100">Bienvenido/a</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{user?.nombre || "Paciente"}</h2>
            <p className="mt-2 text-sm text-indigo-100">
              Gestiona tus citas, historial médico y facturas desde tu portal personal.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {cards.map((card) => (
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

        {/* Próximas citas */}
        <div className="mt-6">
          <Card className="rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <ClockIcon className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-dark-50">Próximas Citas</h3>
            </div>
            <div className="mt-4">
              {proximasCitas.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <CalendarDaysIcon className="size-12 text-gray-300 dark:text-dark-400" />
                  <p className="mt-3 text-sm text-gray-400 dark:text-dark-300">
                    No tienes citas próximas programadas
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {proximasCitas.map((cita, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-dark-500 dark:hover:bg-dark-600/50">
                      <div className="flex size-12 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <span className="text-xs font-medium">{cita.fecha?.split("-")[2]}</span>
                        <span className="text-[10px] uppercase">{new Date(cita.fecha).toLocaleDateString("es", { month: "short" })}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-dark-50">{cita.motivo_consulta || "Consulta general"}</p>
                        <p className="text-xs text-gray-400 dark:text-dark-300">{formatHora(cita.hora)} — {cita.especialidad_nombre || "General"}</p>
                      </div>
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
                        {cita.estado}
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
