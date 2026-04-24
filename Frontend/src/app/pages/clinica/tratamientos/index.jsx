import { useEffect, useState, useCallback, useMemo } from "react";
import { Page } from "components/shared/Page";
import { ConfirmModal } from "components/shared/ConfirmModal";
import { Button, Card, Input, Table, THead, TBody, Tr, Th, Td } from "components/ui";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  BeakerIcon,
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
  nombre: "",
  descripcion: "",
  precio: "",
  duracion_sesiones: "1",
  especialidad_id: "",
  activo: true,
};

export default function Tratamientos() {
  const [tratamientos, setTratamientos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [tR, eR] = await Promise.all([
        axios.get("/tratamientos"),
        axios.get("/especialidades"),
      ]);
      if (Array.isArray(tR.data.resultado)) setTratamientos(tR.data.resultado);
      if (Array.isArray(eR.data.resultado)) setEspecialidades(eR.data.resultado);
    } catch {
      // error silencioso
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      precio: parseFloat(form.precio),
      duracion_sesiones: parseInt(form.duracion_sesiones),
      especialidad_id: parseInt(form.especialidad_id),
    };
    try {
      if (editId) {
        const res = await axios.put(`/tratamientos/${editId}`, payload);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Tratamiento actualizado");
      } else {
        const res = await axios.post("/tratamientos", payload);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Tratamiento creado");
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);
      fetchAll();
    } catch {
      toast.error("Error al guardar");
    }
  };

  const handleEdit = (t) => {
    setForm({
      nombre: t.nombre || "",
      descripcion: t.descripcion || "",
      precio: t.precio?.toString() || "",
      duracion_sesiones: t.duracion_sesiones?.toString() || "1",
      especialidad_id: t.especialidad_id?.toString() || "",
      activo: t.activo ?? true,
    });
    setEditId(t.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    setConfirmLoading(true);
    try {
      const res = await axios.delete(`/tratamientos/${pendingDeleteId}`);
      if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
      toast.success(res.data.informacion || "Tratamiento eliminado");
      fetchAll();
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  // --- TanStack Table ---
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(() => [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ getValue }) => <span className="font-medium text-gray-800 dark:text-dark-50">{getValue()}</span>,
    },
    {
      accessorKey: "especialidad_nombre",
      header: "Especialidad",
      cell: ({ getValue }) => getValue() || "Sin especialidad",
    },
    {
      accessorKey: "precio",
      header: "Precio",
      cell: ({ getValue }) => `$${Number(getValue() || 0).toLocaleString()}`,
    },
    {
      accessorKey: "duracion_sesiones",
      header: "Sesiones",
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ getValue }) => {
        const activo = getValue();
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${activo ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-dark-600 dark:text-dark-300"}`}>
            {activo ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex items-center gap-1">
            <button onClick={() => handleEdit(t)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-amber-600 dark:hover:bg-dark-600 dark:hover:text-amber-400">
              <PencilSquareIcon className="size-4" />
            </button>
            <button onClick={() => handleDelete(t.id)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400">
              <TrashIcon className="size-4" />
            </button>
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: tratamientos,
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
    <Page title="Tratamientos">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <BeakerIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Tratamientos</h2>
              <p className="text-xs text-gray-400 dark:text-dark-300">{tratamientos.length} tratamientos disponibles</p>
            </div>
          </div>
          <Button color="primary" className="gap-2 rounded-xl shadow-sm" onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true); }}>
            <PlusIcon className="size-4" />
            <span>Nuevo Tratamiento</span>
          </Button>
        </div>

        {/* Search */}
        <div className="mt-5">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o especialidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-amber-500/20"
            />
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
                      <BeakerIcon className="mx-auto size-10 text-gray-200 dark:text-dark-500" />
                      <p className="mt-2 text-sm text-gray-400 dark:text-dark-300">No hay tratamientos</p>
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                    <BeakerIcon className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">
                    {editId ? "Editar Tratamiento" : "Nuevo Tratamiento"}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-dark-600">
                  <XMarkIcon className="size-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                <Input label="Descripcion" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Precio" type="number" step="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
                  <Input label="Sesiones" type="number" value={form.duracion_sesiones} onChange={(e) => setForm({ ...form, duracion_sesiones: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs-plus font-medium text-gray-700 dark:text-dark-100">Especialidad</label>
                  <select className="form-select w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100" value={form.especialidad_id} onChange={(e) => setForm({ ...form, especialidad_id: e.target.value })}>
                    <option value="">Seleccionar especialidad</option>
                    {especialidades.map((esp) => (<option key={esp.id} value={esp.id}>{esp.nombre}</option>))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="activo" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="size-4 rounded border-gray-300" />
                  <label htmlFor="activo" className="text-sm text-gray-700 dark:text-dark-100">Activo</label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outlined" className="rounded-xl" onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button type="submit" color="primary" className="rounded-xl">{editId ? "Actualizar" : "Guardar"}</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
      <ConfirmModal
        show={confirmOpen}
        onClose={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
        onOk={doDelete}
        confirmLoading={confirmLoading}
        state="pending"
        messages={{
          pending: {
            title: "¿Eliminar tratamiento?",
            description: "Esta acción no se puede deshacer.",
            actionText: "Eliminar",
          },
        }}
      />
    </Page>
  );
}
