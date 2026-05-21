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
  TableCellsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { useAuthContext } from "app/contexts/auth/context";
import { toast } from "sonner";
import { formatHora } from "utils/formatHora";
import dayjs from "dayjs";
import "dayjs/locale/es";
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

dayjs.locale("es");

const emptyHistoria = {
  motivo_consulta: "",
  diagnostico: "",
  observaciones: "",
  recomendaciones: "",
  proxima_cita: "",
};

const estadoConfig = {
  Programada: { color: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400", dot: "bg-amber-500", Icon: ClockIcon },
  Confirmada: { color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400", dot: "bg-blue-500", Icon: CalendarDaysIcon },
  Completada: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", dot: "bg-emerald-500", Icon: CheckCircleIcon },
  Cancelada: { color: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400", dot: "bg-red-400", Icon: XCircleIcon },
  No_Asistio: { color: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400", dot: "bg-red-400", Icon: XCircleIcon },
  En_Curso: { color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400", dot: "bg-indigo-500", Icon: ArrowTrendingUpIcon },
};

export default function OdontologoMisCitas() {
  const { user } = useAuthContext();
  const [citas, setCitas] = useState([]);
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [vista, setVista] = useState("calendario"); // "calendario" | "tabla"

  // ── Modal unificado: reemplaza selectedCita + showHistoriaModal + citaCompletada ──
  const [modalCita, setModalCita] = useState(null);
  const [modalStep, setModalStep] = useState("detalle"); // "detalle" | "historia"
  const [historiaForm, setHistoriaForm] = useState(emptyHistoria);
  const [savingEstado, setSavingEstado] = useState(false);
  const [savingHistoria, setSavingHistoria] = useState(false);

  // Calendario
  const [calMonth, setCalMonth] = useState(dayjs());
  const [calCitas, setCalCitas] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  // Fetch citas para tabla
  const fetchCitas = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`/citas/doctor/${user.id}`);
      if (Array.isArray(res.data.resultado)) setCitas(res.data.resultado);
    } catch {
      // silencioso
    }
  }, [user?.id]);

  // Fetch citas para calendario (rango mensual)
  const fetchCalCitas = useCallback(async () => {
    if (!user?.id) return;
    const desde = calMonth.startOf("month").format("YYYY-MM-DD");
    const hasta = calMonth.endOf("month").format("YYYY-MM-DD");
    try {
      const res = await axios.get(`/citas/doctor/${user.id}/rango?desde=${desde}&hasta=${hasta}`);
      if (Array.isArray(res.data.resultado)) setCalCitas(res.data.resultado);
    } catch {
      // silencioso
    }
  }, [user?.id, calMonth]);

  useEffect(() => { fetchCitas(); }, [fetchCitas]);
  useEffect(() => { fetchCalCitas(); }, [fetchCalCitas]);

  // Abre el modal en paso "detalle" con la cita seleccionada
  const openModal = (cita) => {
    setModalCita(cita);
    setModalStep("detalle");
    setHistoriaForm({ ...emptyHistoria, motivo_consulta: cita.motivo_consulta || "" });
  };

  // Cierra y limpia el modal completamente
  const closeModal = () => {
    setModalCita(null);
    setModalStep("detalle");
    setHistoriaForm(emptyHistoria);
  };

  const handleCambiarEstado = async (citaId, nuevoEstado, citaObj = null) => {
    setSavingEstado(true);
    try {
      const res = await axios.patch(`/citas/${citaId}/estado`, { estado: nuevoEstado });
      if (res.data.resultado && typeof res.data.resultado === "string") {
        toast.error(res.data.resultado);
        return;
      }
      toast.success(`Cita marcada como ${nuevoEstado.replace("_", " ")}`);
      fetchCitas();
      fetchCalCitas();

      if (nuevoEstado === "Completada") {
        // citaObj viene de la tabla; modalCita viene del modal — siempre abrimos historia
        const src = citaObj || modalCita;
        if (src) {
          setModalCita({ ...src, estado: nuevoEstado, tiene_historia: 0 });
          setHistoriaForm({ ...emptyHistoria, motivo_consulta: src.motivo_consulta || "" });
        }
        setModalStep("historia");
      } else if (nuevoEstado === "Cancelada" || nuevoEstado === "No_Asistio") {
        closeModal();
      } else if (!citaObj && modalCita?.id === citaId) {
        // Acción hecha desde el modal → actualizar estado en el modal sin cerrar
        setModalCita((prev) => prev ? { ...prev, estado: nuevoEstado } : null);
      }
    } catch {
      toast.error("Error al cambiar estado");
    } finally {
      setSavingEstado(false);
    }
  };

  const handleHistoriaSubmit = async (e) => {
    e.preventDefault();
    if (!modalCita) return;
    setSavingHistoria(true);
    const payload = {
      paciente_id: modalCita.paciente_id,
      cita_id: modalCita.id,
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
      closeModal();
    } catch {
      toast.error("Error al crear historia clínica");
    } finally {
      setSavingHistoria(false);
    }
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

  // ═══ TanStack Table ═══
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
    { accessorKey: "especialidad_nombre", header: "Especialidad" },
    { accessorKey: "motivo_consulta", header: "Motivo", cell: ({ getValue }) => getValue() || "—" },
    { accessorKey: "consultorio", header: "Consultorio", cell: ({ getValue }) => getValue() || "—" },
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
          <div className="flex flex-wrap gap-1.5">
            {accionesEstado(cita).map((acc) => (
              <button
                key={acc.estado}
                onClick={() => handleCambiarEstado(cita.id, acc.estado, acc.estado === "Completada" ? cita : null)}
                disabled={savingEstado}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors disabled:opacity-60 ${acc.color}`}
              >
                {acc.label}
              </button>
            ))}
            {cita.estado === "Completada" && !cita.tiene_historia && (
              <button
                onClick={() => openModal(cita)}
                className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
              >
                Registrar Historia
              </button>
            )}
            {cita.estado === "Completada" && cita.tiene_historia && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:border-emerald-500/20 dark:text-emerald-500">
                <CheckCircleIcon className="size-3.5" /> Historia ✓
              </span>
            )}
          </div>
        );
      },
    },
  ], [savingEstado]);

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

  // ═══ Calendario ═══
  const today = dayjs();
  const startOfMonth = calMonth.startOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = calMonth.daysInMonth();
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Agrupar citas por fecha para el calendario
  const citasPorDia = useMemo(() => {
    const map = {};
    const source = filtro === "todas" ? calCitas : calCitas.filter((c) => c.estado === filtro);
    source.forEach((c) => {
      const key = (c.fecha || "").split("T")[0];
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    // Ordenar por hora dentro de cada día
    Object.values(map).forEach((arr) => arr.sort((a, b) => String(a.hora || "").localeCompare(String(b.hora || ""))));
    return map;
  }, [calCitas, filtro]);

  // Citas del día seleccionado
  const citasDelDia = selectedDay ? (citasPorDia[selectedDay] || []) : [];

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
          <div className="flex items-center gap-3">
            {/* Toggle vista */}
            <div className="flex rounded-xl border border-gray-200 dark:border-dark-500">
              <button
                onClick={() => setVista("calendario")}
                className={`inline-flex items-center gap-1.5 rounded-l-xl px-3 py-2 text-xs font-medium transition-colors ${
                  vista === "calendario" ? "bg-teal-600 text-white" : "text-gray-500 hover:bg-gray-50 dark:text-dark-300 dark:hover:bg-dark-600"
                }`}
              >
                <CalendarDaysIcon className="size-3.5" /> Calendario
              </button>
              <button
                onClick={() => setVista("tabla")}
                className={`inline-flex items-center gap-1.5 rounded-r-xl px-3 py-2 text-xs font-medium transition-colors ${
                  vista === "tabla" ? "bg-teal-600 text-white" : "text-gray-500 hover:bg-gray-50 dark:text-dark-300 dark:hover:bg-dark-600"
                }`}
              >
                <TableCellsIcon className="size-3.5" /> Tabla
              </button>
            </div>
            {vista === "tabla" && (
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100 dark:focus:border-teal-400 dark:focus:bg-dark-700 sm:w-56"
                />
              </div>
            )}
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

        {/* ═══════════ VISTA CALENDARIO ═══════════ */}
        {vista === "calendario" && (
          <div className="mt-5 space-y-5">
            {/* Navegación mes */}
            <Card className="rounded-xl p-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setCalMonth(calMonth.subtract(1, "month"))} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600">
                  <ChevronLeftIcon className="size-5" />
                </button>
                <h3 className="text-lg font-bold capitalize text-gray-800 dark:text-dark-50">
                  {calMonth.format("MMMM YYYY")}
                </h3>
                <button onClick={() => setCalMonth(calMonth.add(1, "month"))} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600">
                  <ChevronRightIcon className="size-5" />
                </button>
              </div>

              {/* Grid calendario */}
              <div className="mt-4 grid grid-cols-7">
                {/* Encabezados */}
                {diasSemana.map((d) => (
                  <div key={d} className="border-b border-gray-200 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-dark-500">
                    {d}
                  </div>
                ))}
                {/* Celdas vacías */}
                {Array.from({ length: startDay }).map((_, i) => (
                  <div key={`e-${i}`} className="min-h-[100px] border-b border-r border-gray-100 dark:border-dark-600" />
                ))}
                {/* Días del mes */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = calMonth.date(i + 1);
                  const dateStr = d.format("YYYY-MM-DD");
                  const dayCitas = citasPorDia[dateStr] || [];
                  const isToday = d.isSame(today, "day");
                  const isSelected = selectedDay === dateStr;

                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                      className={`min-h-[100px] cursor-pointer border-b border-r border-gray-100 p-1.5 transition-colors dark:border-dark-600 ${
                        isSelected
                          ? "bg-teal-50 dark:bg-teal-500/10"
                          : "hover:bg-gray-50 dark:hover:bg-dark-600/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                          isToday
                            ? "bg-teal-600 text-white"
                            : "text-gray-700 dark:text-dark-200"
                        }`}>
                          {i + 1}
                        </span>
                        {dayCitas.length > 0 && (
                          <span className="text-[10px] font-medium text-gray-400">{dayCitas.length}</span>
                        )}
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {dayCitas.slice(0, 3).map((c) => {
                          const cfg = estadoConfig[c.estado] || estadoConfig.Programada;
                          return (
                            <button
                              key={c.id}
                              onClick={(e) => { e.stopPropagation(); openModal(c); }}
                              className={`block w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium leading-tight ${cfg.color}`}
                            >
                              {formatHora(c.hora)} {c.paciente_nombre}
                            </button>
                          );
                        })}
                        {dayCitas.length > 3 && (
                          <p className="px-1 text-[10px] text-gray-400">+{dayCitas.length - 3} más</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="mt-3 flex flex-wrap gap-3">
                {Object.entries(estadoConfig).map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className={`size-2.5 rounded-full ${cfg.dot}`} />
                    <span className="text-[10px] text-gray-500 dark:text-dark-300">{key.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Panel lateral: citas del día seleccionado */}
            {selectedDay && (
              <Card className="rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold capitalize text-gray-800 dark:text-dark-50">
                    {dayjs(selectedDay).format("dddd D [de] MMMM")}
                  </h4>
                  <button onClick={() => setSelectedDay(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600">
                    <XMarkIcon className="size-4" />
                  </button>
                </div>
                {citasDelDia.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-400">Sin citas este día</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {citasDelDia.map((c) => {
                      const cfg = estadoConfig[c.estado] || estadoConfig.Programada;
                      const CfgIcon = cfg.Icon;
                      return (
                        <div
                          key={c.id}
                          onClick={() => openModal(c)}
                          className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 p-3 transition-all hover:border-teal-300 hover:shadow-sm dark:border-dark-500 dark:hover:border-teal-500"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex size-9 items-center justify-center rounded-lg ${cfg.color}`}>
                              <CfgIcon className="size-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 dark:text-dark-50">
                                {c.paciente_nombre} {c.paciente_apellido}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-dark-300">
                                {formatHora(c.hora)} • {c.especialidad_nombre || "General"} • Cons. {c.consultorio}
                              </p>
                            </div>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${cfg.color}`}>
                            {c.estado?.replace("_", " ")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* ═══════════ VISTA TABLA ═══════════ */}
        {vista === "tabla" && (
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
        )}

        {/* ═══ Modal Unificado: Detalle + Historia en un solo flujo ═══ */}
        {modalCita && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-700">

              {/* ── Cabecera del modal ── */}
              <div className="mb-5 flex items-center gap-3">
                {modalStep === "historia" && (
                  <button
                    onClick={() => setModalStep("detalle")}
                    className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600"
                    title="Volver al detalle"
                  >
                    <ArrowLeftIcon className="size-5" />
                  </button>
                )}
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                  modalStep === "historia"
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                    : (estadoConfig[modalCita.estado] || estadoConfig.Programada).color
                }`}>
                  {modalStep === "historia"
                    ? <ClipboardDocumentListIcon className="size-5" />
                    : (() => { const Ic = (estadoConfig[modalCita.estado] || estadoConfig.Programada).Icon; return <Ic className="size-5" />; })()
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-gray-800 dark:text-dark-50">
                    {modalStep === "historia" ? "Registrar Historia Clínica" : "Detalle de Cita"}
                  </h3>
                  <p className="truncate text-xs text-gray-400 dark:text-dark-300">
                    {modalCita.paciente_nombre} {modalCita.paciente_apellido}
                    {modalStep === "detalle" && (
                      <> &middot; <span className="font-semibold">{modalCita.estado?.replace("_", " ")}</span></>
                    )}
                  </p>
                </div>
                <button onClick={closeModal} className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600">
                  <XMarkIcon className="size-5" />
                </button>
              </div>

              {/* ── Paso 1: Detalle ── */}
              {modalStep === "detalle" && (
                <>
                  <div className="space-y-3">
                    <InfoRow label="Fecha" value={dayjs((modalCita.fecha || "").split("T")[0]).format("dddd D [de] MMMM, YYYY")} />
                    <InfoRow label="Hora" value={formatHora(modalCita.hora)} />
                    <InfoRow label="Especialidad" value={modalCita.especialidad_nombre || "General"} />
                    <InfoRow label="Consultorio" value={modalCita.consultorio} />
                    {modalCita.motivo_consulta && <InfoRow label="Motivo" value={modalCita.motivo_consulta} />}
                    {modalCita.observaciones && <InfoRow label="Observaciones" value={modalCita.observaciones} />}
                  </div>

                  {/* Indicador de siguiente paso cuando está En_Curso */}
                  {modalCita.estado === "En_Curso" && (
                    <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      Al marcar como <strong>Completada</strong> se abrirá el formulario de historia clínica directamente en este modal.
                    </p>
                  )}

                  {/* Acciones de estado */}
                  {accionesEstado(modalCita).length > 0 && (
                    <div className="mt-5 flex gap-2">
                      {accionesEstado(modalCita).map((acc) => (
                        <button
                          key={acc.estado}
                          onClick={() => handleCambiarEstado(modalCita.id, acc.estado)}
                          disabled={savingEstado}
                          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors disabled:opacity-60 ${acc.color}`}
                        >
                          {savingEstado ? "..." : acc.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Acceso a historia si la cita está completada y aún no tiene historia */}
                  {modalCita.estado === "Completada" && !modalCita.tiene_historia && (
                    <button
                      onClick={() => setModalStep("historia")}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                    >
                      <ClipboardDocumentListIcon className="size-4" />
                      Registrar Historia Clínica
                    </button>
                  )}
                  {modalCita.estado === "Completada" && modalCita.tiene_historia && (
                    <p className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircleIcon className="size-4" />
                      Historia clínica ya registrada
                    </p>
                  )}
                </>
              )}

              {/* ── Paso 2: Historia Clínica ── */}
              {modalStep === "historia" && (
                <form onSubmit={handleHistoriaSubmit} className="space-y-4">
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
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalStep("detalle")}
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-dark-500 dark:text-dark-200 dark:hover:bg-dark-600"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      disabled={savingHistoria}
                      className="flex-1 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-teal-700 disabled:opacity-60"
                    >
                      {savingHistoria ? "Guardando..." : "Guardar Historia"}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}
      </div>
    </Page>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-3">
      <span className="w-24 shrink-0 text-xs font-medium text-gray-400 dark:text-dark-400">{label}</span>
      <span className="text-sm text-gray-800 dark:text-dark-100">{value}</span>
    </div>
  );
}
