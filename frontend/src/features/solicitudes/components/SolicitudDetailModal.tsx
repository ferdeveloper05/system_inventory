import React, { useState } from 'react';
import { Solicitud } from '../types';
import { useSolicitudes } from '../hooks/useSolicitudes';
import {
  useAuthStore,
  isUserAdmin,
  isUserDirector,
  isUserInfraestructura,
} from '../../../store/authStore';
import { PhotoViewerModal } from './PhotoViewerModal';
import {
  X,
  Printer,
  CheckCircle2,
  Clock,
  RotateCw,
  Truck,
  Building2,
  User,
  Calendar,
  Warehouse,
  Boxes,
  FileCheck2,
  Image as ImageIcon,
  AlertTriangle,
  Lock,
  Trash2,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface SolicitudDetailModalProps {
  solicitud: Solicitud | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDespachar?: (solicitud: Solicitud) => void;
  onOpenCerrar?: (solicitud: Solicitud) => void;
  onSuccess?: () => void;
}

export const SolicitudDetailModal: React.FC<SolicitudDetailModalProps> = ({
  solicitud,
  isOpen,
  onClose,
  onOpenDespachar,
  onOpenCerrar,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const isAdmin = isUserAdmin(user);
  const isDirector = isUserDirector(user);
  const isInfra = isUserInfraestructura(user);

  const {
    aprobarDirector,
    isAprobando,
    aceptarInfraestructura,
    isAceptando,
    deleteSolicitud,
    isDeleting,
  } = useSolicitudes();

  // Modal para ver foto ampliada
  const [photoViewer, setPhotoViewer] = useState<{ url: string; title: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !solicitud) return null;

  // Comprobación de roles y departamentos sobre la solicitud actual
  const userDepId = user?.id_empleado ? user?.id_departamento : undefined;
  const isMismoDepartamentoSolicitante =
    isAdmin || (userDepId && solicitud.id_departamento_solicitante === userDepId);

  // Permisos para cada acción:
  // 1. Aprobar internamente: Director del mismo departamento solicitante o Admin
  const canAprobarInternamente =
    solicitud.estado === 'Abierto' &&
    !solicitud.aprobada_por_director &&
    (isAdmin || (isDirector && isMismoDepartamentoSolicitante));

  // 2. Aceptar en Infraestructura: Director de Infraestructura o Admin
  const canAceptarInfraestructura =
    solicitud.estado === 'Abierto' &&
    solicitud.aprobada_por_director &&
    (isAdmin || (isDirector && isInfra));

  // 3. Despachar: Analista o Director de Infraestructura o Admin
  const canDespachar =
    solicitud.estado === 'En Proceso' && (isAdmin || isInfra);

  // 4. Conformidad y Cierre: Personal del departamento solicitante o Admin
  const canCerrar =
    solicitud.estado === 'Entrega en Camino' &&
    (isAdmin || isMismoDepartamentoSolicitante);

  // 5. Eliminar: Creador, Director solicitante o Admin mientras esté en 'Abierto'
  const canEliminar =
    solicitud.estado === 'Abierto' && (isAdmin || isMismoDepartamentoSolicitante);

  const handleAprobarDirector = async () => {
    setErrorMessage(null);
    try {
      await aprobarDirector(solicitud.id);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(typeof detail === 'string' ? detail : 'Error al aprobar la solicitud');
    }
  };

  const handleAceptarInfraestructura = async () => {
    setErrorMessage(null);
    try {
      await aceptarInfraestructura(solicitud.id);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(typeof detail === 'string' ? detail : 'Error al aceptar la solicitud');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Confirma eliminar permanentemente la solicitud #${solicitud.numero_solicitud}?`)) {
      return;
    }
    setErrorMessage(null);
    try {
      await deleteSolicitud(solicitud.id);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(typeof detail === 'string' ? detail : 'Error al eliminar la solicitud');
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Abierto':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Abierto {solicitud.aprobada_por_director ? '(Aprobada)' : '(Pendiente Director)'}
          </span>
        );
      case 'En Proceso':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <RotateCw className="w-3.5 h-3.5 mr-1 text-blue-600 animate-spin" />
            En Proceso (Infraestructura)
          </span>
        );
      case 'Entrega en Camino':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <Truck className="w-3.5 h-3.5 mr-1 text-purple-600" />
            Entrega en Camino
          </span>
        );
      case 'Cerrado':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Cerrado (Conformidad)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            {estado}
          </span>
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
          {/* Cabecera */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
                <Boxes className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold tracking-tight">
                    Solicitud: {solicitud.numero_solicitud}
                  </h3>
                  {getStatusBadge(solicitud.estado)}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Trazabilidad operativa, autorizaciones y control de entrega de insumos
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido Scrollable */}
          <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Aviso de Caso Cerrado */}
            {solicitud.estado === 'Cerrado' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-emerald-900 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Caso Cerrado & Conforme:</p>
                  <p className="mt-0.5 text-emerald-800">
                    Los productos fueron recibidos a conformidad por el departamento solicitante y las existencias han sido descontadas formalmente del inventario.
                  </p>
                </div>
              </div>
            )}

            {/* Metadatos Generales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-500 font-bold uppercase tracking-wider mb-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Departamento Solicitante</span>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {solicitud.departamento_solicitante?.nombre || 'Departamento Solicitante'}
                </p>
                <p className="text-slate-500">
                  {solicitud.empleado_solicita
                    ? `${solicitud.empleado_solicita.nombre} ${solicitud.empleado_solicita.apellido} (${solicitud.empleado_solicita.cargo})`
                    : `Empleado #${solicitud.id_empleado_solicita}`}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-500 font-bold uppercase tracking-wider mb-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Fecha de Requerimiento</span>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(solicitud.fecha_solicitud).toLocaleString('es-ES', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                <p className="text-slate-500">
                  Almacén Base: {solicitud.almacen_origen?.nombre || 'General'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-500 font-bold uppercase tracking-wider mb-1">
                  <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Resumen de Insumos</span>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {solicitud.detalles.reduce((acc, it) => acc + (it.cantidad_solicitada || 0), 0)} unidades
                </p>
                <p className="text-slate-500">
                  {solicitud.detalles.length} producto(s) en lista
                </p>
              </div>
            </div>

            {/* Justificación si existe */}
            {solicitud.motivo_justificacion && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Justificación del Requerimiento:</span>
                <p className="text-slate-600 whitespace-pre-wrap">{solicitud.motivo_justificacion}</p>
              </div>
            )}

            {/* LÍNEA DE TIEMPO / BITÁCORA OPERATIVA */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Línea de Tiempo & Trazabilidad de Estados
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                {/* Paso 1: Creación & Aprobación Solicitante */}
                <div className={`p-3 rounded-xl border ${
                  solicitud.aprobada_por_director ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200'
                }`}>
                  <div className="flex items-center space-x-1.5 font-bold mb-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Aprobación Interna</span>
                  </div>
                  {solicitud.aprobada_por_director ? (
                    <>
                      <p className="text-emerald-700 font-semibold">Aprobada por Director</p>
                      <p className="text-[11px] text-slate-500">
                        {solicitud.director_aprueba?.username || 'Director Solicitante'}
                      </p>
                      {solicitud.fecha_aprobacion_director && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(solicitud.fecha_aprobacion_director).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-amber-700 font-medium italic">Pendiente de Director Solicitante</p>
                  )}
                </div>

                {/* Paso 2: Aceptación Infraestructura */}
                <div className={`p-3 rounded-xl border ${
                  solicitud.id_director_infraestructura ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-1.5 font-bold mb-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Aceptación Infra.</span>
                  </div>
                  {solicitud.id_director_infraestructura ? (
                    <>
                      <p className="text-blue-700 font-semibold">Aceptada en Infraestructura</p>
                      <p className="text-[11px] text-slate-500">
                        {solicitud.director_infraestructura?.username || 'Director Infraestructura'}
                      </p>
                      {solicitud.fecha_aceptacion_infraestructura && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(solicitud.fecha_aceptacion_infraestructura).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-slate-400 italic">Esperando aceptación de Infraestructura</p>
                  )}
                </div>

                {/* Paso 3: Despacho & Evidencia Salida */}
                <div className={`p-3 rounded-xl border ${
                  solicitud.comprobante_despacho_url ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-1.5 font-bold mb-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Despacho Físico</span>
                  </div>
                  {solicitud.comprobante_despacho_url ? (
                    <>
                      <p className="text-purple-700 font-semibold">Despacho Completado</p>
                      <p className="text-[11px] text-slate-500">
                        Por: {solicitud.usuario_despacha?.username || 'Infraestructura'}
                      </p>
                      <button
                        onClick={() =>
                          setPhotoViewer({
                            url: solicitud.comprobante_despacho_url!,
                            title: `Comprobante de Despacho: ${solicitud.numero_solicitud}`,
                          })
                        }
                        className="mt-1.5 inline-flex items-center space-x-1 text-[11px] font-bold text-blue-700 hover:underline"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Ver Foto Comprobante</span>
                      </button>
                    </>
                  ) : (
                    <p className="text-slate-400 italic">Pendiente de despacho</p>
                  )}
                </div>

                {/* Paso 4: Conformidad & Cierre */}
                <div className={`p-3 rounded-xl border ${
                  solicitud.comprobante_entrega_url ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-1.5 font-bold mb-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">4</span>
                    <span>Conformidad & Cierre</span>
                  </div>
                  {solicitud.comprobante_entrega_url ? (
                    <>
                      <p className="text-emerald-700 font-semibold">Entrega Conforme</p>
                      <p className="text-[11px] text-slate-500">
                        Por: {solicitud.usuario_recibe?.username || 'Solicitante'}
                      </p>
                      <button
                        onClick={() =>
                          setPhotoViewer({
                            url: solicitud.comprobante_entrega_url!,
                            title: `Fotografía de Conformidad: ${solicitud.numero_solicitud}`,
                          })
                        }
                        className="mt-1.5 inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 hover:underline"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Ver Foto Conformidad</span>
                      </button>
                    </>
                  ) : (
                    <p className="text-slate-400 italic">Pendiente de cierre</p>
                  )}
                </div>
              </div>
            </div>

            {/* TABLA DE PRODUCTOS */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Boxes className="w-4 h-4 text-indigo-600" />
                <span>Detalle de Productos e Insumos</span>
              </h4>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-3.5 py-2.5">Producto</th>
                      <th className="px-3.5 py-2.5 text-center">Cant. Solicitada</th>
                      <th className="px-3.5 py-2.5 text-center">Cant. Despachada</th>
                      <th className="px-3.5 py-2.5">Almacén de Salida</th>
                      <th className="px-3.5 py-2.5">Notas del Ítem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {solicitud.detalles.map((det) => (
                      <tr key={det.id} className="hover:bg-slate-50/50">
                        <td className="px-3.5 py-2.5">
                          <span className="font-bold text-slate-900 block">
                            {det.producto?.nombre || `Producto #${det.id_producto}`}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            [{det.producto?.codigo || 'N/A'}] • {det.producto?.categoria?.nombre || 'General'}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-center font-bold text-slate-700 text-sm">
                          {det.cantidad_solicitada}
                        </td>
                        <td className="px-3.5 py-2.5 text-center font-bold text-blue-700 text-sm">
                          {det.cantidad_despachada > 0 ? (
                            det.cantidad_despachada
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5">
                          {det.almacen_despacho ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                              {det.almacen_despacho.nombre} [{det.almacen_despacho.tipo}]
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Por asignar en despacho</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-500">
                          {det.observaciones_item || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Observaciones de Despacho y Entrega si existen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {solicitud.observaciones_despacho && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="font-bold text-blue-900 block mb-1">Notas de Despacho (Infraestructura):</span>
                  <p className="text-blue-800 whitespace-pre-wrap">{solicitud.observaciones_despacho}</p>
                </div>
              )}
              {solicitud.observaciones_entrega && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="font-bold text-emerald-900 block mb-1">Notas de Conformidad (Solicitante):</span>
                  <p className="text-emerald-800 whitespace-pre-wrap">{solicitud.observaciones_entrega}</p>
                </div>
              )}
            </div>
          </div>

          {/* PIE DE ACCIONES (INTERACTIVO SEGÚN ESTADO Y ROL) */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Botón 1: Aprobar por Director Solicitante */}
              {canAprobarInternamente && (
                <button
                  onClick={handleAprobarDirector}
                  disabled={isAprobando}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                  title="Aprobar formalmente y remitir al Departamento de Infraestructura"
                >
                  {isAprobando ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Aprobar y Enviar a Infraestructura</span>
                </button>
              )}

              {/* Botón 2: Aceptar por Director de Infraestructura */}
              {canAceptarInfraestructura && (
                <button
                  onClick={handleAceptarInfraestructura}
                  disabled={isAceptando}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                  title="Aceptar requerimiento e iniciar recolección en almacenes"
                >
                  {isAceptando ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCw className="w-3.5 h-3.5" />
                  )}
                  <span>Aceptar Solicitud (En Proceso)</span>
                </button>
              )}

              {/* Botón 3: Despachar por Infraestructura */}
              {canDespachar && onOpenDespachar && (
                <button
                  onClick={() => onOpenDespachar(solicitud)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-xs"
                  title="Confirmar salida de almacén y adjuntar fotografía comprobante"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Tomar Solicitud y Despachar</span>
                </button>
              )}

              {/* Botón 4: Confirmar Entrega y Cerrar por Solicitante */}
              {canCerrar && onOpenCerrar && (
                <button
                  onClick={() => onOpenCerrar(solicitud)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                  title="Subir fotografía de conformidad y cerrar el caso"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Confirmar Recepción y Cerrar Caso</span>
                </button>
              )}

              {/* Botón Eliminar en fase Abierto */}
              {canEliminar && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                  title="Eliminar solicitud abierta"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Eliminar</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox para fotos de comprobante o conformidad */}
      <PhotoViewerModal
        isOpen={!!photoViewer}
        imageUrl={photoViewer?.url || null}
        title={photoViewer?.title || 'Fotografía de Evidencia'}
        onClose={() => setPhotoViewer(null)}
      />
    </>
  );
};
