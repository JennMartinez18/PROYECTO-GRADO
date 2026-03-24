import { useEffect, useState, useCallback } from "react";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import { formatHora } from "utils/formatHora";
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { useAuthContext } from "app/contexts/auth/context";
import { toast } from "sonner";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

export default function MisCitas() {
  const { user } = useAuthContext();
  const [citas, setCitas] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [showModal, setShowModal] = useState(false);

  const fetchCitas = useCallback(async () => {
    if (!user?.paciente_id) return;
    try {
      const res = await axios.get(`/citas/paciente/${user.paciente_id}`);
      if (Array.isArray(res.data.resultado)) setCitas(res.data.resultado);
    } catch {
      // silencioso
    }
  }, [user?.paciente_id]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  const handleCancelar = async (citaId) => {
    if (!window.confirm("¿Estás seguro de cancelar esta cita?")) return;
    try {
      const res = await axios.patch(`/citas/${citaId}/estado`, { estado: "Cancelada" });
      if (res.data.resultado && typeof res.data.resultado === "string") { toast.error(res.data.resultado); return; }
      toast.success("Cita cancelada exitosamente");
      fetchCitas();
    } catch {
      toast.error("Error al cancelar la cita");
    }
  };

  const filtered = filtro === "todas"
    ? citas
    : citas.filter((c) => c.estado === filtro);

  const estadoConfig = {
    Programada: { color: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400", Icon: ClockIcon },
    Confirmada: { color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400", Icon: CalendarDaysIcon },
    Completada: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", Icon: CheckCircleIcon },
    Cancelada: { color: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400", Icon: XCircleIcon },
    No_Asistio: { color: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400", Icon: XCircleIcon },
    En_Curso: { color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400", Icon: ClockIcon },
  };

  const tabs = [
    { id: "todas", label: "Todas" },
    { id: "Programada", label: "Programadas" },
    { id: "Completada", label: "Completadas" },
    { id: "Cancelada", label: "Canceladas" },
  ];

  return (
    <Page title="Mis Citas">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
              <CalendarDaysIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Mis Citas</h2>
              <p className="text-sm text-gray-400 dark:text-dark-300">{citas.length} cita(s) registradas</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-indigo-700"
          >
            <PlusIcon className="size-4" />
            Programar Cita
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltro(tab.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filtro === tab.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-600 dark:text-dark-200 dark:hover:bg-dark-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lista de citas */}
        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <Card className="flex flex-col items-center rounded-xl py-12 text-center">
              <CalendarDaysIcon className="size-14 text-gray-300 dark:text-dark-400" />
              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-dark-300">No hay citas en esta categoría</p>
            </Card>
          ) : (
            filtered.map((cita, i) => {
              const cfg = estadoConfig[cita.estado] || estadoConfig.Programada;
              return (
                <Card key={i} className="rounded-xl p-4 transition-all hover:shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex size-14 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10">
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{cita.fecha?.split("-")[2]}</span>
                        <span className="text-[10px] font-medium uppercase text-indigo-400 dark:text-indigo-300">
                          {cita.fecha ? new Date(cita.fecha + "T00:00:00").toLocaleDateString("es", { month: "short" }) : ""}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-dark-50">{cita.motivo_consulta || "Consulta"}</p>
                        <p className="mt-0.5 text-sm text-gray-400 dark:text-dark-300">
                          {formatHora(cita.hora)} — Dr./Dra. {cita.doctor_nombre || "N/A"} {cita.doctor_apellido || ""}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-dark-400">
                          {cita.especialidad_nombre || "General"} • Consultorio {cita.consultorio}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-semibold ${cfg.color}`}>
                      <cfg.Icon className="size-3.5" />
                      {cita.estado?.replace("_", " ")}
                    </span>
                  </div>
                  {(cita.estado === "Programada" || cita.estado === "Confirmada") && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleCancelar(cita.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                      >
                        <XCircleIcon className="size-3.5" />
                        Cancelar cita
                      </button>
                    </div>
                  )}
                  {cita.observaciones && (
                    <p className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500 dark:border-dark-500 dark:bg-dark-600/50 dark:text-dark-300">
                      {cita.observaciones}
                    </p>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Programar Cita */}
      {showModal && (
        <ModalProgramarCita
          user={user}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchCitas(); }}
        />
      )}
    </Page>
  );
}

// ═══════════════════════════════════════════════
// Modal para Programar Cita
// ═══════════════════════════════════════════════
function ModalProgramarCita({ user, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [especialidades, setEspecialidades] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [citasDoctor, setCitasDoctor] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [especialidadId, setEspecialidadId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [doctorNombre, setDoctorNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [consultorio, setConsultorio] = useState("");
  const [motivo, setMotivo] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Calendario mini
  const [calMonth, setCalMonth] = useState(dayjs());

  // Generar franjas horarias de 8:00 a 18:00 (cada 30 min)
  const generarFranjas = () => {
    const slots = [];
    for (let h = 8; h < 18; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }
    return slots;
  };
  const franjas = generarFranjas();

  const getCitaEnFranja = (slot) => {
    return citasDoctor.find((c) => formatHora(c.hora) === slot);
  };

  // Cargar especialidades al iniciar
  useEffect(() => {
    axios.get("/especialidades").then((r) => {
      if (Array.isArray(r.data.resultado)) setEspecialidades(r.data.resultado);
    }).catch(() => {});
  }, []);

  // Cargar doctores
  useEffect(() => {
    axios.get("/usuarios/doctores").then((r) => {
      if (Array.isArray(r.data.resultado)) setDoctores(r.data.resultado);
    }).catch(() => {
      toast.error("No se pudieron cargar los doctores");
    });
  }, []);

  // Cargar citas del doctor para la fecha seleccionada
  useEffect(() => {
    setHoraSeleccionada("");
    setConsultorio("");
    if (!fecha || !doctorId) { setCitasDoctor([]); return; }
    setLoading(true);
    axios.get(`/citas/doctor/${doctorId}`)
      .then((r) => {
        if (Array.isArray(r.data.resultado)) {
          setCitasDoctor(
            r.data.resultado.filter(
              (c) => c.fecha?.split("T")[0] === fecha && c.estado !== "Cancelada" && c.estado !== "No_Asistio"
            )
          );
        }
      })
      .catch(() => setCitasDoctor([]))
      .finally(() => setLoading(false));
  }, [fecha, doctorId]);

  const handleSelectDoctor = (doc) => {
    setDoctorId(doc.id);
    setDoctorNombre(`${doc.nombre} ${doc.apellido}`);
    setStep(2);
  };

  const handleSelectSlot = (hora) => {
    setHoraSeleccionada(hora);
    setConsultorio("1");
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorId || !fecha || !horaSeleccionada || !consultorio) return;
    setLoading(true);
    try {
      const payload = {
        paciente_id: user.paciente_id,
        usuario_id: Number(doctorId),
        especialidad_id: Number(especialidadId) || 1,
        fecha,
        hora: horaSeleccionada,
        estado: "Programada",
        observaciones: observaciones || null,
        motivo_consulta: motivo || null,
        consultorio,
      };
      const res = await axios.post("/citas", payload);
      if (res.data.informacion?.toLowerCase().includes("exitosa")) {
        toast.success("¡Cita programada exitosamente!");
        onSuccess();
      } else {
        toast.error(res.data.informacion || "No se pudo programar la cita");
      }
    } catch {
      toast.error("Error al programar la cita");
    } finally {
      setLoading(false);
    }
  };

  // Helpers calendario
  const today = dayjs();
  const startOfMonth = calMonth.startOf("month");
  const startDay = startOfMonth.day(); // 0=dom
  const daysInMonth = calMonth.daysInMonth();
  const maxDate = today.add(60, "day");

  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100 dark:focus:border-indigo-400 dark:focus:bg-dark-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-700">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600">
          <XMarkIcon className="size-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
            <CalendarDaysIcon className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">Programar Cita</h3>
            <p className="text-xs text-gray-400 dark:text-dark-300">Paso {step} de 3</p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="mt-4 flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-indigo-500" : "bg-gray-200 dark:bg-dark-500"}`} />
          ))}
        </div>

        {/* ─── STEP 1: Especialidad + Doctor ─── */}
        {step === 1 && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-dark-200">Especialidad (opcional)</label>
              <select
                value={especialidadId}
                onChange={(e) => { setEspecialidadId(e.target.value); setDoctorId(""); }}
                className={inputClass}
              >
                <option value="">Todas las especialidades</option>
                {especialidades.map((esp) => (
                  <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-dark-200">Selecciona un Doctor</label>
              {doctores.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">No hay doctores disponibles</p>
              ) : (
                <div className="max-h-52 space-y-2 overflow-y-auto">
                  {doctores.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleSelectDoctor(doc)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-indigo-400 hover:bg-indigo-50 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/10 ${
                        doctorId === doc.id
                          ? "border-indigo-400 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-500/10"
                          : "border-gray-200 dark:border-dark-500"
                      }`}
                    >
                      <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                        {doc.nombre?.[0]}{doc.apellido?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-dark-50">Dr./Dra. {doc.nombre} {doc.apellido}</p>
                        {doc.especialidad_nombre && (
                          <p className="text-xs text-gray-400 dark:text-dark-300">{doc.especialidad_nombre}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── STEP 2: Fecha + Horario ─── */}
        {step === 2 && (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-gray-500 dark:text-dark-300">
              Doctor: <span className="font-semibold text-gray-800 dark:text-dark-50">{doctorNombre}</span>
            </p>

            {/* Mini Calendario */}
            <div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCalMonth(calMonth.subtract(1, "month"))}
                  disabled={calMonth.isSame(today, "month")}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-dark-600"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>
                <span className="text-sm font-semibold capitalize text-gray-800 dark:text-dark-50">
                  {calMonth.format("MMMM YYYY")}
                </span>
                <button
                  onClick={() => setCalMonth(calMonth.add(1, "month"))}
                  disabled={calMonth.add(1, "month").startOf("month").isAfter(maxDate)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-dark-600"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1 text-center">
                {diasSemana.map((d) => (
                  <div key={d} className="py-1 text-[10px] font-semibold uppercase text-gray-400">{d}</div>
                ))}
                {Array.from({ length: startDay }).map((_, i) => (
                  <div key={`e-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = calMonth.date(i + 1);
                  const isPast = d.isBefore(today, "day");
                  const isTooFar = d.isAfter(maxDate, "day");
                  const isSunday = d.day() === 0;
                  const disabled = isPast || isTooFar || isSunday;
                  const isSelected = fecha === d.format("YYYY-MM-DD");
                  return (
                    <button
                      key={i}
                      disabled={disabled}
                      onClick={() => { setFecha(d.format("YYYY-MM-DD")); setHoraSeleccionada(""); setConsultorio(""); }}
                      className={`rounded-lg py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md"
                          : disabled
                            ? "text-gray-300 dark:text-dark-500"
                            : "text-gray-700 hover:bg-indigo-50 dark:text-dark-200 dark:hover:bg-indigo-500/10"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panel de disponibilidad horaria */}
            {fecha && (
              <div className="rounded-xl border border-gray-200 dark:border-dark-500 overflow-hidden">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2.5 dark:bg-dark-600">
                  <CalendarDaysIcon className="size-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-dark-100">
                    Disponibilidad — {dayjs(fecha).format("dddd D [de] MMMM")}
                  </span>
                  <span className="ml-auto flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-indigo-500" /> Libre</span>
                    <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-red-500" /> Ocupado</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 p-3 max-h-52 overflow-y-auto">
                  {loading ? (
                    <p className="col-span-full py-4 text-center text-sm text-gray-400">Cargando...</p>
                  ) : (
                    franjas.map((slot) => {
                      const citaOcupada = getCitaEnFranja(slot);
                      const isSelected = horaSeleccionada === slot;
                      if (citaOcupada) {
                        return (
                          <div
                            key={slot}
                            className="flex flex-col items-center rounded-lg bg-red-50 px-1.5 py-2 border border-red-200 dark:bg-red-500/10 dark:border-red-500/30 cursor-not-allowed"
                          >
                            <span className="text-xs font-bold text-red-600 dark:text-red-400">{slot}</span>
                            <span className="text-[9px] text-red-500 dark:text-red-300">Ocupado</span>
                          </div>
                        );
                      }
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleSelectSlot(slot)}
                          className={`flex flex-col items-center rounded-lg px-1.5 py-2 border transition-all ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-100 ring-2 ring-indigo-300 dark:bg-indigo-500/20 dark:ring-indigo-500/40"
                              : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 dark:border-dark-500 dark:bg-dark-700 dark:hover:bg-indigo-500/10"
                          }`}
                        >
                          <span className={`text-xs font-bold ${isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-dark-100"}`}>{slot}</span>
                          <span className="text-[9px] text-indigo-500 dark:text-indigo-400">Libre</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Navegación */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-dark-500 dark:text-dark-200 dark:hover:bg-dark-600">
                Atrás
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!horaSeleccionada}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-indigo-700 disabled:opacity-40"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Motivo + Confirmar ─── */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Resumen */}
            <Card className="space-y-1.5 rounded-xl bg-indigo-50/60 p-4 dark:bg-indigo-500/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Resumen de tu cita</p>
              <p className="text-sm text-gray-700 dark:text-dark-200"><span className="font-medium">Doctor:</span> {doctorNombre}</p>
              <p className="text-sm text-gray-700 dark:text-dark-200"><span className="font-medium">Fecha:</span> {dayjs(fecha).format("dddd D [de] MMMM, YYYY")}</p>
              <p className="text-sm text-gray-700 dark:text-dark-200"><span className="font-medium">Hora:</span> {horaSeleccionada}</p>
              <p className="text-sm text-gray-700 dark:text-dark-200"><span className="font-medium">Consultorio:</span> {consultorio}</p>
            </Card>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-dark-200">Motivo de consulta *</label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
                rows={2}
                placeholder="Describe brevemente el motivo de tu visita"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-dark-200">Observaciones (opcional)</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={2}
                placeholder="Alergias, medicamentos actuales, etc."
                className={inputClass}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(2)} className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-dark-500 dark:text-dark-200 dark:hover:bg-dark-600">
                Atrás
              </button>
              <button
                type="submit"
                disabled={loading || !motivo.trim()}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-indigo-700 disabled:opacity-40"
              >
                {loading ? "Programando..." : "Confirmar Cita"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
