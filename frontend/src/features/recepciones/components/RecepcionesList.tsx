import React, { useState } from 'react';
import { useRecepciones } from '../hooks/useRecepciones';
import { Recepcion } from '../types';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  ArrowDownToLine,
  Warehouse,
  UserCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Ban,
  Boxes,
} from 'lucide-react';

interface RecepcionesListProps {
  onOpenCreate: () => void;
  onOpenDetail: (recepcion: Recepcion) => void;
  onOpenAnular: (recepcion: Recepcion) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedAlmacen: string;
  setSelectedAlmacen: (a: string) => void;
  selectedEstado: string;
  setSelectedEstado: (e: string) => void;
}

export const RecepcionesList: React.FC<RecepcionesListProps> = ({
  onOpenCreate,
  onOpenDetail,
  onOpenAnular,
  searchTerm,
  setSearchTerm,
  selectedAlmacen,
  setSelectedAlmacen,
  selectedEstado,
  setSelectedEstado,
}) => {
  const {
    recepciones,
    almacenes,
    isLoading,
    refetch,
  } = useRecepciones({
    search: searchTerm || undefined,
    id_almacen: selectedAlmacen === 'ALL' ? undefined : Number(selectedAlmacen),
    estado: selectedEstado === 'ALL' ? undefined : selectedEstado,
  });

  const getStatusBadge = (estado: string) => {
    switch (estado.toUpperCase()) {
      case 'COMPLETADA':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            COMPLETADA
          </span>
        );
      case 'ANULADA':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3 mr-1 text-rose-600" />
            ANULADA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
            {estado}
          </span>
        );
    }
  };

  const getTipoAlmacenBadge = (tipo?: string) => {
    switch (tipo) {
      case 'TECNOLOGIA':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ALIMENTOS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LIMPIEZA':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'PAPELERIA':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MANTENIMIENTO':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden space-y-4">
      {/* Barra de Búsqueda y Filtros */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center space-x-2 w-full sm:w-auto">
          {/* Buscador */}
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Nº recepción o nota..."
              className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Filtro Almacén */}
          <div className="relative">
            <select
              value={selectedAlmacen}
              onChange={(e) => setSelectedAlmacen(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-medium focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="ALL">Todos los Almacenes</option>
              {almacenes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre} [{a.tipo}]
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Estado */}
          <div className="relative">
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-medium focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="COMPLETADA">Completadas</option>
              <option value="ANULADA">Anuladas</option>
              <option value="BORRADOR">Borrador</option>
            </select>
          </div>

          {/* Refrescar */}
          <button
            onClick={() => refetch()}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refrescar lista"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Botón Nueva Recepción */}
        <button
          onClick={onOpenCreate}
          className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Recepción</span>
        </button>
      </div>

      {/* Tabla de Recepciones */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Nº Recepción / Albarán</th>
              <th className="px-5 py-3.5">Almacén Destino</th>
              <th className="px-5 py-3.5">Funcionario Receptor</th>
              <th className="px-5 py-3.5">Fecha & Hora</th>
              <th className="px-5 py-3.5 text-center">Ítems / Unidades</th>
              <th className="px-5 py-3.5 text-center">Estado</th>
              <th className="px-5 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                  <span>Cargando recepciones de inventario...</span>
                </td>
              </tr>
            ) : recepciones.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  <Boxes className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600">No se encontraron recepciones</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {searchTerm || selectedAlmacen !== 'ALL' || selectedEstado !== 'ALL'
                      ? 'Intente modificar los filtros de búsqueda.'
                      : 'Comience registrando el primer ingreso de mercancía.'}
                  </p>
                  <button
                    onClick={onOpenCreate}
                    className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors inline-flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Registrar Primera Recepción
                  </button>
                </td>
              </tr>
            ) : (
              recepciones.map((r) => {
                const totalUnits = r.detalles?.reduce(
                  (acc, it) => acc + (it.cantidad_recibida || 0),
                  0
                );
                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Código */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                          <ArrowDownToLine className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-mono font-bold text-slate-900 block text-xs">
                            {r.numero_recepcion}
                          </span>
                          {r.id_orden_compra ? (
                            <span className="text-[10px] text-slate-400">
                              OC #{r.id_orden_compra}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Ingreso directo</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Almacén */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800 text-xs">
                        {r.almacen?.nombre || `Almacén #${r.id_almacen}`}
                      </div>
                      {r.almacen?.tipo && (
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getTipoAlmacenBadge(
                            r.almacen.tipo
                          )}`}
                        >
                          {r.almacen.tipo}
                        </span>
                      )}
                    </td>

                    {/* Receptor */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium">
                          {r.empleado_recibe
                            ? `${r.empleado_recibe.nombre} ${r.empleado_recibe.apellido}`
                            : `Empleado #${r.id_empleado_recibe}`}
                        </span>
                      </div>
                      {r.empleado_recibe?.cargo && (
                        <span className="text-[10px] text-slate-400 block ml-5">
                          {r.empleado_recibe.cargo}
                        </span>
                      )}
                    </td>

                    {/* Fecha */}
                    <td className="px-5 py-4 text-xs text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {new Date(r.fecha_recepcion).toLocaleString('es-ES', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Ítems / Unidades */}
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-slate-900 text-xs block">
                        {totalUnits} unds
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({r.detalles?.length || 0} prod.)
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-4 text-center">{getStatusBadge(r.estado)}</td>

                    {/* Acciones */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onOpenDetail(r)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Ver detalle del albarán"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {r.estado !== 'ANULADA' && (
                          <button
                            onClick={() => onOpenAnular(r)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Anular recepción y revertir stock"
                          >
                            <Ban className="w-4 h-4" />
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

      {/* Pie de tabla con total */}
      {!isLoading && recepciones.length > 0 && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Mostrando <strong>{recepciones.length}</strong> recepciones registradas
          </span>
          <span className="font-semibold text-slate-600">
            Total unidades listadas:{' '}
            {recepciones.reduce(
              (acc, r) =>
                acc + (r.detalles?.reduce((a, it) => a + (it.cantidad_recibida || 0), 0) || 0),
              0
            )}
          </span>
        </div>
      )}
    </div>
  );
};

