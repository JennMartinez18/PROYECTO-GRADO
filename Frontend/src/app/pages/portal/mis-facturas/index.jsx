import { useEffect, useState, useCallback } from "react";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import {
  BanknotesIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { useAuthContext } from "app/contexts/auth/context";

export default function MisFacturas() {
  const { user } = useAuthContext();
  const [facturas, setFacturas] = useState([]);
  const [filtro, setFiltro] = useState("todas");

  const fetchFacturas = useCallback(async () => {
    if (!user?.paciente_id) return;
    try {
      const res = await axios.get(`/facturas/paciente/${user.paciente_id}`);
      if (Array.isArray(res.data.resultado)) setFacturas(res.data.resultado);
    } catch {
      // silencioso
    }
  }, [user?.paciente_id]);

  useEffect(() => {
    fetchFacturas();
  }, [fetchFacturas]);

  const filtered = filtro === "todas"
    ? facturas
    : facturas.filter((f) => f.estado === filtro);

  const estadoConfig = {
    Pendiente: { color: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400", Icon: ClockIcon },
    Pagada: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", Icon: CheckBadgeIcon },
    Anulada: { color: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400", Icon: XCircleIcon },
  };

  const tabs = [
    { id: "todas", label: "Todas" },
    { id: "Pendiente", label: "Pendientes" },
    { id: "Pagada", label: "Pagadas" },
  ];

  const totalPendiente = facturas
    .filter((f) => f.estado === "Pendiente")
    .reduce((sum, f) => sum + (parseFloat(f.total) || 0), 0);

  return (
    <Page title="Mis Facturas">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <BanknotesIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Mis Facturas</h2>
              <p className="text-sm text-gray-400 dark:text-dark-300">{facturas.length} factura(s)</p>
            </div>
          </div>
          {totalPendiente > 0 && (
            <div className="rounded-xl bg-amber-50 px-4 py-2 dark:bg-amber-500/10">
              <p className="text-xs text-amber-600 dark:text-amber-400">Pendiente</p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">${totalPendiente.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltro(tab.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filtro === tab.id
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-600 dark:text-dark-200 dark:hover:bg-dark-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <Card className="flex flex-col items-center rounded-xl py-12 text-center">
              <DocumentTextIcon className="size-14 text-gray-300 dark:text-dark-400" />
              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-dark-300">No hay facturas en esta categoría</p>
            </Card>
          ) : (
            filtered.map((f, i) => {
              const cfg = estadoConfig[f.estado] || estadoConfig.Pendiente;
              return (
                <Card key={i} className="rounded-xl p-4 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                        <BanknotesIcon className="size-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-dark-50">
                          Factura #{f.numero_factura || f.id}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-dark-300">
                          {f.fecha_emision?.split("T")[0]} {f.metodo_pago ? `• ${f.metodo_pago}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-800 dark:text-dark-50">
                        ${parseFloat(f.total || 0).toLocaleString()}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                        <cfg.Icon className="size-3.5" />
                        {f.estado}
                      </span>
                    </div>
                  </div>
                  {f.observaciones && (
                    <p className="mt-3 text-xs text-gray-400 dark:text-dark-300">{f.observaciones}</p>
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
