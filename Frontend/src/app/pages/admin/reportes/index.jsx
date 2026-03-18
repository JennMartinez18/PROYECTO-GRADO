import { useEffect, useState, useCallback, useMemo } from "react";
import { Page } from "components/shared/Page";
import { Card, Table, THead, TBody, Tr, Th, Td } from "components/ui";
import {
  ChartBarIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  BeakerIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { TableSortIcon } from "components/shared/table/TableSortIcon";

// ─── Constantes ───
const MESES = [...Array(12)].map((_, i) => ({
  value: i + 1,
  label: new Date(2000, i).toLocaleString("es-ES", { month: "long" }),
}));
const ANIOS = [2023, 2024, 2025, 2026, 2027];

const tabs = [
  { id: "ingresos", label: "Ingresos", Icon: BanknotesIcon },
  { id: "citas", label: "Citas", Icon: CalendarDaysIcon },
  { id: "tratamientos", label: "Tratamientos", Icon: BeakerIcon },
  { id: "pacientes", label: "Pacientes", Icon: UserGroupIcon },
  { id: "odontologos", label: "Odontólogos", Icon: UserIcon },
];

// ─── Helpers ───
const fmt = (d) => d.toISOString().split("T")[0];
const hoy = new Date();
const hace30 = new Date(hoy);
hace30.setDate(hace30.getDate() - 30);

const BarRow = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 dark:text-dark-100">{label}</span>
        <span className="font-semibold text-gray-800 dark:text-dark-50">
          {value} ({pct}%)
        </span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-dark-500">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const estadoColorCita = (e) => {
  if (e === "Completada") return "bg-emerald-500";
  if (e === "Cancelada" || e === "No_Asistio") return "bg-red-500";
  if (e === "En_Curso") return "bg-blue-500";
  if (e === "Confirmada") return "bg-cyan-500";
  return "bg-amber-500";
};

const estadoColorTrat = (e) => {
  if (e === "Completado") return "bg-emerald-500";
  if (e === "Cancelado" || e === "Suspendido") return "bg-red-500";
  if (e === "En_Progreso") return "bg-blue-500";
  return "bg-amber-500";
};

// ─── Componente Principal ───
export default function Reportes() {
  const [tab, setTab] = useState("ingresos");

  return (
    <Page title="Reportes">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
            <ChartBarIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Reportes</h2>
            <p className="text-sm text-gray-400 dark:text-dark-300">Análisis y estadísticas del consultorio</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-600 dark:text-dark-200 dark:hover:bg-dark-500"
              }`}
            >
              <t.Icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="mt-5">
          {tab === "ingresos" && <ReporteIngresos />}
          {tab === "citas" && <ReporteCitas />}
          {tab === "tratamientos" && <ReporteTratamientos />}
          {tab === "pacientes" && <ReportePacientes />}
          {tab === "odontologos" && <ReporteOdontologos />}
        </div>
      </div>
    </Page>
  );
}

// ════════════════════════════════════════════════
// TAB 1: INGRESOS
// ════════════════════════════════════════════════
function ReporteIngresos() {
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [data, setData] = useState(null);
  const [sorting, setSorting] = useState([]);

  const fetchData = useCallback(() => {
    axios.get(`/reportes/ingresos?mes=${mes}&anio=${anio}`)
      .then((r) => { if (r.data.resultado && typeof r.data.resultado === "object") setData(r.data.resultado); })
      .catch(() => {});
  }, [mes, anio]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = useMemo(() => [
    { accessorKey: "numero_factura", header: "N° Factura" },
    {
      id: "paciente",
      header: "Paciente",
      accessorFn: (row) => `${row.paciente_nombre} ${row.paciente_apellido}`,
    },
    {
      accessorKey: "total",
      header: "Monto",
      cell: ({ getValue }) => <span className="font-semibold text-emerald-600 dark:text-emerald-400">${Number(getValue()).toLocaleString()}</span>,
    },
    { accessorKey: "metodo_pago", header: "Método" },
    {
      accessorKey: "fecha_pago",
      header: "Fecha Pago",
      cell: ({ getValue }) => getValue()?.split("T")[0] || "—",
    },
  ], []);

  const table = useReactTable({
    data: data?.facturas || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <Card className="flex flex-wrap items-center gap-3 rounded-xl p-4">
        <label className="text-sm font-medium text-gray-600 dark:text-dark-200">Período:</label>
        <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm capitalize dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100">
          {MESES.map((m) => <option key={m.value} value={m.value} className="capitalize">{m.label}</option>)}
        </select>
        <select value={anio} onChange={(e) => setAnio(Number(e.target.value))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100">
          {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </Card>

      {data && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="rounded-xl p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-dark-300">Total Ingresos</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">${Number(data.total_ingresos).toLocaleString()}</p>
            </Card>
            <Card className="rounded-xl p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-dark-300">Facturas Pagadas</p>
              <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-dark-50">{data.facturas?.length || 0}</p>
            </Card>
            <Card className="rounded-xl p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-dark-300">Pendientes</p>
              <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{data.pendientes_cantidad} <span className="text-base font-normal text-gray-400">(${Number(data.pendientes_monto).toLocaleString()})</span></p>
            </Card>
          </div>

          {/* Por método de pago */}
          {data.por_metodo?.length > 0 && (
            <Card className="rounded-xl p-5">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-50">Por Método de Pago</h4>
              <div className="mt-3 space-y-2.5">
                {data.por_metodo.map((m) => (
                  <BarRow key={m.metodo_pago} label={m.metodo_pago} value={m.cantidad} total={data.facturas.length} color="bg-indigo-500" />
                ))}
              </div>
            </Card>
          )}

          {/* Tabla de facturas */}
          <Card className="rounded-xl">
            <div className="border-b border-gray-200 px-5 py-3 dark:border-dark-500">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-50">Detalle de Facturas Pagadas</h4>
            </div>
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
                    <Tr><Td colSpan={columns.length} className="py-8 text-center text-sm text-gray-400">Sin facturas en este período</Td></Tr>
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
            <div className="border-t border-gray-200 px-4 py-3 dark:border-dark-500">
              <PaginationSection table={table} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// TAB 2: CITAS
// ════════════════════════════════════════════════
function ReporteCitas() {
  const [inicio, setInicio] = useState(fmt(hace30));
  const [fin, setFin] = useState(fmt(hoy));
  const [data, setData] = useState(null);

  const fetchData = useCallback(() => {
    if (!inicio || !fin) return;
    axios.get(`/reportes/citas?fecha_inicio=${inicio}&fecha_fin=${fin}`)
      .then((r) => { if (r.data.resultado && typeof r.data.resultado === "object") setData(r.data.resultado); })
      .catch(() => {});
  }, [inicio, fin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-center gap-3 rounded-xl p-4">
        <label className="text-sm font-medium text-gray-600 dark:text-dark-200">Desde:</label>
        <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100" />
        <label className="text-sm font-medium text-gray-600 dark:text-dark-200">Hasta:</label>
        <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100" />
      </Card>

      {data && (
        <>
          <Card className="rounded-xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-dark-300">Total de Citas</p>
            <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-50">{data.total_citas}</p>
          </Card>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Por estado */}
            <Card className="rounded-xl p-5">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-50">Por Estado</h4>
              <div className="mt-3 space-y-2.5">
                {(data.por_estado || []).map((d) => (
                  <BarRow key={d.estado} label={d.estado?.replace("_", " ")} value={d.total} total={data.total_citas} color={estadoColorCita(d.estado)} />
                ))}
              </div>
            </Card>

            {/* Por especialidad */}
            <Card className="rounded-xl p-5">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-50">Por Especialidad</h4>
              <div className="mt-3 space-y-2.5">
                {(data.por_especialidad || []).map((d) => (
                  <BarRow key={d.especialidad} label={d.especialidad} value={d.total} total={data.total_citas} color="bg-violet-500" />
                ))}
              </div>
            </Card>

            {/* Por odontólogo */}
            <Card className="rounded-xl p-5">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-50">Por Odontólogo</h4>
              <div className="mt-3 space-y-2.5">
                {(data.por_odontologo || []).map((d) => (
                  <BarRow key={d.odontologo} label={d.odontologo} value={d.total} total={data.total_citas} color="bg-teal-500" />
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// TAB 3: TRATAMIENTOS
// ════════════════════════════════════════════════
function ReporteTratamientos() {
  const [data, setData] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [sortingCat, setSortingCat] = useState([]);

  useEffect(() => {
    axios.get("/reportes/tratamientos")
      .then((r) => { if (r.data.resultado && typeof r.data.resultado === "object") setData(r.data.resultado); })
      .catch(() => {});
  }, []);

  const columns = useMemo(() => [
    { accessorKey: "nombre", header: "Tratamiento" },
    { accessorKey: "veces_aplicado", header: "Veces Aplicado" },
    {
      accessorKey: "ingresos_total",
      header: "Ingresos",
      cell: ({ getValue }) => <span className="font-semibold text-emerald-600 dark:text-emerald-400">${Number(getValue()).toLocaleString()}</span>,
    },
  ], []);

  const columnsCatalogo = useMemo(() => [
    { accessorKey: "nombre", header: "Tratamiento" },
    { accessorKey: "especialidad", header: "Especialidad" },
    {
      accessorKey: "precio",
      header: "Precio",
      cell: ({ getValue }) => <span className="font-semibold text-emerald-600 dark:text-emerald-400">${Number(getValue()).toLocaleString()}</span>,
    },
    { accessorKey: "duracion_sesiones", header: "Sesiones" },
  ], []);

  const table = useReactTable({
    data: data?.mas_aplicados || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const tableCatalogo = useReactTable({
    data: data?.catalogo || [],
    columns: columnsCatalogo,
    state: { sorting: sortingCat },
    onSortingChange: setSortingCat,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-5">
      {data && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="rounded-xl p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-dark-300">Ingresos por Tratamientos</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">${Number(data.ingresos_total).toLocaleString()}</p>
            </Card>
            <Card className="rounded-xl p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-dark-300">Activos</p>
              <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{data.activos}</p>
            </Card>
            <Card className="rounded-xl p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-dark-300">Completados</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{data.completados}</p>
            </Card>
          </div>

          {/* Por estado */}
          {data.por_estado?.length > 0 && (
            <Card className="rounded-xl p-5">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-50">Distribución por Estado</h4>
              <div className="mt-3 space-y-2.5">
                {data.por_estado.map((d) => {
                  const total = data.por_estado.reduce((s, x) => s + x.total, 0);
                  return <BarRow key={d.estado} label={d.estado?.replace("_", " ")} value={d.total} total={total} color={estadoColorTrat(d.estado)} />;
                })}
              </div>
            </Card>
          )}

          {/* Tabla top tratamientos */}
          {data.mas_aplicados?.length > 0 && (
            <Card className="rounded-xl">
              <div className="border-b border-gray-200 px-5 py-3 dark:border-dark-500">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-50">Tratamientos Más Aplicados</h4>
              </div>
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
                    {table.getRowModel().rows.map((row) => (
                      <Tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <Td key={cell.id} className="whitespace-nowrap px-4 py-3 text-sm">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Td>
                        ))}
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </div>
              <div className="border-t border-gray-200 px-4 py-3 dark:border-dark-500">
                <PaginationSection table={table} />
              </div>
            </Card>
          )}

          {/* Catálogo de tratamientos disponibles */}
          {data.catalogo?.length > 0 && (
            <Card className="rounded-xl">
              <div className="border-b border-gray-200 px-5 py-3 dark:border-dark-500">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-50">Catálogo de Tratamientos Disponibles</h4>
              </div>
              <div className="scrollbar-sm min-w-full overflow-x-auto">
                <Table hoverable className="w-full text-left">
                  <THead>
                    {tableCatalogo.getHeaderGroups().map((hg) => (
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
                    {tableCatalogo.getRowModel().rows.map((row) => (
                      <Tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <Td key={cell.id} className="whitespace-nowrap px-4 py-3 text-sm">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Td>
                        ))}
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </div>
              <div className="border-t border-gray-200 px-4 py-3 dark:border-dark-500">
                <PaginationSection table={tableCatalogo} />
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// TAB 4: PACIENTES
// ════════════════════════════════════════════════
function ReportePacientes() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("/reportes/pacientes")
      .then((r) => { if (r.data.resultado && typeof r.data.resultado === "object") setData(r.data.resultado); })
      .catch(() => {});
  }, []);

  const edadLabels = [
    { key: "menores", label: "Menores de 18", color: "bg-cyan-500" },
    { key: "jovenes", label: "18 – 30 años", color: "bg-blue-500" },
    { key: "adultos", label: "31 – 50 años", color: "bg-violet-500" },
    { key: "mayores", label: "Mayores de 50", color: "bg-amber-500" },
    { key: "sin_fecha", label: "Sin fecha reg.", color: "bg-gray-400" },
  ];

  return (
    <div className="space-y-5">
      {data && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="rounded-xl p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-dark-300">Pacientes Activos</p>
              <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-50">{data.total}</p>
            </Card>
            <Card className="rounded-xl p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-dark-300">Nuevos Este Mes</p>
              <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">{data.nuevos_mes}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Género */}
            <Card className="rounded-xl p-5">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-50">Por Género</h4>
              <div className="mt-3 space-y-2.5">
                {(data.por_genero || []).map((d) => (
                  <BarRow key={d.genero} label={d.genero} value={d.total} total={data.total} color={d.genero === "Masculino" ? "bg-blue-500" : d.genero === "Femenino" ? "bg-pink-500" : "bg-gray-400"} />
                ))}
              </div>
            </Card>

            {/* Tipo sangre */}
            <Card className="rounded-xl p-5">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-50">Por Tipo de Sangre</h4>
              <div className="mt-3 space-y-2.5">
                {(data.por_tipo_sangre || []).map((d) => (
                  <BarRow key={d.tipo_sangre} label={d.tipo_sangre} value={d.total} total={data.total} color="bg-red-500" />
                ))}
              </div>
            </Card>

            {/* Rango de edad */}
            <Card className="rounded-xl p-5">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-50">Por Rango de Edad</h4>
              <div className="mt-3 space-y-2.5">
                {data.por_edad && edadLabels.map((e) => (
                  <BarRow key={e.key} label={e.label} value={data.por_edad[e.key] || 0} total={data.total} color={e.color} />
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// TAB 5: ODONTÓLOGOS
// ════════════════════════════════════════════════
function ReporteOdontologos() {
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    axios.get("/reportes/odontologos")
      .then((r) => { if (Array.isArray(r.data.resultado)) setData(r.data.resultado); })
      .catch(() => {});
  }, []);

  const columns = useMemo(() => [
    { accessorKey: "nombre", header: "Odontólogo" },
    { accessorKey: "total_citas", header: "Total Citas" },
    { accessorKey: "completadas", header: "Completadas" },
    { accessorKey: "canceladas", header: "Canceladas" },
    { accessorKey: "pacientes_atendidos", header: "Pacientes" },
    {
      id: "eficiencia",
      header: "Eficiencia",
      accessorFn: (row) => row.total_citas > 0 ? Math.round((row.completadas / row.total_citas) * 100) : 0,
      cell: ({ getValue }) => {
        const pct = getValue();
        const color = pct >= 80 ? "text-emerald-600 dark:text-emerald-400" : pct >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
        return <span className={`font-semibold ${color}`}>{pct}%</span>;
      },
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card className="rounded-xl">
      <div className="border-b border-gray-200 px-5 py-3 dark:border-dark-500">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-50">Productividad por Odontólogo</h4>
      </div>
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
              <Tr><Td colSpan={columns.length} className="py-8 text-center text-sm text-gray-400">Sin datos de odontólogos</Td></Tr>
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
      <div className="border-t border-gray-200 px-4 py-3 dark:border-dark-500">
        <PaginationSection table={table} />
      </div>
    </Card>
  );
}
