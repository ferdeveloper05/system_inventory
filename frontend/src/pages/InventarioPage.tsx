import React, { useState } from 'react';
import { useAlmacenes } from '../features/almacenes/hooks/useAlmacenes';
import { Warehouse, Boxes, MapPin } from 'lucide-react';

export const InventarioPage: React.FC = () => {
  const [selectedAlmacen, setSelectedAlmacen] = useState<number | undefined>(undefined);
  const { almacenes, inventario, isLoading } = useAlmacenes(
    selectedAlmacen ? { id_almacen: selectedAlmacen } : undefined
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Control de Existencias & Inventario</h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitoreo en tiempo real de stock por almacén y ubicación.
          </p>
        </div>

        {/* Filtro por Almacén */}
        <div className="flex items-center space-x-2">
          <Warehouse className="w-5 h-5 text-slate-400" />
          <select
            value={selectedAlmacen || ''}
            onChange={(e) => setSelectedAlmacen(e.target.value ? Number(e.target.value) : undefined)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Todos los Almacenes</option>
            {almacenes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre} ({a.codigo})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Inventario */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-medium text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Código Activo</th>
                <th className="px-6 py-4">Almacén</th>
                <th className="px-6 py-4">Ubicación / Pasillo</th>
                <th className="px-6 py-4 text-center">Stock Disponible</th>
                <th className="px-6 py-4 text-center">Stock Reservado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Cargando inventario...
                  </td>
                </tr>
              ) : inventario.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No hay registros de inventario disponibles.
                  </td>
                </tr>
              ) : (
                inventario.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center space-x-2">
                      <Boxes className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{item.producto?.nombre || `Producto #${item.id_producto}`}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {item.producto?.codigo || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {item.almacen?.nombre || `Almacén #${item.id_almacen}`}
                    </td>
                    <td className="px-6 py-4 text-slate-500 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.ubicacion_pasillo || 'Sin asignar'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {item.stock_actual} {item.producto?.unidad_medida || 'uds'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500">
                      {item.stock_reservado}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

