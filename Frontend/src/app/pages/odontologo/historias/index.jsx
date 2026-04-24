import { useEffect, useState, useCallback, useMemo } from "react";
import { Page } from "components/shared/Page";
import { Card, Table, THead, TBody, Tr, Th, Td } from "components/ui";
import {
  PlusIcon,
  PencilSquareIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { useAuthContext } from "app/contexts/auth/context";
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

const emptyForm = {
  paciente_id: "",
  cita_id: "",
  fecha_atencion: "",
  motivo_consulta: "",
  diagnostico: "",
  observaciones: "",
  recomendaciones: "",
};

export default function OdontologoHistorias() {
  const { user } = useAuthContext();
  const [historias, setHistorias] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [citasDoctor, setCitasDoctor] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [hR, pR, cR] = await Promise.all([
        axios.get("/dashboard/historias-doctor"),
        axios.get("/dashboard/pacientes-doctor"),
        axios.get(`/citas/doctor/${user?.id}`),
      ]);
      if (Array.isArray(hR.data.resultado)) setHistorias(hR.data.resultado);
      if (Array.isArray(pR.data.resultado)) setPacientes(pR.data.resultado);
      if (Array.isArray(cR.data.resultado)) setCitasDoctor(cR.data.resultado);
    } catch {
      // silencioso
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // --- TanStack Table ---
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(() => [
    {
      accessorKey: "fecha_atencion",
      header: "Fecha",
      cell: ({ getValue }) => getValue()?.split("T")[0] || "\u2014",
    },
    {
      id: "paciente",
      header: "Paciente",
      accessorFn: (row) => `${row.paciente_nombre || ""} ${row.paciente_apellido || ""}`,
    },
    {
      accessorKey: "motivo_consulta",
      header: "Motivo",
      cell: ({ getValue }) => (
        <span className="line-clamp-1 max-w-xs">{getValue() || "\u2014"}</span>
      ),
    },
    {
      accessorKey: "diagnostico",
      header: "Diagn\u00f3stico",
      cell: ({ getValue }) => (
        <span className="line-clamp-1 max-w-xs text-violet-600 dark:text-violet-400">{getValue() || "\u2014"}</span>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => handleView(row.original)} className="rounded-lg bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-dark-500 dark:text-dark-200 dark:hover:bg-dark-400">
            <EyeIcon className="size-4" />
          </button>
          <button onClick={() => handleEdit(row.original)} className="rounded-lg bg-teal-50 p-2 text-teal-600 transition-colors hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20">
            <PencilSquareIcon className="size-4" />
          </button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: historias,
    columns,
    state: { globalFilter: search, sorting },
    onGlobalFilterChange: setSearch,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      paciente_id: parseInt(form.paciente_id),
      usuario_id: user?.id,
      cita_id: form.cita_id ? parseInt(form.cita_id) : null,
    };
    try {
      if (editId) {
        const res = await axios.put(`/historias-clinicas/${editId}`, payload);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Historia actualizada");
      } else {
        const res = await axios.post("/historias-clinicas", payload);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Historia creada");
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);
      fetchAll();
    } catch {
      toast.error("Error al guardar");
    }
  };

  const handleEdit = (h) => {
    setForm({
      paciente_id: h.paciente_id || "",
      cita_id: h.cita_id || "",
      fecha_atencion: h.fecha_atencion?.split("T")[0] || "",
      motivo_consulta: h.motivo_consulta || "",
      diagnostico: h.diagnostico || "",
      observaciones: h.observaciones || "",
      recomendaciones: h.recomendaciones || "",
    });
    setEditId(h.id);
    setShowModal(true);
  };

  const handleView = (h) => {
    setSelected(h);
    setShowView(true);
  };

  // Citas del paciente seleccionado (para el form)
  const citasPaciente = form.paciente_id
    ? citasDoctor.filter((c) => c.paciente_id === parseInt(form.paciente_id))
    : [];

  return (
    <Page title="Historias Clínicas">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md">
              <ClipboardDocumentListIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Historias Clínicas</h2>
              <p className="text-sm text-gray-400 dark:text-dark-300">{historias.length} historia(s) registradas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
            <button
              onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true); }}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-teal-700"
            >
              <PlusIcon className="size-4" />
              Nueva Historia
            </button>
          </div>
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
                      <ClipboardDocumentListIcon className="mx-auto size-10 text-gray-200 dark:text-dark-500" />
                      <p className="mt-2 text-sm text-gray-400 dark:text-dark-300">
                        {search ? "Sin resultados" : "Aún no has creado historias clínicas"}
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

        {/* Modal Crear/Editar */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-700">
              <button onClick={() => { setShowModal(false); setForm(emptyForm); setEditId(null); }} className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600">
                <XMarkIcon className="size-5" />
              </button>
              <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">
                {editId ? "Editar Historia Clínica" : "Nueva Historia Clínica"}
              </h3>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-200">Paciente *</label>
                  <select
                    value={form.paciente_id}
                    onChange={(e) => setForm({ ...form, paciente_id: e.target.value, cita_id: "" })}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                  >
                    <option value="">Seleccionar paciente</option>
                    {pacientes.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre} {p.apellido} — {p.cedula}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-200">Cita Asociada</label>
                  <select
                    value={form.cita_id}
                    onChange={(e) => setForm({ ...form, cita_id: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                  >
                    <option value="">Sin cita asociada</option>
                    {citasPaciente.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fecha?.split("T")[0]} — {c.especialidad_nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-200">Fecha de Atención *</label>
                  <input
                    type="date"
                    value={form.fecha_atencion}
                    onChange={(e) => setForm({ ...form, fecha_atencion: e.target.value })}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-200">Motivo de Consulta *</label>
                  <textarea
                    value={form.motivo_consulta}
                    onChange={(e) => setForm({ ...form, motivo_consulta: e.target.value })}
                    required
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-200">Diagnóstico</label>
                  <textarea
                    value={form.diagnostico}
                    onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-200">Observaciones</label>
                  <textarea
                    value={form.observaciones}
                    onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-200">Recomendaciones</label>
                  <textarea
                    value={form.recomendaciones}
                    onChange={(e) => setForm({ ...form, recomendaciones: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setForm(emptyForm); setEditId(null); }}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-dark-500 dark:text-dark-200 dark:hover:bg-dark-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-teal-700"
                  >
                    {editId ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Ver Detalle */}
        {showView && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-700">
              <button onClick={() => { setShowView(false); setSelected(null); }} className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600">
                <XMarkIcon className="size-5" />
              </button>
              <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">Detalle de Historia Clínica</h3>
              <div className="mt-4 space-y-3">
                <DetailRow label="Paciente" value={`${selected.paciente_nombre} ${selected.paciente_apellido}`} />
                <DetailRow label="Fecha de Atención" value={selected.fecha_atencion?.split("T")[0]} />
                <DetailRow label="Motivo de Consulta" value={selected.motivo_consulta} />
                <DetailRow label="Diagnóstico" value={selected.diagnostico} />
                <DetailRow label="Observaciones" value={selected.observaciones} />
                <DetailRow label="Recomendaciones" value={selected.recomendaciones} />
                <DetailRow label="Próxima Cita" value={selected.proxima_cita?.split("T")[0]} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-lg bg-gray-50 px-4 py-3 dark:bg-dark-600">
      <p className="text-xs font-medium text-gray-500 dark:text-dark-300">{label}</p>
      <p className="mt-1 text-sm text-gray-800 dark:text-dark-100">{value}</p>
    </div>
  );
}
