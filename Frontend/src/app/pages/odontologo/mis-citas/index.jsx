import { useEffect, useState, useCallback, useMemo } from "react";
import { Page } from "components/shared/Page";
import { Card, Table, THead, TBody, Tr, Th, Td } from "components/ui";
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { useAuthContext } from "app/contexts/auth/context";
import { toast } from "sonner";
import { formatHora } from "utils/formatHora";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { TableSortIcon } from "components/shared/table/TableSortIcon";

const emptyHistoria = {
  motivo_consulta: "",
  diagnostico: "",
  observaciones: "",
  recomendaciones: "",
  proxima_cita: "",
};

export default function OdontologoMisCitas() {
  const { user } = useAuthContext();
  const [citas, setCitas] = useState([]);
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [showHistoriaModal, setShowHistoriaModal] = useState(false);
  const [citaCompletada, setCitaCompletada] = useState(null);
  const [historiaForm, setHistoriaForm] = useState(emptyHistoria);

  const fetchCitas = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`/citas/doctor/${user.id}`);
      if (Array.isArray(res.data.resultado)) setCitas(res.data.resultado);
    } catch {
      // silencioso
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  const handleCambiarEstado = async (citaId, nuevoEstado) => {
    try {
      const res = await axios.patch(`/citas/${citaId}/estado`, { estado: nuevoEstado });
      if (res.data.resultado && typeof res.data.resultado === "string") {
        toast.error(res.data.resultado);
        return;
      }
      toast.success(`Cita marcada como ${nuevoEstado.replace("_", " ")}`);
      fetchCitas();

      if (nuevoEstado === "Completada") {
        const cita = citas.find((c) => c.id === citaId);
        if (cita) {
          setCitaCompletada(cita);
          setHistoriaForm({ ...emptyHistoria, motivo_consulta: cita.motivo_consulta || "" });
          setShowHistoriaModal(true);
        }
      }
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  const handleHistoriaSubmit = async (e) => {
    e.preventDefault();
    if (!citaCompletada) return;
    const payload = {
      paciente_id: citaCompletada.paciente_id,
      cita_id: citaCompletada.id,
      usuario_id: user?.id,
      fecha_atencion: new Date().toISOString().split("T")[0],
      ...historiaForm,
      proxima_cita: historiaForm.proxima_cita || null,
    };
    try {
      const res = await axios.post("/historias-clinicas", payload);
      if (res.data.resultado && typeof res.data.resultado === "string") {
        toast.error(res.data.resultado);
        return;
      }
      toast.success(res.data.informacion || "Historia clínica creada");
      setShowHistoriaModal(false);
      setCitaCompletada(null);
      setHistoriaForm(emptyHistoria);
    } catch {
      toast.error("Error al crear historia clínica");
    }
  };

  const handleSkipHistoria = () => {
    setShowHistoriaModal(false);
    setCitaCompletada(null);
    setHistoriaForm(emptyHistoria);
  };

  const estadoConfig = {
    Programada: { color: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400", Icon: ClockIcon },
    Confirmada: { color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400", Icon: CalendarDaysIcon },
    Completada: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", Icon: CheckCircleIcon },
    Cancelada: { color: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400", Icon: XCircleIcon },
    No_Asistio: { color: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400", Icon: XCircleIcon },
    En_Curso: { color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400", Icon: ArrowTrendingUpIcon },
  };

  const tabs = [
    { id: "todas", label: "Todas" },
    { id: "Programada", label: "Programadas" },
    { id: "Confirmada", label: "Confirmadas" },
    { id: "En_Curso", label: "En Curso" },
    { id: "Completada", label: "Completadas" },
    { id: "Cancelada", label: "Canceladas" },
  ];

  const accionesEstado = (cita) => {
    const acciones = [];
    if (cita.estado === "Programada") {
      acciones.push({ label: "Confirmar", estado: "Confirmada", color: "bg-blue-600 hover:bg-blue-700" });
      acciones.push({ label: "Cancelar", estado: "Cancelada", color: "bg-red-600 hover:bg-red-700" });
    }
    if (cita.estado === "Confirmada") {
      acciones.push({ label: "Iniciar", estado: "En_Curso", color: "bg-indigo-600 hover:bg-indigo-700" });
      acciones.push({ label: "No Asistió", estado: "No_Asistio", color: "bg-red-600 hover:bg-red-700" });
    }
    if (cita.estado === "En_Curso") {
      acciones.push({ label: "Completar", estado: "Completada", color: "bg-emerald-600 hover:bg-emerald-700" });
    }
    return acciones;
  };

  // --- TanStack Table ---
  const [sorting, setSorting] = useState([]);

  const filtroFiltered = useMemo(
    () => citas.filter((c) => filtro === "todas" || c.estado === filtro),
    [citas, filtro]
  );

  const columns = useMemo(() => [
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ getValue }) => getValue()?.split("T")[0] || "",
    },
    {
      accessorKey: "hora",
      header: "Hora",
      cell: ({ getValue }) => formatHora(getValue()),
    },
    {
      id: "paciente",
      header: "Paciente",
      accessorFn: (row) => `${row.paciente_nombre || ""} ${row.paciente_apellido || ""}`,
    },
    {
      accessorKey: "especialidad_nombre",
      header: "Especialidad",
    },
    {
      accessorKey: "motivo_consulta",
      header: "Motivo",
      cell: ({ getValue }) => getValue() || "—",
    },
    {
      accessorKey: "consultorio",
      header: "Consultorio",
      cell: ({ getValue }) => getValue() || "—",
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => {
        const estado = getValue();
        const cfg = estadoConfig[estado] || estadoConfig.Programada;
        const CfgIcon = cfg.Icon;
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
            <CfgIcon className="size-3.5" />
            {estado?.replace("_", " ")}
          </span>
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => {
        const cita = row.original;
        return (
          <div className="flex gap-1.5">
            {accionesEstado(cita).map((acc) => (
              <button
                key={acc.estado}
                onClick={() => handleCambiarEstado(cita.id, acc.estado)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors ${acc.color}`}
              >
                {acc.label}
              </button>
            ))}
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: filtroFiltered,
    columns,
    state: { globalFilter: search, sorting },
    onGlobalFilterChange: setSearch,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Mis Citas">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md">
              <CalendarDaysIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Mis Citas</h2>
              <p className="text-sm text-gray-400 dark:text-dark-300">{citas.length} cita(s) asignadas</p>
            </div>
          </div>
          {/* Búsqueda */}
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar paciente, motivo..."
              className="rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100 dark:focus:border-teal-400 dark:focus:bg-dark-700 sm:w-64"
            />
          </div>
        </div>

        {/* Tabs de estado */}
        <div className="mt-5 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltro(tab.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filtro === tab.id
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-600 dark:text-dark-200 dark:hover:bg-dark-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Citas Table */}
        <Card className="mt-5 rounded-xl">
          <div className="scrollbar-sm min-w-full overflow-x-auto">
            <Table hoverable className="w-full text-left">
              <THead>
                {table.getHeaderGroups().map((hg) => (
                  <Tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <Th key={header.id} className="cursor-pointer select-none whitespace-nowrap px-4 py-3" onClick={header.column.getToggleSortingHandler()}>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && <TableSortIcon sorted={header.column.getIsSorted()} />}
                        </div>
                      </Th>
                    ))}
                  </Tr>
                ))}
              </THead>
              <TBody>
                {table.getRowModel().rows.length === 0 ? (
                  <Tr>
                    <Td colSpan={columns.length} className="py-10 text-center">
                      <CalendarDaysIcon className="mx-auto size-10 text-gray-200 dark:text-dark-500" />
                      <p className="mt-2 text-sm text-gray-400 dark:text-dark-300">No se encontraron citas</p>
                    </Td>
                  </Tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <Tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <Td key={cell.id} className="whitespace-nowrap px-4 py-3 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Td>
                      ))}
                    </Tr>
                  ))
                )}
              </TBody>
            </Table>
          </div>
          <div className="border-t border-gray-200 px-4 py-4 dark:border-dark-500">
            <PaginationSection table={table} />
          </div>
        </Card>

        {/* Modal Historia Clínica al Completar */}
        {showHistoriaModal && citaCompletada && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-700">
              <button onClick={handleSkipHistoria} className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600">
                <XMarkIcon className="size-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <ClipboardDocumentListIcon className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">Registrar Historia Clínica</h3>
                  <p className="text-xs text-gray-400 dark:text-dark-300">
                    Paciente: {citaCompletada.paciente_nombre} {citaCompletada.paciente_apellido}
                  </p>
                </div>
              </div>
              <form onSubmit={handleHistoriaSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-200">Motivo de Consulta *</label>
                  <textarea
                    value={historiaForm.motivo_consulta}
                    onChange={(e) => setHistoriaForm({ ...historiaForm, motivo_consulta: e.target.value })}
                    required
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-200">Diagnóstico *</label>
                  <textarea
                    value={historiaForm.diagnostico}
                    onChange={(e) => setHistoriaForm({ ...historiaForm, diagnostico: e.target.value })}
                    required
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-200">Observaciones</label>
                  <textarea
                    value={historiaForm.observaciones}
                    onChange={(e) => setHistoriaForm({ ...historiaForm, observaciones: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-200">Recomendaciones</label>
                  <textarea
                    value={historiaForm.recomendaciones}
                    onChange={(e) => setHistoriaForm({ ...historiaForm, recomendaciones: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-200">Próxima Cita</label>
                  <input
                    type="date"
                    value={historiaForm.proxima_cita}
                    onChange={(e) => setHistoriaForm({ ...historiaForm, proxima_cita: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSkipHistoria}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-dark-500 dark:text-dark-200 dark:hover:bg-dark-600"
                  >
                    Omitir
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-teal-700"
                  >
                    Guardar Historia
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
