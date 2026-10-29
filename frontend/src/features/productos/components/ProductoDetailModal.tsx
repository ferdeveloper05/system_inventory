import React from 'react';
import { Producto, detectarDominioCategoria } from '../types';
import {
  X,
  Package,
  Layers,
  Warehouse,
  Barcode,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Laptop,
  UtensilsCrossed,
  Sparkles,
  FileText,
  Wrench,
} from 'lucide-react';

interface ProductoDetailModalProps {
  producto: Producto | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductoDetailModal: React.FC<ProductoDetailModalProps> = ({
  producto,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !producto) return null;

  const dominio = detectarDominioCategoria(producto.categoria?.nombre, producto.categoria?.codigo);
  const atributos = producto.atributos || {};

  const getDominioBadge = () => {
    switch (dominio) {
      case 'TECNOLOGIA':
        return { label: 'Tecnología & TI', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'ALIMENTOS':
        return { label: 'Comida & Perecederos', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'LIMPIEZA':
        return { label: 'Limpieza & Aseo', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'PAPELERIA':
        return { label: 'Papelería & Oficina', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'MANTENIMIENTO':
        return { label: 'Mantenimiento & Herramientas', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Insumos Generales', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const badgeInfo = getDominioBadge();
  const totalStock = producto.total_stock ?? 0;
  const esStockBajo = totalStock <= producto.stock_minimo;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  {producto.nombre}
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {producto.codigo}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Categoría: <strong>{producto.categoria?.nombre || 'Sin categoría'}</strong>
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
        <div className="p-6 space-y-5">
          {/* Métricas de Stock y Destino */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-xs text-slate-500">Existencias Totales</span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {totalStock}{' '}
                <span className="text-xs font-normal text-slate-500">
                  {producto.unidad_medida}
                </span>
              </p>
              {esStockBajo && (
                <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-rose-600 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Nivel Bajo (Mín: {producto.stock_minimo})</span>
                </span>
              )}
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-xs text-slate-500">Almacén de Destino</span>
              <p className="text-sm font-bold text-slate-800 mt-1 truncate">
                {producto.almacen_predeterminado?.nombre || 'Almacén General'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tipo: {producto.almacen_predeterminado?.tipo || 'GENERAL'}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-xs text-slate-500">Línea Logística</span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${badgeInfo.color}`}
                >
                  {badgeInfo.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Cap. Máx: {producto.stock_maximo} {producto.unidad_medida}
              </p>
            </div>
          </div>

          {/* Ficha Técnica Dinámica */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2.5">
              Ficha Técnica Específica de la Categoría
            </h4>

            {Object.keys(atributos).length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                No se registraron atributos técnicos adicionales para este artículo.
              </p>
            ) : (
              <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                {Object.entries(atributos).map(([key, val]) => (
                  <div key={key} className="space-y-0.5">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <p className="font-semibold text-slate-800">
                      {typeof val === 'boolean'
                        ? val
                          ? 'Sí'
                          : 'No'
                        : String(val)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Descripción */}
          {producto.descripcion && (
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-xs text-blue-900">
              <span className="font-semibold text-blue-950">Descripción / Notas: </span>
              {producto.descripcion}
            </div>
          )}

          {/* Pie */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

