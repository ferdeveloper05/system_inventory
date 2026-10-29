import React, { useState, useMemo } from 'react';
import { useProductos } from '../hooks/useProductos';
import { Producto, Categoria, detectarDominioCategoria } from '../types';
import { CreateProductoModal } from './CreateProductoModal';
import { EditProductoModal } from './EditProductoModal';
import { ProductoDetailModal } from './ProductoDetailModal';
import { CategoriasModal } from './CategoriasModal';
import {
  Package,
  Plus,
  Search,
  Barcode,
  Layers,
  Warehouse,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  RefreshCw,
  LayoutGrid,
  List as ListIcon,
  Eye,
  Settings2,
  Laptop,
  UtensilsCrossed,
  Sparkles,
  FileText,
  Wrench,
} from 'lucide-react';

export const ProductosList: React.FC = () => {
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | 'ALL'>('ALL');
  const [selectedAlmacenId, setSelectedAlmacenId] = useState<number | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<'ALL' | 'ACTIVO' | 'INACTIVO'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCategoriasOpen, setIsCategoriasOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [detailProducto, setDetailProducto] = useState<Producto | null>(null);

  const {
    productos,
    categorias,
    almacenes,
    isLoadingProductos,
    toggleActivoProducto,
    isTogglingActivoProducto,
    deleteProducto,
    isDeletingProducto,
  } = useProductos({
    categoria_id: selectedCategoriaId === 'ALL' ? undefined : selectedCategoriaId,
    almacen_id: selectedAlmacenId === 'ALL' ? undefined : selectedAlmacenId,
    activo: filtroActivo === 'ALL' ? undefined : filtroActivo === 'ACTIVO',
    search: searchTerm || undefined,
  });

  const filteredProductos = useMemo(() => {
    return productos.filter((p) => {
      if (selectedCategoriaId !== 'ALL' && p.id_categoria !== selectedCategoriaId) return false;
      if (selectedAlmacenId !== 'ALL' && p.id_almacen_predeterminado !== selectedAlmacenId) return false;
      if (filtroActivo === 'ACTIVO' && !p.activo) return false;
      if (filtroActivo === 'INACTIVO' && p.activo) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          p.nombre.toLowerCase().includes(q) ||
          p.codigo.toLowerCase().includes(q) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(q)) ||
          (p.atributos && JSON.stringify(p.atributos).toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [productos, selectedCategoriaId, selectedAlmacenId, filtroActivo, searchTerm]);

  // Métricas
  const metricas = useMemo(() => {
    const total = productos.length;
    const activos = productos.filter((p) => p.activo).length;
    const stockBajo = productos.filter((p) => (p.total_stock ?? 0) <= p.stock_minimo).length;
    const totalUnidades = productos.reduce((acc, p) => acc + (p.total_stock ?? 0), 0);
    return { total, activos, stockBajo, totalUnidades };
  }, [productos]);

  const handleToggle = async (prod: Producto) => {
    try {
      await toggleActivoProducto(prod.id);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Error al cambiar estado';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const handleDelete = async (prod: Producto) => {
    if (prod.total_stock && prod.total_stock > 0) {
      alert(
        `Acción denegada:\nEl producto "${prod.nombre}" cuenta actualmente con ${prod.total_stock} unidades en existencia.\n\nDebes transferir o consumir el stock antes de eliminarlo del catálogo.`
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Deseas eliminar el producto "${prod.nombre}" (${prod.codigo}) del catálogo?`
    );
    if (!confirmed) return;

    try {
      await deleteProducto(prod.id);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al eliminar el producto';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const getCategoryIcon = (nombreCat?: string, codigoCat?: string) => {
    const dom = detectarDominioCategoria(nombreCat, codigoCat);
    switch (dom) {
      case 'TECNOLOGIA':
        return <Laptop className="w-4 h-4 text-indigo-600" />;
      case 'ALIMENTOS':
        return <UtensilsCrossed className="w-4 h-4 text-emerald-600" />;
      case 'LIMPIEZA':
        return <Sparkles className="w-4 h-4 text-cyan-600" />;
      case 'PAPELERIA':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'MANTENIMIENTO':
        return <Wrench className="w-4 h-4 text-purple-600" />;
      default:
        return <Package className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Métricas Rápidas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/80 p-4 flex items-center">
          <div className="p-3 rounded-lg bg-indigo-500 text-white mr-4 shadow-sm">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Productos en Catálogo</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{metricas.total}</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/80 p-4 flex items-center">
          <div className="p-3 rounded-lg bg-emerald-500 text-white mr-4 shadow-sm">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Productos Activos</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{metricas.activos}</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/80 p-4 flex items-center">
          <div className="p-3 rounded-lg bg-rose-500 text-white mr-4 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">En Alerta de Stock Bajo</p>
            <p className="text-xl font-bold text-rose-600 mt-0.5">{metricas.stockBajo}</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/80 p-4 flex items-center">
          <div className="p-3 rounded-lg bg-blue-500 text-white mr-4 shadow-sm">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Unidades Totales Físicas</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {metricas.totalUnidades} <span className="text-xs font-normal text-slate-500">u.</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Barra de Categorías / Líneas de Suministro */}
      <div className="border-b border-slate-200 bg-white px-4 pt-3 rounded-t-xl border border-slate-200/80">
        <div className="flex space-x-2 overflow-x-auto pb-3 text-xs scrollbar-none">
          <button
            onClick={() => setSelectedCategoriaId('ALL')}
            className={`px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              selectedCategoriaId === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Todos los Productos</span>
            <span
              className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedCategoriaId === 'ALL' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {productos.length}
            </span>
          </button>

          {categorias.map((cat) => {
            const isSelected = selectedCategoriaId === cat.id;
            const count = productos.filter((p) => p.id_categoria === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoriaId(cat.id)}
                className={`px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {getCategoryIcon(cat.nombre, cat.codigo)}
                <span>{cat.nombre}</span>
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

      {/* 3. Controles: Búsqueda, Filtro Almacén, Filtro Estado y Botones de Acción */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-1 flex-wrap items-center gap-3 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, nombre, marca o modelo..."
              className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Filtro Almacén */}
          <select
            value={selectedAlmacenId}
            onChange={(e) =>
              setSelectedAlmacenId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
            }
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-700 focus:bg-white focus:ring-indigo-500"
          >
            <option value="ALL">Todos los Almacenes</option>
            {almacenes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>

          {/* Filtro Estado */}
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
          {/* Toggle Vista */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
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
            <button
              onClick={() => setViewMode('grid')}
              title="Vista en Tarjetas"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Botón Gestionar Categorías */}
          <button
            onClick={() => setIsCategoriasOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Settings2 className="w-4 h-4 text-slate-500" />
            <span>Categorías</span>
          </button>

          {/* Botón Nuevo Producto */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* 4. Tabla o Cuadrícula de Productos */}
      {isLoadingProductos ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
          <p className="text-sm">Cargando catálogo de productos...</p>
        </div>
      ) : filteredProductos.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-700">No se encontraron productos</h4>
          <p className="text-xs text-slate-500 mt-1">
            No hay artículos que coincidan con los filtros aplicados.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Producto</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* VISTA EN TABLA */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Código & Producto</th>
                  <th className="px-6 py-3.5">Categoría & Almacén Destino</th>
                  <th className="px-6 py-3.5 text-center">Unidad</th>
                  <th className="px-6 py-3.5 text-center">Stock Actual / Mínimo</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProductos.map((p) => {
                  const totalStock = p.total_stock ?? 0;
                  const esBajo = totalStock <= p.stock_minimo;
                  const dom = detectarDominioCategoria(p.categoria?.nombre, p.categoria?.codigo);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Código & Nombre */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                            {getCategoryIcon(p.categoria?.nombre, p.categoria?.codigo)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {p.nombre}
                            </p>
                            <p className="font-mono text-xs text-slate-400 mt-0.5">
                              {p.codigo}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Categoría & Almacén */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 text-xs">
                          {p.categoria?.nombre || 'Sin categoría'}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                          <Warehouse className="w-3 h-3 text-slate-400" />
                          <span>{p.almacen_predeterminado?.nombre || 'Almacén General'}</span>
                        </p>
                      </td>

                      {/* Unidad */}
                      <td className="px-6 py-4 text-center font-mono text-xs text-slate-700">
                        {p.unidad_medida}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center space-x-1.5">
                          <span
                            className={`font-bold text-sm ${
                              esBajo ? 'text-rose-600 font-extrabold' : 'text-slate-900'
                            }`}
                          >
                            {totalStock}
                          </span>
                          <span className="text-xs text-slate-400">/ Mín {p.stock_minimo}</span>
                        </div>
                        {esBajo && (
                          <div className="flex items-center justify-center space-x-1 text-[11px] text-rose-600 mt-0.5 font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Stock Bajo</span>
                          </div>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 text-center">
                        {p.activo ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            <span>Activo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            <XCircle className="w-3 h-3" />
                            <span>Inactivo</span>
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setDetailProducto(p)}
                            title="Ver ficha técnica"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggle(p)}
                            disabled={isTogglingActivoProducto}
                            title={p.activo ? 'Desactivar producto' : 'Activar producto'}
                            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                              p.activo
                                ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
                                : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            {p.activo ? 'Desactivar' : 'Activar'}
                          </button>

                          <button
                            onClick={() => setEditingProducto(p)}
                            title="Editar producto"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(p)}
                            disabled={isDeletingProducto}
                            title="Eliminar producto"
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
      ) : (
        /* VISTA EN CUADRÍCULA (GRID) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProductos.map((p) => {
            const totalStock = p.total_stock ?? 0;
            const esBajo = totalStock <= p.stock_minimo;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-slate-100">
                        {getCategoryIcon(p.categoria?.nombre, p.categoria?.codigo)}
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {p.codigo}
                        </span>
                        <h4 className="text-base font-bold text-slate-800 mt-1 leading-snug">
                          {p.nombre}
                        </h4>
                      </div>
                    </div>

                    {esBajo && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                        Stock Bajo
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {p.categoria?.nombre}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {p.unidad_medida}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center space-x-1.5 mt-2.5">
                    <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.almacen_predeterminado?.nombre || 'Almacén General'}</span>
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Existencias físicas:</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {totalStock} {p.unidad_medida}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setDetailProducto(p)}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Ficha</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setEditingProducto(p)}
                      title="Editar"
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      title="Eliminar"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <CreateProductoModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultCategoriaId={selectedCategoriaId !== 'ALL' ? selectedCategoriaId : undefined}
      />

      <EditProductoModal
        producto={editingProducto}
        isOpen={!!editingProducto}
        onClose={() => setEditingProducto(null)}
      />

      <ProductoDetailModal
        producto={detailProducto}
        isOpen={!!detailProducto}
        onClose={() => setDetailProducto(null)}
      />

      <CategoriasModal
        isOpen={isCategoriasOpen}
        onClose={() => setIsCategoriasOpen(false)}
      />
    </div>
  );
};

