import React from 'react';
import { useRecepciones } from '../features/recepciones/hooks/useRecepciones';
import { ArrowDownToLine, Calendar, UserCheck } from 'lucide-react';

export const RecepcionesPage: React.FC = () => {
  const { recepciones, isLoading } = useRecepciones();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Entradas & Recepciones</h2>
          <p className="text-sm text-slate-500 mt-1">
            Registro de recepciones de activo físico y órdenes de compra.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-medium text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nº Recepción</th>
                <th className="px-6 py-4">Almacén Destino</th>
                <th className="px-6 py-4">Receptor</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Cargando recepciones...
                  </td>
                </tr>
              ) : recepciones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No se han registrado recepciones aún.
                  </td>
                </tr>
              ) : (
                recepciones.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center space-x-2">
                      <ArrowDownToLine className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{r.numero_recepcion}</span>
                    </td>
                    <td className="px-6 py-4">{r.almacen?.nombre || `Almacén #${r.id_almacen}`}</td>
                    <td className="px-6 py-4 text-slate-700 flex items-center space-x-1.5">
                      <UserCheck className="w-4 h-4 text-slate-400" />
                      <span>
                        {r.empleado_recibe
                          ? `${r.empleado_recibe.nombre} ${r.empleado_recibe.apellido}`
                          : `Empleado #${r.id_empleado_recibe}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(r.fecha_recepcion).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-800">
                      {r.detalles?.length || 0}
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

