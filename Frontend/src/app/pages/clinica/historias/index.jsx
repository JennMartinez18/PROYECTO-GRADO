import { useEffect, useState, useCallback, useMemo } from "react";
import { Page } from "components/shared/Page";
import { Button, Card, Input, Table, THead, TBody, Tr, Th, Td } from "components/ui";
import {
  PlusIcon,
  PencilSquareIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
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

const emptyForm = {
  paciente_id: "",
  cita_id: "",
  usuario_id: "",
  fecha_atencion: "",
  motivo_consulta: "",
  diagnostico: "",
  observaciones: "",
  recomendaciones: "",
  proxima_cita: "",
};

export default function Historias() {
  const [historias, setHistorias] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [hR, pR, uR] = await Promise.all([
        axios.get("/historias-clinicas"),
        axios.get("/pacientes"),
        axios.get("/usuarios"),
      ]);
      if (Array.isArray(hR.data.resultado)) setHistorias(hR.data.resultado);
      if (Array.isArray(pR.data.resultado)) setPacientes(pR.data.resultado);
      if (Array.isArray(uR.data.resultado)) setUsuarios(uR.data.resultado);
    } catch {
      // error silencioso
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // --- TanStack Table ---
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(() => [
    {
      accessorKey: "fecha_atencion",
      header: "Fecha",
      cell: ({ getValue }) => getValue()?.split("T")[0] || "",
    },
    {
      id: "paciente",
      header: "Paciente",
      accessorFn: (row) => `${row.paciente_nombre || ""} ${row.paciente_apellido || ""}`,
    },
    {
      accessorKey: "motivo_consulta",
      header: "Motivo",
      cell: ({ getValue }) => getValue() || "Sin motivo",
    },
    {
      accessorKey: "diagnostico",
      header: "Diagnóstico",
      cell: ({ getValue }) => {
        const val = getValue();
        return val ? <span className="text-violet-600 dark:text-violet-400">Dx: {val}</span> : "—";
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => {
        const h = row.original;
        return (
          <div className="flex items-center gap-1">
            <button onClick={() => handleView(h)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-500/10 dark:hover:text-violet-400">
              <EyeIcon className="size-4" />
            </button>
            <button onClick={() => handleEdit(h)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600">
              <PencilSquareIcon className="size-4" />
            </button>
          </div>
        );
      },
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
      usuario_id: parseInt(form.usuario_id),
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
      usuario_id: h.usuario_id || "",
      fecha_atencion: h.fecha_atencion?.split("T")[0] || "",
      motivo_consulta: h.motivo_consulta || "",
      diagnostico: h.diagnostico || "",
      observaciones: h.observaciones || "",
      recomendaciones: h.recomendaciones || "",
      proxima_cita: h.proxima_cita?.split("T")[0] || "",
    });
    setEditId(h.id);
    setShowModal(true);
  };

  const handleView = (h) => {
    setSelected(h);
    setShowView(true);
  };

  return (
    <Page title="Historias Clinicas">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
              <ClipboardDocumentListIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Historias Clinicas</h2>
              <p className="text-xs text-gray-400 dark:text-dark-300">{historias.length} registros</p>
            </div>
          </div>
          <Button color="primary" className="gap-2 rounded-xl shadow-sm" onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true); }}>
            <PlusIcon className="size-4" />
            <span>Nueva Historia</span>
          </Button>
        </div>

        {/* Search */}
        <div className="mt-5">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por paciente, motivo o diagnostico..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-violet-500/20"
            />
          </div>
        </div>

        {/* Table */}
        <Card className="mt-4 rounded-xl">
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
                      <p className="mt-2 text-sm text-gray-400 dark:text-dark-300">No hay historias clínicas</p>
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

        {/* View Modal */}
        {showView && selected && (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    <ClipboardDocumentListIcon className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">Detalle de Historia</h3>
                </div>
                <button onClick={() => setShowView(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-dark-600">
                  <XMarkIcon className="size-5" />
                </button>
              </div>
              <div className="mt-5 space-y-4">
                <div className="rounded-xl bg-violet-50 p-4 dark:bg-violet-500/10">
                  <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">{selected.paciente_nombre} {selected.paciente_apellido}</p>
                  <p className="text-xs text-violet-500 dark:text-violet-400">{selected.fecha_atencion?.split("T")[0]}</p>
                </div>
                {[
                  { label: "Motivo de Consulta", value: selected.motivo_consulta },
                  { label: "Diagnostico", value: selected.diagnostico },
                  { label: "Observaciones", value: selected.observaciones },
                  { label: "Recomendaciones", value: selected.recomendaciones },
                  { label: "Proxima Cita", value: selected.proxima_cita?.split("T")[0] },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-300">{item.label}</p>
                    <p className="mt-1 text-sm text-gray-700 dark:text-dark-100">{item.value || ""}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Form Modal */}
        {showModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    <ClipboardDocumentListIcon className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">
                    {editId ? "Editar Historia" : "Nueva Historia Clinica"}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-dark-600">
                  <XMarkIcon className="size-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-xs-plus font-medium text-gray-700 dark:text-dark-100">Paciente</label>
                  <select className="form-select w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100" value={form.paciente_id} onChange={(e) => setForm({ ...form, paciente_id: e.target.value })}>
                    <option value="">Seleccionar paciente</option>
                    {pacientes.map((p) => (<option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs-plus font-medium text-gray-700 dark:text-dark-100">Odontologo</label>
                  <select className="form-select w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100" value={form.usuario_id} onChange={(e) => setForm({ ...form, usuario_id: e.target.value })}>
                    <option value="">Seleccionar odontologo</option>
                    {usuarios.filter(u => u.rol_id === 4 || u.rol_id === 1).map((u) => (<option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>))}
                  </select>
                </div>
                <Input label="Fecha de Atencion" type="date" value={form.fecha_atencion} onChange={(e) => setForm({ ...form, fecha_atencion: e.target.value })} />
                <Input label="Motivo de Consulta" value={form.motivo_consulta} onChange={(e) => setForm({ ...form, motivo_consulta: e.target.value })} />
                <Input label="Diagnostico" value={form.diagnostico} onChange={(e) => setForm({ ...form, diagnostico: e.target.value })} />
                <Input label="Observaciones" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
                <Input label="Recomendaciones" value={form.recomendaciones} onChange={(e) => setForm({ ...form, recomendaciones: e.target.value })} />
                <Input label="Proxima Cita" type="date" value={form.proxima_cita} onChange={(e) => setForm({ ...form, proxima_cita: e.target.value })} />
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outlined" className="rounded-xl" onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button type="submit" color="primary" className="rounded-xl">{editId ? "Actualizar" : "Guardar"}</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </Page>
  );
}
