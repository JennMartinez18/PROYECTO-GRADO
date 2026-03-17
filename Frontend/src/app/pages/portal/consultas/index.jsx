import { useEffect, useState } from "react";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import {
  MagnifyingGlassIcon,
  BeakerIcon,
  CurrencyDollarIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";

const gradients = [
  "from-indigo-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
];

export default function Consultas() {
  const [especialidades, setEspecialidades] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [search, setSearch] = useState("");
  const [filtroEsp, setFiltroEsp] = useState("todas");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [espR, tratR] = await Promise.all([
          axios.get("/especialidades"),
          axios.get("/tratamientos"),
        ]);
        if (Array.isArray(espR.data.resultado)) setEspecialidades(espR.data.resultado);
        if (Array.isArray(tratR.data.resultado)) setTratamientos(tratR.data.resultado.filter((t) => t.activo));
      } catch {
        // silencioso
      }
    };
    fetchData();
  }, []);

  const filtered = tratamientos.filter((t) => {
    const matchSearch = t.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      t.descripcion?.toLowerCase().includes(search.toLowerCase());
    const matchEsp = filtroEsp === "todas" || String(t.especialidad_id) === filtroEsp;
    return matchSearch && matchEsp;
  });

  return (
    <Page title="Servicios y Precios">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
            <SparklesIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Servicios y Precios</h2>
            <p className="text-sm text-gray-400 dark:text-dark-300">Conoce nuestros tratamientos disponibles</p>
          </div>
        </div>

        {/* Especialidades cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {especialidades.map((esp, i) => (
            <Card
              key={esp.id}
              className={`cursor-pointer rounded-xl p-4 transition-all hover:shadow-lg ${
                filtroEsp === String(esp.id) ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-dark-700" : ""
              }`}
              onClick={() => setFiltroEsp(filtroEsp === String(esp.id) ? "todas" : String(esp.id))}
            >
              <div className={`flex size-10 items-center justify-center rounded-lg bg-gradient-to-br ${gradients[i % gradients.length]} text-white`}>
                <BeakerIcon className="size-5" />
              </div>
              <h4 className="mt-3 text-sm font-semibold text-gray-800 dark:text-dark-50">{esp.nombre}</h4>
              <p className="mt-1 text-xs text-gray-400 dark:text-dark-300 line-clamp-2">{esp.descripcion}</p>
              {esp.precio_base && (
                <p className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Desde ${Number(esp.precio_base).toLocaleString()}
                </p>
              )}
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="mt-6">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tratamiento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-violet-500/20"
            />
          </div>
        </div>

        {/* Tratamientos list */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <Card className="col-span-full flex flex-col items-center rounded-xl py-12 text-center">
              <BeakerIcon className="size-14 text-gray-300 dark:text-dark-400" />
              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-dark-300">No se encontraron tratamientos</p>
            </Card>
          ) : (
            filtered.map((t) => {
              const espNombre = especialidades.find((e) => e.id === t.especialidad_id)?.nombre || "General";
              return (
                <Card key={t.id} className="group overflow-hidden rounded-xl transition-all hover:shadow-lg">
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                          <BeakerIcon className="size-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-50">{t.nombre}</h4>
                          <span className="text-xs text-gray-400 dark:text-dark-300">{espNombre}</span>
                        </div>
                      </div>
                    </div>
                    {t.descripcion && (
                      <p className="mt-3 text-xs text-gray-500 dark:text-dark-300">{t.descripcion}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        <CurrencyDollarIcon className="size-4" />
                        ${Number(t.precio).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-dark-300">
                        <ClockIcon className="size-3.5" />
                        {t.duracion_sesiones} sesión{t.duracion_sesiones > 1 ? "es" : ""}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Page>
  );
}
