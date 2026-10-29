import React, { useState, useMemo } from 'react';
import { useAlmacenes } from '../hooks/useAlmacenes';
import { Almacen, AlmacenTipo, TIPOS_ALMACEN_META } from '../types';
import { CreateAlmacenModal } from './CreateAlmacenModal';
import { EditAlmacenModal } from './EditAlmacenModal';
import { AlmacenDetailModal } from './AlmacenDetailModal';
import {
  Warehouse,
  Plus,
  Search,
  MapPin,
  Barcode,
  Package,
  Layers,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  RefreshCw,
  LayoutGrid,
  List as ListIcon,
  Eye,
  UtensilsCrossed,
  Sparkles,
  Laptop,
  FileText,
  Wrench,
  Tag,
} from 'lucide-react';

export const AlmacenesList: React.FC = () => {
  const [selectedTipo, setSelectedTipo] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtroActivo, setFiltroActivo] = useState<'ALL' | 'ACTIVO' | 'INACTIVO'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAlmacen, setEditingAlmacen] = useState<Almacen | null>(null);
  const [detailAlmacen, setDetailAlmacen] = useState<Almacen | null>(null);

  const {
    almacenes,
    isLoadingAlmacenes,
    toggleActivo,
    isTogglingActivo,
    deleteAlmacen,
    isDeletingAlmacen,
  } = useAlmacenes({
    activo: filtroActivo === 'ALL' ? undefined : filtroActivo === 'ACTIVO',
    tipo: selectedTipo === 'ALL' ? undefined : selectedTipo,
    search: searchTerm || undefined,
  });

  const filteredAlmacenes = useMemo(() => {
    return almacenes.filter((alm) => {
      if (selectedTipo !== 'ALL' && alm.tipo !== selectedTipo) return false;
      if (filtroActivo === 'ACTIVO' && !alm.activo) return false;
      if (filtroActivo === 'INACTIVO' && alm.activo) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const match =
          alm.nombre.toLowerCase().includes(query) ||
          alm.codigo.toLowerCase().includes(query) ||
          alm.ubicacion.toLowerCase().includes(query) ||
          (alm.categorias && alm.categorias.some((c) => c.nombre.toLowerCase().includes(query)));
        if (!match) return false;
      }
      return true;
    });
  }, [almacenes, selectedTipo, filtroActivo, searchTerm]);

  // Métricas acumuladas
  const metricas = useMemo(() => {
    const total = almacenes.length;
    const activos = almacenes.filter((a) => a.activo).length;
    const capacidadTotal = almacenes.reduce((acc, a) => acc + (a.capacidad || 0), 0);
    const stockTotal = almacenes.reduce((acc, a) => acc + (a.stock_total || 0), 0);
    return { total, activos, capacidadTotal, stockTotal };
  }, [almacenes]);

  const handleToggle = async (alm: Almacen) => {
    try {
      await toggleActivo(alm.id);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Error al cambiar estado';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const handleDelete = async (alm: Almacen) => {
    if (alm.stock_total && alm.stock_total > 0) {
      alert(
        `Acción no permitida:\nEl almacén "${alm.nombre}" tiene actualmente ${alm.stock_total} unidades en stock.\n\nDebes transferir o dar salida a los artículos antes de eliminar el almacén.`
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Confirmas la eliminación del almacén "${alm.nombre}" (${alm.codigo})?\n\nEsta acción registrará un evento de auditoría y no se puede deshacer.`
    );
    if (!confirmed) return;

    try {
      await deleteAlmacen(alm.id);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al eliminar el almacén';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const getTipoIcon = (tipo: AlmacenTipo) => {
    switch (tipo) {
      case 'ALIMENTOS':
        return <UtensilsCrossed className="w-4 h-4" />;
      case 'LIMPIEZA':
        return <Sparkles className="w-4 h-4" />;
      case 'TECNOLOGIA':
        return <Laptop className="w-4 h-4" />;
      case 'PAPELERIA':
        return <FileText className="w-4 h-4" />;
      case 'MANTENIMIENTO':
        return <Wrench className="w-4 h-4" />;
      case 'GENERAL':
        return <Warehouse className="w-4 h-4" />;
      default:
        return <Warehouse className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/80 p-4 flex items-center">
          <div className="p-3 rounded-lg bg-indigo-500 text-white mr-4 shadow-sm">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Almacenes Registrados</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{metricas.total}</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/80 p-4 flex items-center">
          <div className="p-3 rounded-lg bg-emerald-500 text-white mr-4 shadow-sm">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Almacenes Operativos</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{metricas.activos}</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/80 p-4 flex items-center">
          <div className="p-3 rounded-lg bg-blue-500 text-white mr-4 shadow-sm">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Capacidad Total Instalada</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {metricas.capacidadTotal > 0 ? `${metricas.capacidadTotal} u.` : 'Dinámica'}
            </p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/80 p-4 flex items-center">
          <div className="p-3 rounded-lg bg-purple-500 text-white mr-4 shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Stock Total en Almacenes</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {metricas.stockTotal} <span className="text-xs font-normal text-slate-500">unidades</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Pestañas de Filtro por Tipo de Almacén */}
      <div className="border-b border-slate-200 bg-white px-4 pt-3 rounded-t-xl border border-slate-200/80">
        <div className="flex space-x-2 overflow-x-auto pb-3 text-xs scrollbar-none">
          <button
            onClick={() => setSelectedTipo('ALL')}
            className={`px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              selectedTipo === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>Todos los Almacenes</span>
            <span
              className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedTipo === 'ALL' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {almacenes.length}
            </span>
          </button>

          {(Object.keys(TIPOS_ALMACEN_META) as AlmacenTipo[]).map((tipoKey) => {
            const meta = TIPOS_ALMACEN_META[tipoKey];
            const isSelected = selectedTipo === tipoKey;
            const count = almacenes.filter((a) => a.tipo === tipoKey).length;
            return (
              <button
                key={tipoKey}
                onClick={() => setSelectedTipo(tipoKey)}
                className={`px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {getTipoIcon(tipoKey)}
                <span>{meta.label}</span>
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Barra de Control: Búsqueda, Filtro Estado, Modo Vista y Nuevo Almacén */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-1 items-center space-x-3 max-w-lg">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, código, ubicación o categoría..."
              className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <select
            value={filtroActivo}
            onChange={(e) => setFiltroActivo(e.target.value as any)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-700 focus:bg-white focus:ring-indigo-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVO">Solo Activos</option>
            <option value="INACTIVO">Solo Inactivos</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {/* Selector de Vista: Tarjetas vs Tabla */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              title="Vista en Cuadrícula"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Vista en Tabla"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white shadow-sm text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Botón Nuevo Almacén */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Almacén</span>
          </button>
        </div>
      </div>

      {/* 4. Contenido: Vista Grid o Vista Tabla */}
      {isLoadingAlmacenes ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
          <p className="text-sm">Cargando almacenes e inventarios de infraestructura...</p>
        </div>
      ) : filteredAlmacenes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200">
          <Warehouse className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-700">No se encontraron almacenes</h4>
          <p className="text-xs text-slate-500 mt-1">
            No hay registros que coincidan con los filtros seleccionados.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Almacén</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* VISTA EN TARJETAS (GRID) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAlmacenes.map((alm) => {
            const meta = TIPOS_ALMACEN_META[alm.tipo || 'GENERAL'] || TIPOS_ALMACEN_META.GENERAL;
            const porcentaje = alm.porcentaje_ocupacion ?? 0;

            return (
              <div
                key={alm.id}
                className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  alm.activo ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50/50 opacity-80'
                }`}
              >
                {/* Cabecera de la tarjeta */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl ${meta.iconBg} ${meta.iconText}`}>
                        {getTipoIcon(alm.tipo || 'GENERAL')}
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {alm.codigo}
                        </span>
                        <h4 className="text-base font-bold text-slate-800 mt-1 leading-snug">
                          {alm.nombre}
                        </h4>
                      </div>
                    </div>

                    {alm.activo ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        <span>Activo</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <XCircle className="w-3 h-3" />
                        <span>Inactivo</span>
                      </span>
                    )}
                  </div>

                  {/* Tipo de almacén */}
                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* Ubicación */}
                  <p className="text-xs text-slate-500 flex items-center space-x-1.5 mt-2.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{alm.ubicacion}</span>
                  </p>

                  {/* Categorías enlazadas */}
                  {alm.categorias && alm.categorias.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {alm.categorias.map((c) => (
                        <span
                          key={c.id}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                        >
                          {c.nombre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Indicador de Capacidad y Ocupación */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-500 flex items-center space-x-1">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span>Stock / Capacidad:</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        {alm.stock_total ?? 0}
                        {alm.capacidad ? ` / ${alm.capacidad} u.` : ' u.'}
                      </span>
                    </div>

                    {alm.capacidad ? (
                      <div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              porcentaje > 90
                                ? 'bg-rose-500'
                                : porcentaje > 70
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(porcentaje, 100)}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-right text-slate-400 mt-1">
                          {porcentaje}% de ocupación
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400">Capacidad no parametrizada</p>
                    )}
                  </div>
                </div>

                {/* Pie de tarjeta con acciones */}
                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setDetailAlmacen(alm)}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Stock ({alm.total_productos ?? 0})</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleToggle(alm)}
                      disabled={isTogglingActivo}
                      title={alm.activo ? 'Desactivar almacén' : 'Activar almacén'}
                      className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        alm.activo
                          ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
                          : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {alm.activo ? 'Desactivar' : 'Activar'}
                    </button>

                    <button
                      onClick={() => setEditingAlmacen(alm)}
                      title="Editar almacén"
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(alm)}
                      disabled={isDeletingAlmacen}
                      title="Eliminar almacén"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VISTA EN TABLA */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Código & Almacén</th>
                  <th className="px-6 py-3.5">Tipo de Suministro</th>
                  <th className="px-6 py-3.5">Ubicación Física</th>
                  <th className="px-6 py-3.5 text-center">Artículos & Stock</th>
                  <th className="px-6 py-3.5 text-center">Ocupación</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlmacenes.map((alm) => {
                  const meta = TIPOS_ALMACEN_META[alm.tipo || 'GENERAL'] || TIPOS_ALMACEN_META.GENERAL;
                  const porcentaje = alm.porcentaje_ocupacion ?? 0;
                  return (
                    <tr key={alm.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Código & Nombre */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${meta.iconBg} ${meta.iconText}`}>
                            {getTipoIcon(alm.tipo || 'GENERAL')}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {alm.nombre}
                            </p>
                            <p className="font-mono text-xs text-slate-400 mt-0.5">
                              {alm.codigo}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="px-6 py-4">
                        <div>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
                          >
                            {meta.label}
                          </span>
                          {alm.categorias && alm.categorias.length > 0 && (
                            <p className="text-[11px] text-slate-400 mt-1">
                              {alm.categorias.map((c) => c.nombre).join(', ')}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Ubicación */}
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-700 flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{alm.ubicacion}</span>
                        </p>
                      </td>

                      {/* Artículos & Stock */}
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-slate-800 text-sm">
                          {alm.stock_total ?? 0}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">
                          ({alm.total_productos ?? 0} líneas)
                        </span>
                      </td>

                      {/* Ocupación */}
                      <td className="px-6 py-4 text-center">
                        {alm.capacidad ? (
                          <div className="w-24 mx-auto">
                            <span className="text-xs font-semibold text-slate-700">
                              {porcentaje}%
                            </span>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  porcentaje > 90
                                    ? 'bg-rose-500'
                                    : porcentaje > 70
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(porcentaje, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Sin límite</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 text-center">
                        {alm.activo ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            <span>Activo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            <XCircle className="w-3 h-3" />
                            <span>Inactivo</span>
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setDetailAlmacen(alm)}
                            title="Ver inventario"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggle(alm)}
                            disabled={isTogglingActivo}
                            title={alm.activo ? 'Desactivar almacén' : 'Activar almacén'}
                            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                              alm.activo
                                ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
                                : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            {alm.activo ? 'Desactivar' : 'Activar'}
                          </button>

                          <button
                            onClick={() => setEditingAlmacen(alm)}
                            title="Editar almacén"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(alm)}
                            disabled={isDeletingAlmacen}
                            title="Eliminar almacén"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales */}
      <CreateAlmacenModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditAlmacenModal
        almacen={editingAlmacen}
        isOpen={!!editingAlmacen}
        onClose={() => setEditingAlmacen(null)}
      />

      <AlmacenDetailModal
        almacen={detailAlmacen}
        isOpen={!!detailAlmacen}
        onClose={() => setDetailAlmacen(null)}
      />
    </div>
  );
};
