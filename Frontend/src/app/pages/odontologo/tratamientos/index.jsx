import { useEffect, useState, useCallback, useMemo } from "react";
import { Page } from "components/shared/Page";
import { Card, Table, THead, TBody, Tr, Th, Td } from "components/ui";
import {
  BeakerIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { toast } from "sonner";
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

export default function OdontologoTratamientos() {
  const [tratamientos, setTratamientos] = useState([]);
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({ estado: "", observaciones: "", fecha_finalizacion: "" });

  const fetchTratamientos = useCallback(async () => {
    try {
      const res = await axios.get("/dashboard/tratamientos-doctor");
      if (Array.isArray(res.data.resultado)) setTratamientos(res.data.resultado);
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => {
    fetchTratamientos();
  }, [fetchTratamientos]);

  const estados = ["Planificado", "En_Progreso", "Completado", "Cancelado"];

  const estadoConfig = {
    Planificado: { color: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400", Icon: ClockIcon },
    En_Progreso: { color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400", Icon: ArrowPathIcon },
    Completado: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", Icon: CheckCircleIcon },
    Cancelado: { color: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400", Icon: XMarkIcon },
  };

  // --- TanStack Table ---
  const [sorting, setSorting] = useState([]);

  const filtroFiltered = useMemo(
    () => (filtro === "todos" ? tratamientos : tratamientos.filter((t) => t.estado === filtro)),
    [tratamientos, filtro]
  );

  const columns = useMemo(() => [
    {
      accessorKey: "tratamiento_nombre",
      header: "Tratamiento",
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
      accessorKey: "fecha_inicio",
      header: "Fecha Inicio",
      cell: ({ getValue }) => getValue()?.split("T")[0] || "\u2014",
    },
    {
      accessorKey: "fecha_finalizacion",
      header: "Fecha Fin",
      cell: ({ getValue }) => getValue()?.split("T")[0] || "\u2014",
    },
    {
      accessorKey: "precio_aplicado",
      header: "Precio",
      cell: ({ getValue }) => {
        const v = getValue();
        return v ? <span className="font-medium text-emerald-600 dark:text-emerald-400">${Number(v).toLocaleString()}</span> : "\u2014";
      },
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => {
        const est = getValue();
        const cfg = estadoConfig[est] || estadoConfig.Planificado;
        const CfgIcon = cfg.Icon;
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${cfg.color}`}>
            <CfgIcon className="size-3.5" />
            {est?.replace("_", " ")}
          </span>
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => (
        <button onClick={() => handleEdit(row.original)} className="rounded-lg bg-teal-50 p-2 text-teal-600 transition-colors hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20">
          <PencilSquareIcon className="size-4" />
        </button>
      ),
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

  const tabs = [
    { id: "todos", label: "Todos" },
    { id: "Planificado", label: "Planificados" },
    { id: "En_Progreso", label: "En Progreso" },
    { id: "Completado", label: "Completados" },
    { id: "Cancelado", label: "Cancelados" },
  ];

  const handleEdit = (t) => {
    setEditItem(t);
    setEditForm({
      estado: t.estado || "",
      observaciones: t.observaciones || "",
      fecha_finalizacion: t.fecha_finalizacion?.split("T")[0] || "",
    });
    setShowEdit(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        historia_clinica_id: editItem.historia_clinica_id,
        tratamiento_id: editItem.tratamiento_id,
        estado: editForm.estado,
        fecha_inicio: editItem.fecha_inicio,
        fecha_finalizacion: editForm.fecha_finalizacion || null,
        precio_aplicado: editItem.precio_aplicado,
        observaciones: editForm.observaciones,
      };
      const res = await axios.put(`/historia-tratamientos/${editItem.id}`, payload);
      if (res.data.resultado && typeof res.data.resultado === "string") {
        toast.error(res.data.resultado);
        return;
      }
      toast.success(res.data.informacion || "Tratamiento actualizado");
      setShowEdit(false);
      setEditItem(null);
      fetchTratamientos();
    } catch {
      toast.error("Error al actualizar");
    }
  };

  return (
    <Page title="Tratamientos">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md">
              <BeakerIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Mis Tratamientos</h2>
              <p className="text-sm text-gray-400 dark:text-dark-300">{tratamientos.length} tratamiento(s)</p>
            </div>
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tratamiento..."
              className="rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100 dark:focus:border-teal-400 dark:focus:bg-dark-700 sm:w-64"
            />
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
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-600 dark:text-dark-200 dark:hover:bg-dark-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
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
                      <BeakerIcon className="mx-auto size-10 text-gray-200 dark:text-dark-500" />
                      <p className="mt-2 text-sm text-gray-400 dark:text-dark-300">
                        {search ? "Sin resultados" : "No tienes tratamientos registrados"}
                      </p>
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

        {/* Modal Editar Estado */}
        {showEdit && editItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-700">
              <button onClick={() => { setShowEdit(false); setEditItem(null); }} className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600">
                <XMarkIcon className="size-5" />
              </button>
              <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">Actualizar Tratamiento</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">{editItem.tratamiento_nombre} — {editItem.paciente_nombre} {editItem.paciente_apellido}</p>
              <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-200">Estado</label>
                  <select
                    value={editForm.estado}
                    onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                  >
                    {estados.map((e) => (
                      <option key={e} value={e}>{e.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-200">Fecha de Finalización</label>
                  <input
                    type="date"
                    value={editForm.fecha_finalizacion}
                    onChange={(e) => setEditForm({ ...editForm, fecha_finalizacion: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-200">Observaciones</label>
                  <textarea
                    value={editForm.observaciones}
                    onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowEdit(false); setEditItem(null); }}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-dark-500 dark:text-dark-200 dark:hover:bg-dark-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-teal-700"
                  >
                    Guardar
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
