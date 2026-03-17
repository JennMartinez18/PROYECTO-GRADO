import { useEffect, useState, useCallback } from "react";
import { Page } from "components/shared/Page";
import { Button, Card, Input } from "components/ui";
import {
  PlusIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { toast } from "sonner";

const emptyForm = {
  paciente_id: "",
  usuario_id: "",
  cita_id: "",
  fecha_emision: "",
  total: "",
  estado: "Pendiente",
  metodo_pago: "",
  observaciones: "",
};

export default function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todas");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [fR, pR, uR] = await Promise.all([
        axios.get("/facturas"),
        axios.get("/pacientes"),
        axios.get("/usuarios"),
      ]);
      if (Array.isArray(fR.data.resultado)) setFacturas(fR.data.resultado);
      if (Array.isArray(pR.data.resultado)) setPacientes(pR.data.resultado);
      if (Array.isArray(uR.data.resultado)) setUsuarios(uR.data.resultado);
    } catch {
      // error silencioso
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = facturas.filter((f) => {
    const matchSearch =
      f.numero_factura?.toLowerCase().includes(search.toLowerCase()) ||
      f.paciente_nombre?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado === "Todas" || f.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const totalPendiente = facturas.filter(f => f.estado === "Pendiente").reduce((sum, f) => sum + Number(f.total || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      paciente_id: parseInt(form.paciente_id),
      usuario_id: parseInt(form.usuario_id),
      cita_id: form.cita_id ? parseInt(form.cita_id) : null,
      total: parseFloat(form.total),
    };
    try {
      if (editId) {
        const res = await axios.put(`/facturas/${editId}`, payload);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Factura actualizada");
      } else {
        const res = await axios.post("/facturas", payload);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Factura creada");
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);
      fetchAll();
    } catch {
      toast.error("Error al guardar");
    }
  };

  const handleEdit = (f) => {
    setForm({
      paciente_id: f.paciente_id?.toString() || "",
      usuario_id: f.usuario_id?.toString() || "",
      cita_id: f.cita_id?.toString() || "",
      fecha_emision: f.fecha_emision?.split("T")[0] || "",
      total: f.total?.toString() || "",
      estado: f.estado || "Pendiente",
      metodo_pago: f.metodo_pago || "",
      observaciones: f.observaciones || "",
    });
    setEditId(f.id);
    setShowModal(true);
  };

  const handleChangeEstado = async (id, nuevoEstado) => {
    try {
      const res = await axios.patch(`/facturas/${id}/estado`, { estado: nuevoEstado });
      if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
      toast.success(res.data.informacion || ("Estado: " + nuevoEstado));
      fetchAll();
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  const estadoColor = (estado) => {
    if (estado === "Pagada") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400";
    if (estado === "Anulada") return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  };

  const tabs = ["Todas", "Pendiente", "Pagada", "Anulada"];

  return (
    <Page title="Facturas">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md">
              <BanknotesIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Facturacion</h2>
              <p className="text-xs text-gray-400 dark:text-dark-300">{facturas.length} facturas &middot; Pendiente: {totalPendiente.toLocaleString()}</p>
            </div>
          </div>
          <Button color="primary" className="gap-2 rounded-xl shadow-sm" onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true); }}>
            <PlusIcon className="size-4" />
            <span>Nueva Factura</span>
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="mt-5 space-y-3">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por numero o paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-rose-500/20"
            />
          </div>
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setFiltroEstado(tab)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${filtroEstado === tab ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" : "text-gray-500 hover:bg-gray-100 dark:text-dark-300 dark:hover:bg-dark-600"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Facturas List */}
        <div className="mt-4 space-y-2">
          {filtered.length === 0 ? (
            <Card className="rounded-xl p-10">
              <div className="flex flex-col items-center text-center">
                <BanknotesIcon className="size-14 text-gray-200 dark:text-dark-500" />
                <p className="mt-4 text-sm font-medium text-gray-400 dark:text-dark-300">No hay facturas</p>
              </div>
            </Card>
          ) : (
            filtered.map((f) => (
              <Card key={f.id} className="group rounded-xl p-4 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="hidden flex-col items-center rounded-xl bg-rose-50 px-3 py-2 sm:flex dark:bg-rose-500/10">
                    <CurrencyDollarIcon className="size-5 text-rose-500 dark:text-rose-400" />
                    <span className="text-sm font-bold text-rose-700 dark:text-rose-300">{Number(f.total).toLocaleString()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800 dark:text-dark-50">{f.numero_factura}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${estadoColor(f.estado)}`}>{f.estado}</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-dark-300">{f.paciente_nombre} {f.paciente_apellido}  {f.fecha_emision?.split("T")[0]} {f.metodo_pago ? ("  " + f.metodo_pago) : ""}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {f.estado === "Pendiente" && (
                      <>
                        <button onClick={() => handleChangeEstado(f.id, "Pagada")} className="rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10">Pagar</button>
                        <button onClick={() => handleChangeEstado(f.id, "Anulada")} className="rounded-lg px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">Anular</button>
                      </>
                    )}
                    <button onClick={() => handleEdit(f)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600">
                      <PencilSquareIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                    <BanknotesIcon className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">
                    {editId ? "Editar Factura" : "Nueva Factura"}
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
                  <label className="mb-1 block text-xs-plus font-medium text-gray-700 dark:text-dark-100">Atendido por</label>
                  <select className="form-select w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100" value={form.usuario_id} onChange={(e) => setForm({ ...form, usuario_id: e.target.value })}>
                    <option value="">Seleccionar usuario</option>
                    {usuarios.map((u) => (<option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Fecha Emision" type="date" value={form.fecha_emision} onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })} />
                  <Input label="Total ($)" type="number" step="0.01" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs-plus font-medium text-gray-700 dark:text-dark-100">Metodo de Pago</label>
                  <select className="form-select w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100" value={form.metodo_pago} onChange={(e) => setForm({ ...form, metodo_pago: e.target.value })}>
                    <option value="">Seleccionar</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <Input label="Observaciones" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
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
