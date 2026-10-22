import React from 'react';
import { useAlmacenes } from '../features/almacenes/hooks/useAlmacenes';
import { useRecepciones } from '../features/recepciones/hooks/useRecepciones';
import { useSolicitudes } from '../features/solicitudes/hooks/useSolicitudes';
import { Boxes, Warehouse, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { almacenes, inventario, isLoading: loadingAlm } = useAlmacenes();
  const { recepciones, isLoading: loadingRec } = useRecepciones();
  const { solicitudes, isLoading: loadingSol } = useSolicitudes();

  const totalStock = inventario.reduce((acc, item) => acc + item.stock_actual, 0);

  const stats = [
    { name: 'Total Unidades en Stock', value: totalStock, icon: Boxes, color: 'bg-indigo-500' },
    { name: 'Almacenes Activos', value: almacenes.length, icon: Warehouse, color: 'bg-emerald-500' },
    { name: 'Recepciones Realizadas', value: recepciones.length, icon: ArrowDownToLine, color: 'bg-blue-500' },
    { name: 'Solicitudes Registradas', value: solicitudes.length, icon: ArrowUpFromLine, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Panel de Control de Infraestructura</h2>
        <p className="text-sm text-slate-500 mt-1">
          Resumen operativo de activos, almacenamiento y flujo de materiales.
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/80 p-5 flex items-center">
              <div className={`p-3 rounded-lg ${item.color} text-white mr-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 truncate">{item.name}</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                  {loadingAlm || loadingRec || loadingSol ? '...' : item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tablas resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Últimas Recepciones */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Últimas Recepciones (Entradas)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-medium text-xs">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Almacén</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recepciones.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{r.numero_recepcion}</td>
                    <td className="px-4 py-3">{r.almacen?.nombre || `ID ${r.id_almacen}`}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        {r.estado}
                      </span>
                    </td>
                  </tr>
                ))}
                {recepciones.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-slate-400">Sin recepciones registradas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Últimas Solicitudes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Solicitudes Recientes (Salidas)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-medium text-xs">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Almacén Origen</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {solicitudes.slice(0, 5).map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{s.numero_solicitud}</td>
                    <td className="px-4 py-3">{s.almacen_origen?.nombre || `ID ${s.id_almacen_origen}`}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        s.estado === 'DESPACHADA' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s.estado}
                      </span>
                    </td>
                  </tr>
                ))}
                {solicitudes.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-slate-400">Sin solicitudes registradas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

