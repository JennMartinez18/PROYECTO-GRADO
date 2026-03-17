import { useEffect, useState, useCallback } from "react";
import { Page } from "components/shared/Page";
import { Button, Card, Input } from "components/ui";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { toast } from "sonner";
import { formatHora } from "utils/formatHora";

const emptyForm = {
  paciente_id: "",
  usuario_id: "",
  especialidad_id: "",
  fecha: "",
  hora: "",
  estado: "Programada",
  observaciones: "",
  motivo_consulta: "",
  consultorio: "",
};

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todas");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [citasDoctor, setCitasDoctor] = useState([]);

  const fetchAll = useCallback(async () => {
    try {
      const [citasR, pacR, usrR, espR] = await Promise.all([
        axios.get("/citas"),
        axios.get("/pacientes"),
        axios.get("/usuarios"),
        axios.get("/especialidades"),
      ]);
      if (Array.isArray(citasR.data.resultado)) setCitas(citasR.data.resultado);
      if (Array.isArray(pacR.data.resultado)) setPacientes(pacR.data.resultado);
      if (Array.isArray(usrR.data.resultado)) setUsuarios(usrR.data.resultado);
      if (Array.isArray(espR.data.resultado)) setEspecialidades(espR.data.resultado);
    } catch {
      // error silencioso
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Fetch citas del doctor para el día seleccionado
  useEffect(() => {
    if (form.usuario_id && form.fecha) {
      axios.get(`/citas/doctor/${form.usuario_id}`)
        .then((r) => {
          if (Array.isArray(r.data.resultado)) {
            setCitasDoctor(
              r.data.resultado.filter(
                (c) => c.fecha?.split("T")[0] === form.fecha && c.estado !== "Cancelada" && c.estado !== "No_Asistio" && c.id !== editId
              )
            );
          }
        })
        .catch(() => setCitasDoctor([]));
    } else {
      setCitasDoctor([]);
    }
  }, [form.usuario_id, form.fecha, editId]);

  // Generar franjas horarias de 8:00 a 18:00 (cada 30 min)
  const HORARIO_INICIO = 8;
  const HORARIO_FIN = 18;
  const generarFranjas = () => {
    const slots = [];
    for (let h = HORARIO_INICIO; h < HORARIO_FIN; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }
    return slots;
  };

  const franjas = generarFranjas();

  const getCitaEnFranja = (slot) => {
    return citasDoctor.find((c) => formatHora(c.hora) === slot);
  };

  const filtered = citas.filter((c) => {
    const matchSearch =
      c.paciente_nombre?.toLowerCase().includes(search.toLowerCase()) ||
      c.motivo_consulta?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado === "Todas" || c.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      paciente_id: parseInt(form.paciente_id),
      usuario_id: parseInt(form.usuario_id),
      especialidad_id: parseInt(form.especialidad_id),
    };
    try {
      if (editId) {
        const res = await axios.put(`/citas/${editId}`, payload);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Cita actualizada");
      } else {
        const res = await axios.post("/citas", payload);
        if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
        toast.success(res.data.informacion || "Cita creada");
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);
      fetchAll();
    } catch {
      toast.error("Error al guardar cita");
    }
  };

  const handleEdit = (c) => {
    setForm({
      paciente_id: c.paciente_id || "",
      usuario_id: c.usuario_id || "",
      especialidad_id: c.especialidad_id || "",
      fecha: c.fecha?.split("T")[0] || "",
      hora: formatHora(c.hora),
      estado: c.estado || "Programada",
      observaciones: c.observaciones || "",
      motivo_consulta: c.motivo_consulta || "",
      consultorio: c.consultorio || "",
    });
    setEditId(c.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta cita?")) return;
    try {
      const res = await axios.delete(`/citas/${id}`);
      if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
      toast.success(res.data.informacion || "Cita eliminada");
      fetchAll();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleChangeEstado = async (id, nuevoEstado) => {
    try {
      const res = await axios.patch(`/citas/${id}/estado`, { estado: nuevoEstado });
      if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
      toast.success(res.data.informacion || ("Estado cambiado a " + nuevoEstado));
      fetchAll();
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  const estadoColor = (estado) => {
    if (estado === "Completada") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400";
    if (estado === "Cancelada" || estado === "No_Asistio") return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
    if (estado === "En_Curso") return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  };

  const estadoIcon = (estado) => {
    if (estado === "Completada") return <CheckCircleIcon className="size-3.5" />;
    if (estado === "En_Curso") return <ArrowTrendingUpIcon className="size-3.5" />;
    return <ClockIcon className="size-3.5" />;
  };

  const tabs = ["Todas", "Programada", "Confirmada", "En_Curso", "Completada", "Cancelada", "No_Asistio"];

  return (
    <Page title="Citas">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <CalendarDaysIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Gestion de Citas</h2>
              <p className="text-xs text-gray-400 dark:text-dark-300">{citas.length} citas registradas</p>
            </div>
          </div>
          <Button color="primary" className="gap-2 rounded-xl shadow-sm" onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true); }}>
            <PlusIcon className="size-4" />
            <span>Nueva Cita</span>
          </Button>
        </div>

        {/* Search + Filter Tabs */}
        <div className="mt-5 space-y-3">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por paciente o motivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-emerald-500/20"
            />
          </div>
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setFiltroEstado(tab)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${filtroEstado === tab ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "text-gray-500 hover:bg-gray-100 dark:text-dark-300 dark:hover:bg-dark-600"}`}
              >
                {tab.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Citas List */}
        <div className="mt-4 space-y-2">
          {filtered.length === 0 ? (
            <Card className="rounded-xl p-10">
              <div className="flex flex-col items-center text-center">
                <CalendarDaysIcon className="size-14 text-gray-200 dark:text-dark-500" />
                <p className="mt-4 text-sm font-medium text-gray-400 dark:text-dark-300">No se encontraron citas</p>
              </div>
            </Card>
          ) : (
            filtered.map((c) => (
              <Card key={c.id} className="group rounded-xl p-4 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="hidden flex-col items-center rounded-xl bg-emerald-50 px-3 py-2 sm:flex dark:bg-emerald-500/10">
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{c.fecha?.split("T")[0]}</span>
                    <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatHora(c.hora)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-dark-50">{c.paciente_nombre} {c.paciente_apellido}</p>
                    <p className="text-xs text-gray-400 dark:text-dark-300">{c.motivo_consulta || "Consulta general"} {c.consultorio ? ("  " + c.consultorio) : ""}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${estadoColor(c.estado)}`}>
                    {estadoIcon(c.estado)}
                    {c.estado?.replace("_", " ")}
                  </span>
                  <div className="flex items-center gap-1">
                    {(c.estado === "Programada" || c.estado === "Confirmada") && (
                      <>
                        <button onClick={() => handleChangeEstado(c.id, "En_Curso")} className="rounded-lg px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10">En Curso</button>
                        <button onClick={() => handleChangeEstado(c.id, "Completada")} className="rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10">Completar</button>
                        <button onClick={() => handleChangeEstado(c.id, "No_Asistio")} className="rounded-lg px-2 py-1 text-xs font-medium text-orange-500 transition-colors hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10">No Asistió</button>
                        <button onClick={() => handleChangeEstado(c.id, "Cancelada")} className="rounded-lg px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">Cancelar</button>
                      </>
                    )}
                    {c.estado === "En_Curso" && (
                      <button onClick={() => handleChangeEstado(c.id, "Completada")} className="rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10">Completar</button>
                    )}
                    <button onClick={() => handleEdit(c)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600">
                      <PencilSquareIcon className="size-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
                      <TrashIcon className="size-4" />
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
                  <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <CalendarDaysIcon className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">
                    {editId ? "Editar Cita" : "Nueva Cita"}
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
                    {pacientes.map((p) => (<option key={p.id} value={p.id}>{p.nombre} {p.apellido} - {p.cedula}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs-plus font-medium text-gray-700 dark:text-dark-100">Odontologo</label>
                  <select className="form-select w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100" value={form.usuario_id} onChange={(e) => setForm({ ...form, usuario_id: e.target.value })}>
                    <option value="">Seleccionar odontologo</option>
                    {usuarios.filter(u => u.rol_id === 4 || u.rol_id === 1).map((u) => (<option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs-plus font-medium text-gray-700 dark:text-dark-100">Especialidad</label>
                  <select className="form-select w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100" value={form.especialidad_id} onChange={(e) => setForm({ ...form, especialidad_id: e.target.value })}>
                    <option value="">Seleccionar especialidad</option>
                    {especialidades.map((esp) => (<option key={esp.id} value={esp.id}>{esp.nombre}</option>))}
                  </select>
                </div>
                <div>
                  <Input label="Fecha" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
                </div>
                {form.hora && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-500/10">
                    <ClockIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Hora seleccionada: {form.hora}</span>
                  </div>
                )}

                {/* Panel de disponibilidad horaria */}
                {form.usuario_id && form.fecha && (
                  <div className="rounded-xl border border-gray-200 dark:border-dark-500 overflow-hidden">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2.5 dark:bg-dark-600">
                      <CalendarDaysIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-dark-100">
                        Agenda del doctor — {form.fecha}
                      </span>
                      <span className="ml-auto flex items-center gap-3 text-[10px]">
                        <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-emerald-500" /> Libre</span>
                        <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-red-500" /> Ocupado</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-3 max-h-52 overflow-y-auto">
                      {franjas.map((slot) => {
                        const citaOcupada = getCitaEnFranja(slot);
                        const isSelected = form.hora?.slice(0, 5) === slot;
                        if (citaOcupada) {
                          return (
                            <div
                              key={slot}
                              className="relative flex flex-col items-center rounded-lg bg-red-50 px-1.5 py-2 border border-red-200 dark:bg-red-500/10 dark:border-red-500/30 cursor-not-allowed"
                              title={`Ocupado: ${citaOcupada.paciente_nombre} ${citaOcupada.paciente_apellido}`}
                            >
                              <span className="text-xs font-bold text-red-600 dark:text-red-400">{slot}</span>
                              <div className="mt-0.5 flex items-center gap-0.5">
                                <UserIcon className="size-2.5 text-red-400" />
                                <span className="max-w-[70px] truncate text-[9px] font-medium text-red-500 dark:text-red-300">
                                  {citaOcupada.paciente_nombre} {citaOcupada.paciente_apellido?.charAt(0)}.
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setForm({ ...form, hora: slot })}
                            className={`flex flex-col items-center rounded-lg px-1.5 py-2 border transition-all ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-100 ring-2 ring-emerald-300 dark:bg-emerald-500/20 dark:ring-emerald-500/40"
                                : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 dark:border-dark-500 dark:bg-dark-700 dark:hover:bg-emerald-500/10"
                            }`}
                          >
                            <span className={`text-xs font-bold ${isSelected ? "text-emerald-700 dark:text-emerald-300" : "text-gray-700 dark:text-dark-100"}`}>{slot}</span>
                            <span className="text-[9px] text-emerald-500 dark:text-emerald-400">Libre</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Input label="Consultorio" value={form.consultorio} onChange={(e) => setForm({ ...form, consultorio: e.target.value })} />
                <Input label="Motivo de Consulta" value={form.motivo_consulta} onChange={(e) => setForm({ ...form, motivo_consulta: e.target.value })} />
                <Input label="Observaciones" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
                {editId && (
                  <div>
                    <label className="mb-1 block text-xs-plus font-medium text-gray-700 dark:text-dark-100">Estado</label>
                    <select className="form-select w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                      <option value="Programada">Programada</option>
                      <option value="Confirmada">Confirmada</option>
                      <option value="En_Curso">En Curso</option>
                      <option value="Completada">Completada</option>
                      <option value="Cancelada">Cancelada</option>
                      <option value="No_Asistio">No Asistió</option>
                    </select>
                  </div>
                )}
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
