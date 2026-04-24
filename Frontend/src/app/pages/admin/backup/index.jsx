import { useEffect, useState, useCallback } from "react";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import { ConfirmModal } from "components/shared/ConfirmModal";
import {
  CircleStackIcon,
  CheckCircleIcon,
  XCircleIcon,
  CloudArrowDownIcon,
  TrashIcon,
  PlayIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import { toast } from "sonner";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const EstadoBadge = ({ estado }) => {
  const cfg = {
    exitoso: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
    fallido: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  };
  const Icon = estado === "exitoso" ? CheckCircleIcon : XCircleIcon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg[estado] ?? ""}`}>
      <Icon className="h-3.5 w-3.5" />
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
};

export default function Backup() {
  const [backups, setBackups]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [creando, setCreando]     = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: "", description: "", actionText: "", onOk: null });

  const fetchBackups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/backup");
      if (Array.isArray(res.data.resultado)) setBackups(res.data.resultado);
    } catch {
      toast.error("Error al cargar el historial de backups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBackups(); }, [fetchBackups]);

  const handleCrearBackup = () => {
    setConfirmConfig({
      title: "¿Generar backup ahora?",
      description: "Se creará un respaldo completo de la base de datos en este momento.",
      actionText: "Generar",
      onOk: async () => {
        setConfirmLoading(true);
        setCreando(true);
        try {
          const res = await axios.post("/backup");
          if (res.data.success) {
            toast.success(`Backup creado: ${res.data.nombre} (${formatBytes(res.data.tamanio)})`);
            fetchBackups();
          } else {
            toast.error(`Error al crear backup: ${res.data.error}`);
          }
        } catch {
          toast.error("Error al crear el backup");
        } finally {
          setCreando(false);
          setConfirmLoading(false);
          setConfirmOpen(false);
        }
      },
    });
    setConfirmOpen(true);
  };

  const handleDescargar = (nombre) => {
    // Construye la URL de descarga con el token actual
    const token = localStorage.getItem("authToken");
    const url = `${axios.defaults.baseURL}/backup/descargar/${nombre}`;
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", nombre);
    // Descarga usando fetch para incluir el token
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        a.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => toast.error("Error al descargar el backup"));
  };

  const handleEliminar = (nombre) => {
    setConfirmConfig({
      title: `¿Eliminar backup?`,
      description: `Se eliminará permanentemente "${nombre}". Esta acción no se puede deshacer.`,
      actionText: "Eliminar",
      onOk: async () => {
        setConfirmLoading(true);
        setEliminando(nombre);
        try {
          await axios.delete(`/backup/${nombre}`);
          toast.success("Backup eliminado");
          fetchBackups();
        } catch {
          toast.error("Error al eliminar el backup");
        } finally {
          setEliminando(null);
          setConfirmLoading(false);
          setConfirmOpen(false);
        }
      },
    });
    setConfirmOpen(true);
  };

  const exitosos = backups.filter((b) => b.estado === "exitoso").length;
  const fallidos  = backups.filter((b) => b.estado === "fallido").length;
  const totalSize = backups.reduce((acc, b) => acc + (b.tamanio_bytes || 0), 0);

  return (
    <Page title="Gestión de Backups">
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-50">
              Respaldo de Base de Datos
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
              El sistema genera backups automáticos diariamente a las 2:00 AM.
              Se conservan los últimos 30 backups.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchBackups}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-200"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Actualizar
            </button>
            <button
              onClick={handleCrearBackup}
              disabled={creando}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <PlayIcon className="h-4 w-4" />
              {creando ? "Generando..." : "Crear backup ahora"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-dark-500 dark:bg-dark-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
              <CircleStackIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-dark-50">{backups.length}</p>
              <p className="text-sm text-gray-500 dark:text-dark-300">Backups totales</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-dark-500 dark:bg-dark-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-dark-50">{exitosos}</p>
              <p className="text-sm text-gray-500 dark:text-dark-300">Exitosos / {fallidos} fallidos</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-dark-500 dark:bg-dark-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
              <CloudArrowDownIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-dark-50">{formatBytes(totalSize)}</p>
              <p className="text-sm text-gray-500 dark:text-dark-300">Espacio utilizado</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
          <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Los archivos de backup se almacenan en{" "}
            <code className="rounded bg-blue-100 px-1 font-mono text-xs dark:bg-blue-500/20">
              Backend/backups/
            </code>{" "}
            en el servidor. Descárgalos y guárdalos en un lugar seguro para garantizar la recuperación ante fallos.
          </p>
        </div>

        {/* Tabla */}
        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 p-4 dark:border-dark-500">
            <h2 className="font-semibold text-gray-800 dark:text-dark-50">
              Historial de Backups
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <ArrowPathIcon className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : backups.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <CircleStackIcon className="h-12 w-12 text-gray-300 dark:text-dark-500" />
              <p className="text-gray-500 dark:text-dark-300">No hay backups registrados aún.</p>
              <button
                onClick={handleCrearBackup}
                className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Crear el primer backup
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 dark:border-dark-500 dark:bg-dark-600">
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-dark-300">Archivo</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-dark-300">Tamaño</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-dark-300">Estado</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-dark-300">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-dark-300">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-500">
                  {backups.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-600/50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-dark-200">
                        {b.nombre_archivo}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-dark-300">
                        {formatBytes(b.tamanio_bytes)}
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge estado={b.estado} />
                        {b.estado === "fallido" && b.error && (
                          <p className="mt-0.5 text-xs text-red-500">{b.error}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-dark-400">
                        {dayjs(b.creado_en).format("DD/MM/YYYY HH:mm")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {b.estado === "exitoso" && (
                            <button
                              onClick={() => handleDescargar(b.nombre_archivo)}
                              title="Descargar"
                              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-dark-500 dark:bg-dark-600 dark:text-dark-200"
                            >
                              <CloudArrowDownIcon className="h-3.5 w-3.5" />
                              Descargar
                            </button>
                          )}
                          <button
                            onClick={() => handleEliminar(b.nombre_archivo)}
                            disabled={eliminando === b.nombre_archivo}
                            title="Eliminar"
                            className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:bg-dark-600 dark:text-red-400"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      <ConfirmModal
        show={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onOk={confirmConfig.onOk}
        confirmLoading={confirmLoading}
        state="pending"
        messages={{
          pending: {
            title: confirmConfig.title,
            description: confirmConfig.description,
            actionText: confirmConfig.actionText,
          },
        }}
      />
    </Page>
  );
}
