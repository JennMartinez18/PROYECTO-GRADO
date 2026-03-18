import { useEffect, useState, useMemo } from "react";
import { Page } from "components/shared/Page";
import { Card, Table, THead, TBody, Tr, Th, Td } from "components/ui";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
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
export default function OdontologoMisPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showView, setShowView] = useState(false);
  const [historiaPaciente, setHistoriaPaciente] = useState([]);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const res = await axios.get("/dashboard/pacientes-doctor");
        if (Array.isArray(res.data.resultado)) setPacientes(res.data.resultado);
      } catch {
        // silencioso
      }
    };
    fetchPacientes();
  }, []);

  const handleVerPaciente = async (paciente) => {
    setSelected(paciente);
    setShowView(true);
    try {
      const res = await axios.get(`/historias-clinicas/paciente/${paciente.id}`);
      if (Array.isArray(res.data.resultado)) setHistoriaPaciente(res.data.resultado);
      else setHistoriaPaciente([]);
    } catch {
      setHistoriaPaciente([]);
    }
  };

  const getInitials = (nombre, apellido) => {
    return `${(nombre || "")[0] || ""}${(apellido || "")[0] || ""}`.toUpperCase();
  };

  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return null;
    const nac = new Date(fechaNac);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  // --- TanStack Table ---
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(() => [
    {
      id: "nombre",
      header: "Paciente",
      accessorFn: (row) => `${row.nombre || ""} ${row.apellido || ""}`,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-xs font-bold text-white">
              {getInitials(p.nombre, p.apellido)}
            </div>
            <div>
              <span className="font-medium text-gray-800 dark:text-dark-50">{p.nombre} {p.apellido}</span>
              <p className="text-xs text-gray-400 dark:text-dark-300">C.I.: {p.cedula}</p>
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
        return g ? (g === "M" ? "Masculino" : "Femenino") : "—";
      },
    },
    {
      accessorKey: "tipo_sangre",
      header: "Tipo Sangre",
      cell: ({ getValue }) => {
        const ts = getValue();
        return ts ? (
          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">{ts}</span>
        ) : "—";
      },
    },
    {
      id: "edad",
      header: "Edad",
      accessorFn: (row) => calcularEdad(row.fecha_nacimiento),
      cell: ({ getValue }) => {
        const edad = getValue();
        return edad !== null ? `${edad} años` : "—";
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => (
        <button
          onClick={() => handleVerPaciente(row.original)}
          className="rounded-lg bg-teal-50 p-2 text-teal-600 transition-colors hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20"
        >
          <EyeIcon className="size-4" />
        </button>
      ),
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
    <Page title="Mis Pacientes">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md">
              <UserGroupIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Mis Pacientes</h2>
              <p className="text-sm text-gray-400 dark:text-dark-300">{pacientes.length} paciente(s) atendidos</p>
            </div>
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar paciente..."
              className="rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100 dark:focus:border-teal-400 dark:focus:bg-dark-700 sm:w-64"
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
                      <p className="mt-2 text-sm text-gray-400 dark:text-dark-300">
                        {search ? "No se encontraron pacientes" : "Aún no tienes pacientes atendidos"}
                      </p>
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

        {/* Modal detalle paciente */}
        {showView && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-700">
              <button onClick={() => { setShowView(false); setSelected(null); }} className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600">
                <XMarkIcon className="size-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-lg font-bold text-white">
                  {getInitials(selected.nombre, selected.apellido)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">{selected.nombre} {selected.apellido}</h3>
                  <p className="text-sm text-gray-400">C.I.: {selected.cedula}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <InfoRow label="Teléfono" value={selected.telefono} />
                <InfoRow label="Email" value={selected.email} />
                <InfoRow label="Dirección" value={selected.direccion} />
                <InfoRow label="Género" value={selected.genero === "M" ? "Masculino" : selected.genero === "F" ? "Femenino" : selected.genero} />
                <InfoRow label="Tipo de Sangre" value={selected.tipo_sangre} />
                <InfoRow label="Fecha de Nacimiento" value={selected.fecha_nacimiento?.split("T")[0]} />
                <InfoRow label="Contacto Emergencia" value={selected.contacto_emergencia} />
                <InfoRow label="Tel. Emergencia" value={selected.telefono_emergencia} />
              </div>

              {/* Historias Clínicas */}
              <div className="mt-6">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-dark-100">
                  <ClipboardDocumentListIcon className="size-4" />
                  Historias Clínicas ({historiaPaciente.length})
                </h4>
                {historiaPaciente.length === 0 ? (
                  <p className="mt-2 text-xs text-gray-400">Sin historial clínico registrado</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {historiaPaciente.map((h) => (
                      <HistoriaAccordion key={h.id} historia={h} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 dark:bg-dark-600">
      <span className="text-xs font-medium text-gray-500 dark:text-dark-300">{label}</span>
      <span className="text-sm text-gray-800 dark:text-dark-100">{value}</span>
    </div>
  );
}

function HistoriaAccordion({ historia }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 dark:border-dark-500 dark:bg-dark-600">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-700 dark:text-dark-100">
            {historia.fecha_atencion?.split("T")[0]} — {historia.motivo_consulta || "Sin motivo"}
          </p>
          {historia.diagnostico && (
            <p className="mt-0.5 truncate text-xs text-violet-600 dark:text-violet-400">
              Dx: {historia.diagnostico}
            </p>
          )}
        </div>
        <ChevronDownIcon className={`ml-2 size-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-2 border-t border-gray-200 px-3 pb-3 pt-2 dark:border-dark-500">
          <HistoriaField label="Motivo de Consulta" value={historia.motivo_consulta} />
          <HistoriaField label="Diagnóstico" value={historia.diagnostico} />
          <HistoriaField label="Observaciones" value={historia.observaciones} />
          <HistoriaField label="Recomendaciones" value={historia.recomendaciones} />
          <HistoriaField label="Próxima Cita" value={historia.proxima_cita?.split("T")[0]} />
          {historia.doctor_nombre && (
            <HistoriaField label="Odontólogo" value={`${historia.doctor_nombre} ${historia.doctor_apellido || ""}`} />
          )}
        </div>
      )}
    </div>
  );
}

function HistoriaField({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-300">{label}</span>
      <p className="text-xs text-gray-700 dark:text-dark-100">{value}</p>
    </div>
  );
}
