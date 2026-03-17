import { useEffect, useState, useCallback } from "react";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import {
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CalendarIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { useAuthContext } from "app/contexts/auth/context";

export default function MiHistorial() {
  const { user } = useAuthContext();
  const [historias, setHistorias] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchHistorias = useCallback(async () => {
    if (!user?.paciente_id) return;
    try {
      const res = await axios.get(`/historias-clinicas/paciente/${user.paciente_id}`);
      if (Array.isArray(res.data.resultado)) setHistorias(res.data.resultado);
    } catch {
      // silencioso
    }
  }, [user?.paciente_id]);

  useEffect(() => {
    fetchHistorias();
  }, [fetchHistorias]);

  return (
    <Page title="Mi Historial">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
            <ClipboardDocumentListIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Mi Historial Clínico</h2>
            <p className="text-sm text-gray-400 dark:text-dark-300">{historias.length} registro(s)</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {historias.length === 0 ? (
            <Card className="flex flex-col items-center rounded-xl py-12 text-center">
              <DocumentTextIcon className="size-14 text-gray-300 dark:text-dark-400" />
              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-dark-300">
                No tienes registros en tu historial clínico
              </p>
            </Card>
          ) : (
            historias.map((h, i) => (
              <Card key={i} className="rounded-xl p-4 transition-all hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 flex-col items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CalendarIcon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-dark-50">
                        {h.diagnostico || "Consulta general"}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-400 dark:text-dark-300">
                        {h.fecha_atencion?.split("T")[0]} — Dr./Dra. {h.doctor_nombre || "N/A"} {h.doctor_apellido || ""}
                      </p>
                      {h.motivo_consulta && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-dark-300">
                          Motivo: {h.motivo_consulta}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(h)}
                    className="shrink-0 rounded-lg bg-emerald-50 p-2 text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                  >
                    <EyeIcon className="size-4" />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Modal detalle */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">Detalle del Historial</h3>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <Field label="Fecha" value={selected.fecha_atencion?.split("T")[0]} />
                <Field label="Motivo de Consulta" value={selected.motivo_consulta} />
                <Field label="Diagnóstico" value={selected.diagnostico} />
                <Field label="Observaciones" value={selected.observaciones} />
                <Field label="Recomendaciones" value={selected.recomendaciones} />
                <Field label="Próxima Cita" value={selected.proxima_cita?.split("T")[0]} />
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                >
                  Cerrar
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Page>
  );
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-400">{label}</p>
      <p className="mt-1 text-sm text-gray-700 dark:text-dark-100">{value}</p>
    </div>
  );
}
