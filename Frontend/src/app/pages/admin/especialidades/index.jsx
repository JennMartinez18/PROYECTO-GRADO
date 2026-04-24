import { useEffect, useState, useCallback } from "react";
import { Page } from "components/shared/Page";
import { ConfirmModal } from "components/shared/ConfirmModal";
import { Button, Card, Input } from "components/ui";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { toast } from "sonner";

const emptyForm = {
  nombre: "",
  descripcion: "",
};

export default function Especialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get("/especialidades");
      if (Array.isArray(res.data.resultado)) setEspecialidades(res.data.resultado);
    } catch {
      // error silencioso
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = especialidades.filter(
    (e) => e.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const res = await axios.put(`/especialidades/${editId}`, form);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Especialidad actualizada");
      } else {
        const res = await axios.post("/especialidades", form);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Especialidad creada");
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);
      fetchData();
    } catch {
      toast.error("Error al guardar");
    }
  };

  const handleEdit = (esp) => {
    setForm({ nombre: esp.nombre || "", descripcion: esp.descripcion || "" });
    setEditId(esp.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    setConfirmLoading(true);
    try {
      const res = await axios.delete(`/especialidades/${pendingDeleteId}`);
      if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
      toast.success(res.data.informacion || "Especialidad eliminada");
      fetchData();
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  const colors = [
    "from-indigo-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-violet-500 to-purple-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-sky-600",
  ];

  return (
    <Page title="Especialidades">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-md">
              <AcademicCapIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Especialidades</h2>
              <p className="text-xs text-gray-400 dark:text-dark-300">{especialidades.length} especialidades registradas</p>
            </div>
          </div>
          <Button color="primary" className="gap-2 rounded-xl shadow-sm" onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true); }}>
            <PlusIcon className="size-4" />
            <span>Nueva Especialidad</span>
          </Button>
        </div>

        {/* Search */}
        <div className="mt-5">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar especialidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-cyan-500/20"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="mt-5">
          {filtered.length === 0 ? (
            <Card className="rounded-xl p-10">
              <div className="flex flex-col items-center text-center">
                <AcademicCapIcon className="size-14 text-gray-200 dark:text-dark-500" />
                <p className="mt-4 text-sm font-medium text-gray-400 dark:text-dark-300">No hay especialidades</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((esp, idx) => (
                <Card key={esp.id} className="group relative overflow-hidden rounded-xl p-5 transition-all hover:shadow-lg">
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors[idx % colors.length]} opacity-0 transition-opacity group-hover:opacity-[0.03]`} />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${colors[idx % colors.length]} text-white shadow-sm`}>
                          <AcademicCapIcon className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-dark-50">{esp.nombre}</p>
                          <p className="text-xs text-gray-400 dark:text-dark-300">ID: {esp.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(esp)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-cyan-600 dark:hover:bg-dark-600 dark:hover:text-cyan-400">
                          <PencilSquareIcon className="size-4" />
                        </button>
                        <button onClick={() => handleDelete(esp.id)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400">
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    </div>
                    {esp.descripcion && <p className="mt-3 text-xs text-gray-500 dark:text-dark-300">{esp.descripcion}</p>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 text-white">
                    <AcademicCapIcon className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">
                    {editId ? "Editar Especialidad" : "Nueva Especialidad"}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-dark-600">
                  <XMarkIcon className="size-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                <Input label="Descripcion" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
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
            title: "¿Eliminar especialidad?",
            description: "Esta acción no se puede deshacer.",
            actionText: "Eliminar",
          },
        }}
      />
    </Page>
  );
}
