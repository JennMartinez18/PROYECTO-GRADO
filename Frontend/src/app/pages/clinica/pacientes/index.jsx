import { useEffect, useState, useCallback, useMemo } from "react";
import { Page } from "components/shared/Page";
import { Button, Card, Input, Table, THead, TBody, Tr, Th, Td } from "components/ui";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  HeartIcon,
  UserIcon,
  CalendarDaysIcon,
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
  cedula: "",
  nombre: "",
  apellido: "",
  fecha_nacimiento: "",
  genero: "M",
  telefono: "",
  direccion: "",
  email: "",
  tipo_sangre: "",
  contacto_emergencia: "",
  telefono_emergencia: "",
};

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showExpediente, setShowExpediente] = useState(false);
  const [expedientePac, setExpedientePac] = useState(null);
  const [historias, setHistorias] = useState([]);
  const [loadingHistorias, setLoadingHistorias] = useState(false);

  const fetchPacientes = useCallback(async () => {
    try {
      const res = await axios.get("/pacientes");
      if (Array.isArray(res.data.resultado)) setPacientes(res.data.resultado);
    } catch {
      // error silencioso
    }
  }, []);

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  const validate = () => {
    const e = {};
    if (!form.cedula.trim()) e.cedula = "La cedula es requerida";
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!form.apellido.trim()) e.apellido = "El apellido es requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editId) {
        const res = await axios.put(`/pacientes/${editId}`, form);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Paciente actualizado");
      } else {
        const res = await axios.post("/pacientes", form);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Paciente creado");
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);
      fetchPacientes();
    } catch {
      toast.error("Error al guardar paciente");
    }
  };

  const handleEdit = (pac) => {
    setForm({
      cedula: pac.cedula || "",
      nombre: pac.nombre || "",
      apellido: pac.apellido || "",
      fecha_nacimiento: pac.fecha_nacimiento?.split("T")[0] || "",
      genero: pac.genero || "M",
      telefono: pac.telefono || "",
      direccion: pac.direccion || "",
      email: pac.email || "",
      tipo_sangre: pac.tipo_sangre || "",
      contacto_emergencia: pac.contacto_emergencia || "",
      telefono_emergencia: pac.telefono_emergencia || "",
    });
    setEditId(pac.id);
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Esta seguro de eliminar este paciente?")) return;
    try {
      const res = await axios.delete(`/pacientes/${id}`);
      if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
      toast.success(res.data.informacion || "Paciente eliminado");
      fetchPacientes();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleVerExpediente = async (pac) => {
    setExpedientePac(pac);
    setHistorias([]);
    setShowExpediente(true);
    setLoadingHistorias(true);
    try {
      const res = await axios.get(`/historias-clinicas/paciente/${pac.id}`);
      if (Array.isArray(res.data.resultado)) setHistorias(res.data.resultado);
    } catch {
      toast.error("No se pudo cargar el expediente");
    } finally {
      setLoadingHistorias(false);
    }
  };

  // --- TanStack Table ---
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(() => [
    {
      id: "nombre",
      header: "Paciente",
      accessorFn: (row) => `${row.nombre || ""} ${row.apellido || ""}`,
      cell: ({ row }) => {
        const pac = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
              {pac.nombre?.[0]}{pac.apellido?.[0]}
            </div>
            <div>
              <span className="font-medium text-gray-800 dark:text-dark-50">{pac.nombre} {pac.apellido}</span>
              <p className="text-xs text-gray-400 dark:text-dark-300">CI: {pac.cedula}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ getValue }) => getValue() || "—",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ getValue }) => getValue() || "—",
    },
    {
      accessorKey: "genero",
      header: "Género",
      cell: ({ getValue }) => {
        const g = getValue();
        if (!g) return "—";
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${g === "M" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" : "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400"}`}>
            {g === "M" ? "Masculino" : "Femenino"}
          </span>
        );
      },
    },
    {
      accessorKey: "tipo_sangre",
      header: "Tipo Sangre",
      cell: ({ getValue }) => {
        const ts = getValue();
        return ts ? (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">{ts}</span>
        ) : "—";
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => {
        const pac = row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleVerExpediente(pac)}
              title="Ver expediente"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-500/10 dark:hover:text-violet-400"
            >
              <ClipboardDocumentListIcon className="size-4" />
            </button>
            <button onClick={() => handleEdit(pac)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-dark-600 dark:hover:text-indigo-400">
              <PencilSquareIcon className="size-4" />
            </button>
            <button onClick={() => handleDelete(pac.id)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400">
              <TrashIcon className="size-4" />
            </button>
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: pacientes,
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
    <Page title="Pacientes">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
              <UserGroupIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Pacientes</h2>
              <p className="text-xs text-gray-400 dark:text-dark-300">{pacientes.length} pacientes registrados</p>
            </div>
          </div>
          <Button color="primary" className="gap-2 rounded-xl shadow-sm" onClick={openCreate}>
            <PlusIcon className="size-4" />
            <span>Nuevo Paciente</span>
          </Button>
        </div>

        {/* Search */}
        <div className="mt-5">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o cedula..."
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
                      <UserGroupIcon className="mx-auto size-10 text-gray-200 dark:text-dark-500" />
                      <p className="mt-2 text-sm text-gray-400 dark:text-dark-300">No se encontraron pacientes</p>
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

        {/* Modal Expediente */}
        {showExpediente && expedientePac && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow">
                    <ClipboardDocumentListIcon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">Expediente del Paciente</h3>
                    <p className="text-xs text-gray-400 dark:text-dark-300">Solo lectura</p>
                  </div>
                </div>
                <button onClick={() => setShowExpediente(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-dark-600">
                  <XMarkIcon className="size-5" />
                </button>
              </div>

              {/* Datos del Paciente */}
              <div className="mt-5 rounded-xl bg-violet-50 p-4 dark:bg-violet-500/10">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-violet-200 text-lg font-bold text-violet-700 dark:bg-violet-500/30 dark:text-violet-300">
                    {expedientePac.nombre?.[0]}{expedientePac.apellido?.[0]}
                  </div>
                  <div>
                    <p className="text-base font-bold text-violet-800 dark:text-violet-200">{expedientePac.nombre} {expedientePac.apellido}</p>
                    <p className="text-xs text-violet-500 dark:text-violet-400">CI: {expedientePac.cedula}</p>
                  </div>
                  {expedientePac.tipo_sangre && (
                    <span className="ml-auto rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                      {expedientePac.tipo_sangre}
                    </span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    { icon: CalendarDaysIcon, label: "Nacimiento", value: expedientePac.fecha_nacimiento?.split("T")[0] },
                    { icon: UserIcon, label: "Género", value: expedientePac.genero === "M" ? "Masculino" : expedientePac.genero === "F" ? "Femenino" : expedientePac.genero },
                    { icon: PhoneIcon, label: "Teléfono", value: expedientePac.telefono },
                    { icon: EnvelopeIcon, label: "Email", value: expedientePac.email },
                    { icon: MapPinIcon, label: "Dirección", value: expedientePac.direccion },
                    { icon: HeartIcon, label: "Contacto emergencia", value: expedientePac.contacto_emergencia ? `${expedientePac.contacto_emergencia} ${expedientePac.telefono_emergencia || ""}`.trim() : null },
                  ].filter((i) => i.value).map((item) => (
                    <div key={item.label} className="flex items-start gap-1.5">
                      <item.icon className="mt-0.5 size-3.5 shrink-0 text-violet-400" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-violet-400">{item.label}</p>
                        <p className="text-xs text-violet-700 dark:text-violet-200 break-words">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historias Clínicas */}
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <EyeIcon className="size-4 text-gray-400" />
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-100">Historias Clínicas</h4>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-dark-600 dark:text-dark-300">
                    {historias.length} registro{historias.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {loadingHistorias ? (
                  <div className="py-8 text-center text-sm text-gray-400">Cargando...</div>
                ) : historias.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center dark:border-dark-500">
                    <ClipboardDocumentListIcon className="mx-auto size-8 text-gray-200 dark:text-dark-500" />
                    <p className="mt-2 text-sm text-gray-400 dark:text-dark-300">Sin historias clínicas registradas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historias.map((h) => (
                      <div key={h.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-dark-500 dark:bg-dark-700">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="size-4 text-violet-400" />
                            <span className="text-xs font-semibold text-gray-600 dark:text-dark-200">{h.fecha_atencion?.split("T")[0] || "—"}</span>
                          </div>
                          <span className="text-xs text-gray-400 dark:text-dark-300">Dr. {h.doctor_nombre || ""} {h.doctor_apellido || ""}</span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {[
                            { label: "Motivo", value: h.motivo_consulta },
                            { label: "Diagnóstico", value: h.diagnostico },
                            { label: "Observaciones", value: h.observaciones },
                            { label: "Recomendaciones", value: h.recomendaciones },
                            { label: "Próxima cita", value: h.proxima_cita?.split("T")[0] },
                          ].filter((i) => i.value).map((item) => (
                            <div key={item.label}>
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-dark-300">{item.label}</p>
                              <p className="mt-0.5 text-xs text-gray-700 dark:text-dark-100">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 flex justify-end">
                <Button variant="outlined" className="rounded-xl" onClick={() => setShowExpediente(false)}>Cerrar</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                    <UserGroupIcon className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">
                    {editId ? "Editar Paciente" : "Nuevo Paciente"}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-dark-600">
                  <XMarkIcon className="size-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Cedula" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} error={errors.cedula} />
                  <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} error={errors.nombre} />
                  <Input label="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} error={errors.apellido} />
                  <Input label="Fecha Nacimiento" type="date" value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} />
                  <div>
                    <label className="mb-1 block text-xs-plus font-medium text-gray-700 dark:text-dark-100">Genero</label>
                    <select className="form-select w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100" value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value })}>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                  <Input label="Telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                </div>
                <Input label="Direccion" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
                <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs-plus font-medium text-gray-700 dark:text-dark-100">Tipo de Sangre</label>
                    <select className="form-select w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100" value={form.tipo_sangre} onChange={(e) => setForm({ ...form, tipo_sangre: e.target.value })}>
                      <option value="">Seleccionar</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                  <Input label="Tel. Emergencia" value={form.telefono_emergencia} onChange={(e) => setForm({ ...form, telefono_emergencia: e.target.value })} />
                </div>
                <Input label="Contacto de Emergencia" value={form.contacto_emergencia} onChange={(e) => setForm({ ...form, contacto_emergencia: e.target.value })} placeholder="Nombre del contacto" />
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
