import { useEffect, useState, useCallback } from "react";
import { Page } from "components/shared/Page";
import { Button, Card, Input } from "components/ui";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { toast } from "sonner";

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

  const filtered = pacientes.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      p.apellido?.toLowerCase().includes(search.toLowerCase()) ||
      p.cedula?.toLowerCase().includes(search.toLowerCase())
  );

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

        {/* Cards Grid */}
        <div className="mt-5">
          {filtered.length === 0 ? (
            <Card className="rounded-xl p-10">
              <div className="flex flex-col items-center text-center">
                <UserGroupIcon className="size-14 text-gray-200 dark:text-dark-500" />
                <p className="mt-4 text-sm font-medium text-gray-400 dark:text-dark-300">No se encontraron pacientes</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((pac) => (
                <Card key={pac.id} className="group relative overflow-hidden rounded-xl p-4 transition-all hover:shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-600 opacity-0 transition-opacity group-hover:opacity-[0.02]" />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                          {pac.nombre?.[0]}{pac.apellido?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-dark-50">{pac.nombre} {pac.apellido}</p>
                          <p className="text-xs text-gray-400 dark:text-dark-300">CI: {pac.cedula}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(pac)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-dark-600 dark:hover:text-indigo-400">
                          <PencilSquareIcon className="size-4" />
                        </button>
                        <button onClick={() => handleDelete(pac.id)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400">
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {pac.telefono && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-300">
                          <PhoneIcon className="size-3.5" />
                          <span>{pac.telefono}</span>
                        </div>
                      )}
                      {pac.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-300">
                          <EnvelopeIcon className="size-3.5" />
                          <span className="truncate">{pac.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {pac.genero && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${pac.genero === "M" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" : "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400"}`}>
                          {pac.genero === "M" ? "Masculino" : "Femenino"}
                        </span>
                      )}
                      {pac.tipo_sangre && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
                          {pac.tipo_sangre}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

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
