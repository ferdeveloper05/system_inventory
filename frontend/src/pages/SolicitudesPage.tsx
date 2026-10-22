import React from 'react';
import { useSolicitudes } from '../features/solicitudes/hooks/useSolicitudes';
import { ArrowUpFromLine, Calendar, User, CheckCircle2 } from 'lucide-react';

export const SolicitudesPage: React.FC = () => {
  const { solicitudes, isLoading, despacharSolicitud, isDespachando } = useSolicitudes();

  const handleDespachar = async (id: number) => {
    try {
      await despacharSolicitud(id);
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.detail || 'Error al despachar solicitud');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Salidas & Solicitudes</h2>
          <p className="text-sm text-slate-500 mt-1">
            Gestión y despacho de requerimientos de materiales para infraestructura.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-medium text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nº Solicitud</th>
                <th className="px-6 py-4">Almacén Origen</th>
                <th className="px-6 py-4">Solicitante</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Cargando solicitudes...
                  </td>
                </tr>
              ) : solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No se han registrado solicitudes aún.
                  </td>
                </tr>
              ) : (
                solicitudes.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center space-x-2">
                      <ArrowUpFromLine className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{s.numero_solicitud}</span>
                    </td>
                    <td className="px-6 py-4">{s.almacen_origen?.nombre || `Almacén #${s.id_almacen_origen}`}</td>
                    <td className="px-6 py-4 text-slate-700 flex items-center space-x-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>
                        {s.empleado_solicita
                          ? `${s.empleado_solicita.nombre} ${s.empleado_solicita.apellido}`
                          : `Empleado #${s.id_empleado_solicita}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(s.fecha_solicitud).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        s.estado === 'DESPACHADA'
                          ? 'bg-blue-100 text-blue-800'
                          : s.estado === 'PENDIENTE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {s.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {s.estado === 'PENDIENTE' ? (
                        <button
                          onClick={() => handleDespachar(s.id)}
                          disabled={isDespachando}
                          className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Despachar</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Completada</span>
                      )}
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

