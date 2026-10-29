import React from 'react';
import { useAlmacenes } from '../hooks/useAlmacenes';
import { Almacen, AlmacenTipo, TIPOS_ALMACEN_META } from '../types';
import {
  X,
  Warehouse,
  MapPin,
  Barcode,
  Package,
  Layers,
  Calendar,
  AlertCircle,
  RefreshCw,
  Box,
  UtensilsCrossed,
  Sparkles,
  Laptop,
  FileText,
  Wrench,
  Tag,
} from 'lucide-react';

interface AlmacenDetailModalProps {
  almacen: Almacen | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AlmacenDetailModal: React.FC<AlmacenDetailModalProps> = ({
  almacen,
  isOpen,
  onClose,
}) => {
  const { inventario, isLoadingInventario } = useAlmacenes(
    almacen ? { id_almacen: almacen.id } : undefined
  );

  if (!isOpen || !almacen) return null;

  const meta = TIPOS_ALMACEN_META[almacen.tipo || 'GENERAL'] || TIPOS_ALMACEN_META.GENERAL;
  const porcentaje = almacen.porcentaje_ocupacion ?? 0;

  const getTipoIcon = (tipo: AlmacenTipo) => {
    switch (tipo) {
      case 'ALIMENTOS':
        return <UtensilsCrossed className="w-5 h-5" />;
      case 'LIMPIEZA':
        return <Sparkles className="w-5 h-5" />;
      case 'TECNOLOGIA':
        return <Laptop className="w-5 h-5" />;
      case 'PAPELERIA':
        return <FileText className="w-5 h-5" />;
      case 'MANTENIMIENTO':
        return <Wrench className="w-5 h-5" />;
      case 'GENERAL':
        return <Warehouse className="w-5 h-5" />;
      default:
        return <Warehouse className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${meta.iconBg} ${meta.iconText}`}>
              {getTipoIcon(almacen.tipo || 'GENERAL')}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-slate-800">
                  {almacen.nombre}
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {almacen.codigo}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
                >
                  {meta.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{almacen.ubicacion}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Métricas del almacén */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
              <span className="text-xs text-slate-500 flex items-center space-x-1">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                <span>Stock Físico Almacenado</span>
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {almacen.stock_total ?? 0}
                <span className="text-xs font-normal text-slate-500 ml-1">unidades</span>
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
              <span className="text-xs text-slate-500 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Líneas de Producto</span>
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {almacen.total_productos ?? 0}
                <span className="text-xs font-normal text-slate-500 ml-1">ítems distintos</span>
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
              <span className="text-xs text-slate-500 flex items-center space-x-1">
                <Box className="w-3.5 h-3.5 text-slate-400" />
                <span>Capacidad & Ocupación</span>
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {almacen.capacidad ? `${almacen.capacidad} u.` : 'Sin límite'}
              </p>
              {almacen.capacidad && (
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
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
              )}
            </div>
          </div>

          {/* Categorías admitidas */}
          {almacen.categorias && almacen.categorias.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 mb-2">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>Categorías de Suministro Enrutadas a este Almacén:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {almacen.categorias.map((c) => (
                  <span
                    key={c.id}
                    className="px-2 py-0.5 rounded-md text-xs font-medium bg-white text-indigo-700 border border-indigo-200 shadow-2xs"
                  >
                    {c.nombre} ({c.codigo})
                  </span>
                ))}
              </div>
            </div>
          )}

          {almacen.descripcion && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs text-blue-900">
              <span className="font-semibold text-blue-950">Observaciones y condiciones: </span>
              {almacen.descripcion}
            </div>
          )}

          {/* Tabla de Artículos en este Almacén */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-800 flex items-center space-x-2">
                <span>Existencias Actuales en este Almacén</span>
                <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full font-bold">
                  {inventario.length}
                </span>
              </h4>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 uppercase font-semibold text-[11px] text-slate-600 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Código & Producto</th>
                      <th className="px-4 py-2.5">Ubicación / Pasillo</th>
                      <th className="px-4 py-2.5 text-center">Stock Físico</th>
                      <th className="px-4 py-2.5 text-center">Reservado</th>
                      <th className="px-4 py-2.5 text-right">Disponible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingInventario ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">
                          <div className="inline-flex items-center space-x-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                            <span>Cargando existencias del almacén...</span>
                          </div>
                        </td>
                      </tr>
                    ) : inventario.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">
                          No hay existencias registradas en este almacén en este momento.
                        </td>
                      </tr>
                    ) : (
                      inventario.map((item) => {
                        const disponible = item.stock_actual - item.stock_reservado;
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-800">
                                {item.producto?.nombre || `Producto #${item.id_producto}`}
                              </p>
                              <p className="font-mono text-[11px] text-slate-400">
                                {item.producto?.codigo}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                              {item.ubicacion_pasillo || 'Sin asignar'}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-800">
                              {item.stock_actual} {item.producto?.unidad_medida || 'u'}
                            </td>
                            <td className="px-4 py-3 text-center text-amber-600 font-semibold">
                              {item.stock_reservado}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-600">
                              {disponible} {item.producto?.unidad_medida || 'u'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pie de modal */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
