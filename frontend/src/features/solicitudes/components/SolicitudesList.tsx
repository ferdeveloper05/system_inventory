import React from 'react';
import { Solicitud, SolicitudEstado, DepartamentoRef } from '../types';
import {
  useAuthStore,
  isUserAdmin,
  isUserDirector,
  isUserAnalista,
  isUserInfraestructura,
} from '../../../store/authStore';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  RotateCw,
  Truck,
  Lock,
  Building2,
  User as UserIcon,
  Boxes,
  AlertTriangle,
  Trash2,
  Check,
  FileCheck2,
  Calendar,
} from 'lucide-react';

interface SolicitudesListProps {
  solicitudes: Solicitud[];
  departamentos: DepartamentoRef[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedEstado: string;
  setSelectedEstado: (e: string) => void;
  selectedDepartamento: string;
  setSelectedDepartamento: (d: string) => void;
  onRefresh: () => void;
  onOpenCreate: () => void;
  onOpenDetail: (solicitud: Solicitud) => void;
  onOpenDespachar: (solicitud: Solicitud) => void;
  onOpenCerrar: (solicitud: Solicitud) => void;
  onAprobarDirector?: (solicitud: Solicitud) => void;
  onAceptarInfraestructura?: (solicitud: Solicitud) => void;
  onDelete?: (solicitud: Solicitud) => void;
  isActionLoading?: boolean;
}

export const SolicitudesList: React.FC<SolicitudesListProps> = ({
  solicitudes,
  departamentos,
  isLoading,
  searchTerm,
  setSearchTerm,
  selectedEstado,
  setSelectedEstado,
  selectedDepartamento,
  setSelectedDepartamento,
  onRefresh,
  onOpenCreate,
  onOpenDetail,
  onOpenDespachar,
  onOpenCerrar,
  onAprobarDirector,
  onAceptarInfraestructura,
  onDelete,
  isActionLoading,
}) => {
  const { user } = useAuthStore();
  const isAdmin = isUserAdmin(user);
  const isDirector = isUserDirector(user);
  const isAnalista = isUserAnalista(user);
  const isInfra = isUserInfraestructura(user);

  // Badge de Estado
  const renderEstadoBadge = (solicitud: Solicitud) => {
    switch (solicitud.estado) {
      case 'Abierto':
        if (!solicitud.aprobada_por_director) {
          return (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs"
              title="Pendiente de aprobación por el Director del departamento solicitante"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              Abierto · Pendiente Dir.
            </span>
          );
        }
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-300 shadow-xs"
            title="Aprobada internamente. En espera de aceptación por Infraestructura"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Abierto · Para Infraestructura
          </span>
        );

      case 'En Proceso':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-300 shadow-xs"
            title="Aceptada por Infraestructura. En preparación para despacho"
          >
            <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
            En Proceso
          </span>
        );

      case 'Entrega en Camino':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-300 shadow-xs"
            title="Despachada con comprobante. En tránsito hacia departamento solicitante"
          >
            <Truck className="w-3.5 h-3.5 text-orange-600" />
            Entrega en Camino
          </span>
        );

      case 'Cerrado':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs"
            title="Recepción confirmada con foto de evidencia. Proceso completado"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Cerrado
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            {solicitud.estado}
          </span>
        );
    }
  };

  // Cálculo de permisos por fila
  const getRowActions = (s: Solicitud) => {
    const sDeptId =
      s.id_departamento_solicitante ??
      (s as any).id_departamento ??
      s.empleado_solicita?.id_departamento;
    const isSameDept = Boolean(
      user?.id_departamento && sDeptId && user.id_departamento === sDeptId
    );

    // 1. Aprobar Director (Abierto y sin aprobar)
    const canAprobarDirector =
      s.estado === 'Abierto' &&
      !s.aprobada_por_director &&
      (isAdmin || (isDirector && isSameDept));

    // 2. Aceptar Infraestructura (Abierto y aprobada)
    const canAceptarInfra =
      s.estado === 'Abierto' &&
      s.aprobada_por_director &&
      (isAdmin || (isDirector && isInfra));

    // 3. Despachar (En Proceso)
    const canDespachar =
      s.estado === 'En Proceso' &&
      (isAdmin || isInfra);

    // 4. Cerrar (Entrega en Camino)
    const canCerrar =
      s.estado === 'Entrega en Camino' &&
      (isAdmin || ((isAnalista || isDirector) && isSameDept));

    // 5. Eliminar (solo Admin o solicitud Abierta no aprobada)
    const canDelete = isAdmin || (s.estado === 'Abierto' && !s.aprobada_por_director && isSameDept);

    return {
      canAprobarDirector,
      canAceptarInfra,
      canDespachar,
      canCerrar,
      canDelete,
    };
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Acciones */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 items-stretch sm:items-center">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Nº, justificación o solicitante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
            />
          </div>

          {/* Filtro de Estado */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="Abierto">Abierto</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Entrega en Camino">Entrega en Camino</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>

          {/* Filtro de Departamento (si hay catálogo) */}
          {departamentos && departamentos.length > 0 && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400 hidden sm:block" />
              <select
                value={selectedDepartamento}
                onChange={(e) => setSelectedDepartamento(e.target.value)}
                className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium max-w-[220px] truncate"
              >
                <option value="ALL">Todos los Dptos.</option>
                {departamentos.map((dept) => {
                  const deptId = (dept as any).id ?? (dept as any).id_departamento;
                  return (
                    <option
                      key={deptId !== undefined ? deptId : dept.nombre}
                      value={deptId !== undefined ? deptId.toString() : ''}
                    >
                      {dept.nombre}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Refrescar */}
          <button
            onClick={onRefresh}
            title="Recargar datos"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center justify-center shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        {/* Botón de Creación */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Nueva Solicitud
          </button>
        </div>
      </div>

      {/* Tabla de Solicitudes */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nº Solicitud / Justificación</th>
                <th className="px-5 py-3.5">Departamento</th>
                <th className="px-5 py-3.5">Solicitante</th>
                <th className="px-5 py-3.5">Fecha</th>
                <th className="px-5 py-3.5">Ítems</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span>Cargando solicitudes...</span>
                    </div>
                  </td>
                </tr>
              ) : solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Boxes className="w-10 h-10 text-slate-300" />
                      <span className="font-medium text-slate-600">No se encontraron solicitudes</span>
                      <p className="text-xs text-slate-400">
                        {searchTerm || selectedEstado !== 'ALL' || selectedDepartamento !== 'ALL'
                          ? 'Intenta cambiar los filtros seleccionados.'
                          : 'Crea una nueva solicitud para iniciar el flujo de despacho.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                solicitudes.map((solicitud) => {
                  const actions = getRowActions(solicitud);
                  const totalUnidades = (solicitud.detalles || []).reduce(
                    (acc, item) => acc + item.cantidad_solicitada,
                    0
                  );
                  const solId = solicitud.id ?? (solicitud as any).id_solicitud;
                  const justificacion =
                    solicitud.motivo_justificacion ||
                    (solicitud as any).justificacion ||
                    'Sin justificación';
                  const departamentoNombre =
                    solicitud.departamento_solicitante?.nombre ||
                    (solicitud as any).departamento_nombre ||
                    'No especificado';
                  const solicitanteNombre = solicitud.empleado_solicita
                    ? `${solicitud.empleado_solicita.nombre} ${solicitud.empleado_solicita.apellido}`.trim()
                    : (solicitud as any).solicitante_nombre || 'Usuario';
                  const solicitanteCargo =
                    solicitud.empleado_solicita?.cargo ||
                    (solicitud as any).solicitante_cargo;

                  return (
                    <tr
                      key={solId}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Nº y Justificación */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <button
                            onClick={() => onOpenDetail(solicitud)}
                            className="font-semibold text-blue-600 hover:text-blue-800 text-left hover:underline flex items-center gap-1.5"
                          >
                            <span>{solicitud.numero_solicitud}</span>
                          </button>
                          <span
                            className="text-xs text-slate-500 line-clamp-1 max-w-[260px] mt-0.5"
                            title={justificacion}
                          >
                            {justificacion}
                          </span>
                        </div>
                      </td>

                      {/* Departamento */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-700 text-xs sm:text-sm">
                            {departamentoNombre}
                          </span>
                        </div>
                      </td>

                      {/* Solicitante */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                            {solicitanteNombre ? solicitanteNombre.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800 text-xs">
                              {solicitanteNombre}
                            </span>
                            {solicitanteCargo && (
                              <span className="text-[11px] text-slate-400">
                                {solicitanteCargo}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(solicitud.fecha_solicitud)}</span>
                        </div>
                      </td>

                      {/* Ítems */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {(solicitud.detalles || []).length} ítems
                          </span>
                          <span className="text-xs text-slate-400">
                            ({totalUnidades} uds)
                          </span>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {renderEstadoBadge(solicitud)}
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          {/* Ver Detalle / Bitácora */}
                          <button
                            onClick={() => onOpenDetail(solicitud)}
                            title="Ver detalle y bitácora completa"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 1. Botón Aprobar Director */}
                          {actions.canAprobarDirector && onAprobarDirector && (
                            <button
                              onClick={() => onAprobarDirector(solicitud)}
                              disabled={isActionLoading}
                              title="Aprobar internamente como Director"
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors inline-flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Aprobar</span>
                            </button>
                          )}

                          {/* 2. Botón Aceptar Infraestructura */}
                          {actions.canAceptarInfra && onAceptarInfraestructura && (
                            <button
                              onClick={() => onAceptarInfraestructura(solicitud)}
                              disabled={isActionLoading}
                              title="Aceptar solicitud como Director de Infraestructura"
                              className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-300 transition-colors inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Aceptar</span>
                            </button>
                          )}

                          {/* 3. Botón Despachar */}
                          {actions.canDespachar && (
                            <button
                              onClick={() => onOpenDespachar(solicitud)}
                              title="Ejecutar despacho y descuento de stock"
                              className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-300 transition-colors inline-flex items-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Despachar</span>
                            </button>
                          )}

                          {/* 4. Botón Conformidad y Cerrar */}
                          {actions.canCerrar && (
                            <button
                              onClick={() => onOpenCerrar(solicitud)}
                              title="Confirmar recepción de insumos y cerrar caso"
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors inline-flex items-center gap-1"
                            >
                              <FileCheck2 className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Recibir</span>
                            </button>
                          )}

                          {/* 5. Botón Eliminar */}
                          {actions.canDelete && onDelete && (
                            <button
                              onClick={() => onDelete(solicitud)}
                              title="Eliminar solicitud"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer con Resumen */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Mostrando <strong className="text-slate-700">{solicitudes.length}</strong> solicitudes
            registradas
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Abierto
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              En Proceso
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              Entrega en Camino
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Cerrado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
