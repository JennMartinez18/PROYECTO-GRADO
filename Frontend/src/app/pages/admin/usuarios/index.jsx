import { useEffect, useState, useCallback, useMemo } from "react";
import { Page } from "components/shared/Page";
import { Button, Card, Input, Table, THead, TBody, Tr, Th, Td } from "components/ui";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UsersIcon,
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
  apellido: "",
  email: "",
  password: "",
  telefono: "",
  cedula: "",
  rol_id: "",
  activo: true,
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [uR, rR] = await Promise.all([
        axios.get("/usuarios"),
        axios.get("/roles"),
      ]);
      if (Array.isArray(uR.data.resultado)) setUsuarios(uR.data.resultado);
      if (Array.isArray(rR.data.resultado)) setRoles(rR.data.resultado);
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
      rol_id: parseInt(form.rol_id),
    };
    try {
      if (editId) {
        if (!payload.password) delete payload.password;
        const res = await axios.put(`/usuarios/${editId}`, payload);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Usuario actualizado");
      } else {
        const res = await axios.post("/usuarios", payload);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Usuario creado");
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);
      fetchAll();
    } catch {
      toast.error("Error al guardar");
    }
  };

  const handleEdit = (u) => {
    setForm({
      nombre: u.nombre || "",
      apellido: u.apellido || "",
      email: u.email || "",
      password: "",
      telefono: u.telefono || "",
      cedula: u.cedula || "",
      rol_id: u.rol_id?.toString() || "",
      activo: u.activo ?? true,
    });
    setEditId(u.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    try {
      const res = await axios.delete(`/usuarios/${id}`);
      if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
      toast.success(res.data.informacion || "Usuario eliminado");
      fetchAll();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const getRolName = (rolId) => {
    const rol = roles.find((r) => r.id === rolId);
    return rol?.nombre || "";
  };

  // --- TanStack Table ---
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(() => [
    {
      id: "nombre",
      header: "Nombre",
      accessorFn: (row) => `${row.nombre || ""} ${row.apellido || ""}`,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
              {u.nombre?.[0]}{u.apellido?.[0]}
            </div>
            <span className="font-medium text-gray-800 dark:text-dark-50">{u.nombre} {u.apellido}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ getValue }) => getValue() || "—",
    },
    {
      accessorKey: "rol_id",
      header: "Rol",
      cell: ({ getValue }) => {
        const rolId = getValue();
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${rolId === 1 ? "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400" : rolId === 3 ? "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400" : rolId === 4 ? "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400" : "bg-gray-100 text-gray-600 dark:bg-dark-600 dark:text-dark-300"}`}>
            {getRolName(rolId)}
          </span>
        );
      },
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ getValue }) => {
        const activo = getValue();
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${activo ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"}`}>
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
        const u = row.original;
        return (
          <div className="flex items-center gap-1">
            <button onClick={() => handleEdit(u)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-dark-600 dark:hover:text-indigo-400">
              <PencilSquareIcon className="size-4" />
            </button>
            <button onClick={() => handleDelete(u.id)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400">
              <TrashIcon className="size-4" />
            </button>
          </div>
        );
      },
    },
  ], [roles]);

  const table = useReactTable({
    data: usuarios,
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
    <Page title="Usuarios">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
              <UsersIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Gestion de Usuarios</h2>
              <p className="text-xs text-gray-400 dark:text-dark-300">{usuarios.length} usuarios en el sistema</p>
            </div>
          </div>
          <Button color="primary" className="gap-2 rounded-xl shadow-sm" onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true); }}>
            <PlusIcon className="size-4" />
            <span>Nuevo Usuario</span>
          </Button>
        </div>

        {/* Search */}
        <div className="mt-5">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-indigo-500/20"
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
                      <UsersIcon className="mx-auto size-10 text-gray-200 dark:text-dark-500" />
                      <p className="mt-2 text-sm text-gray-400 dark:text-dark-300">No hay usuarios</p>
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
                  <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                    <UsersIcon className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">
                    {editId ? "Editar Usuario" : "Nuevo Usuario"}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-dark-600">
                  <XMarkIcon className="size-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                  <Input label="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
                </div>
                <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input label={editId ? "Contrasena (vacio = no cambiar)" : "Contrasena"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                  <Input label="Cedula" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs-plus font-medium text-gray-700 dark:text-dark-100">Rol</label>
                  <select className="form-select w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100" value={form.rol_id} onChange={(e) => setForm({ ...form, rol_id: e.target.value })}>
                    <option value="">Seleccionar rol</option>
                    {roles.map((r) => (<option key={r.id} value={r.id}>{r.nombre}</option>))}
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
    </Page>
  );
}
