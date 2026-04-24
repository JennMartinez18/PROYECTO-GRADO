import { useEffect, useState, useCallback } from "react";
import { Page } from "components/shared/Page";
import { ConfirmModal } from "components/shared/ConfirmModal";
import { Button, Card, Input } from "components/ui";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { toast } from "sonner";

const emptyForm = {
  nombre: "",
  descripcion: "",
};

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get("/roles");
      if (Array.isArray(res.data.resultado)) setRoles(res.data.resultado);
    } catch {
      // error silencioso
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const res = await axios.put(`/roles/${editId}`, form);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Rol actualizado");
      } else {
        const res = await axios.post("/roles", form);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Rol creado");
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);
      fetchData();
    } catch {
      toast.error("Error al guardar");
    }
  };

  const handleEdit = (r) => {
    setForm({ nombre: r.nombre || "", descripcion: r.descripcion || "" });
    setEditId(r.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    setConfirmLoading(true);
    try {
      const res = await axios.delete(`/roles/${pendingDeleteId}`);
      if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
      toast.success(res.data.informacion || "Rol eliminado");
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
  ];

  return (
    <Page title="Roles">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-gray-800 text-white shadow-md">
              <ShieldCheckIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Roles del Sistema</h2>
              <p className="text-xs text-gray-400 dark:text-dark-300">{roles.length} roles configurados</p>
            </div>
          </div>
          <Button color="primary" className="gap-2 rounded-xl shadow-sm" onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true); }}>
            <PlusIcon className="size-4" />
            <span>Nuevo Rol</span>
          </Button>
        </div>

        {/* Cards Grid */}
        <div className="mt-6">
          {roles.length === 0 ? (
            <Card className="rounded-xl p-10">
              <div className="flex flex-col items-center text-center">
                <ShieldCheckIcon className="size-14 text-gray-200 dark:text-dark-500" />
                <p className="mt-4 text-sm font-medium text-gray-400 dark:text-dark-300">No hay roles</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {roles.map((r, idx) => (
                <Card key={r.id} className="group relative overflow-hidden rounded-xl p-5 transition-all hover:shadow-lg">
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors[idx % colors.length]} opacity-0 transition-opacity group-hover:opacity-[0.04]`} />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors[idx % colors.length]} text-white shadow-md`}>
                        <ShieldCheckIcon className="size-6" />
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(r)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600">
                          <PencilSquareIcon className="size-4" />
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400">
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-base font-bold text-gray-800 dark:text-dark-50">{r.nombre}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-dark-300">{r.descripcion || "Sin descripcion"}</p>
                      <p className="mt-3 text-xs text-gray-400 dark:text-dark-400">ID: {r.id}</p>
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
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-gray-800 text-white">
                    <ShieldCheckIcon className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">
                    {editId ? "Editar Rol" : "Nuevo Rol"}
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
            title: "¿Eliminar este rol?",
            description: "Esta acción no se puede deshacer.",
            actionText: "Eliminar",
          },
        }}
      />
    </Page>
  );
}
