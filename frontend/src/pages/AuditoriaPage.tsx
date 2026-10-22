import React from 'react';
import { useAuditoria } from '../features/auditoria/hooks/useAuditoria';
import { ClipboardList, ShieldCheck } from 'lucide-react';

export const AuditoriaPage: React.FC = () => {
  const { registros, isLoading } = useAuditoria();

  const getBadgeColor = (operacion: string) => {
    switch (operacion) {
      case 'INSERT':
        return 'bg-emerald-100 text-emerald-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <span>Pista de Auditoría & Trazabilidad</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Registro inmutable de mutaciones y operaciones sobre la base de datos (PostgreSQL JSONB).
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-medium text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID Evento</th>
                <th className="px-6 py-4">Tabla Afectada</th>
                <th className="px-6 py-4">Operación</th>
                <th className="px-6 py-4">Registro Ref</th>
                <th className="px-6 py-4">Detalle / Cambios JSONB</th>
                <th className="px-6 py-4">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-sans text-sm">
                    Cargando registros de auditoría...
                  </td>
                </tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-sans text-sm">
                    No hay eventos de auditoría registrados aún.
                  </td>
                </tr>
              ) : (
                registros.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">#{item.id}</td>
                    <td className="px-6 py-4 font-sans text-slate-700 font-medium">
                      {item.tabla_afectada}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${getBadgeColor(item.operacion)}`}>
                        {item.operacion}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.registro_id}</td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-500 font-mono">
                      {JSON.stringify(item.datos_nuevos || item.datos_anteriores || {})}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-sans">
                      {new Date(item.fecha).toLocaleString()}
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

