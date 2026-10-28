import React, { useState, useMemo } from 'react';
import { useUsuarios } from '../../usuarios/hooks/useUsuarios';
import { Departamento } from '../../usuarios/types';
import { CreateDepartamentoModal } from './CreateDepartamentoModal';
import { EditDepartamentoModal } from './EditDepartamentoModal';
import {
  Building2,
  Plus,
  Search,
  Users,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

export const DepartamentosList: React.FC = () => {
  const {
    departamentos,
    empleados,
    isLoadingDepartamentos,
    deleteDepartamento,
    isDeletingDepartamento,
  } = useUsuarios();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Departamento | null>(null);

  // Mapeo de cantidad de empleados por departamento
  const empleadosPorDept = useMemo(() => {
    const map = new Map<number, number>();
    empleados.forEach((emp) => {
      map.set(emp.id_departamento, (map.get(emp.id_departamento) || 0) + 1);
    });
    return map;
  }, [empleados]);

  const filteredDepartamentos = useMemo(() => {
    return departamentos.filter((d) => {
      const full = `${d.nombre} ${d.descripcion || ''}`.toLowerCase();
      return full.includes(searchTerm.toLowerCase());
    });
  }, [departamentos, searchTerm]);

  const handleDelete = async (dept: Departamento) => {
    const totalEmps = empleadosPorDept.get(dept.id) || 0;
    if (totalEmps > 0) {
      alert(
        `No es posible eliminar el departamento "${dept.nombre}" porque tiene ${totalEmps} empleado(s) asociado(s). Reasigne al personal a otro departamento primero.`
      );
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar el departamento "${dept.nombre}"?`)) {
      try {
        await deleteDepartamento(dept.id);
      } catch (err: any) {
        alert(err.response?.data?.detail || err.response?.data?.message || 'Error al eliminar departamento');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar departamento por nombre o descripción..."
            className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Departamento</span>
        </button>
      </div>

      {/* Tabla de Departamentos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Departamento</th>
                <th className="px-6 py-3.5">Descripción & Alcance</th>
                <th className="px-6 py-3.5 text-center">Personal Asignado</th>
                <th className="px-6 py-3.5 text-center">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingDepartamentos ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    <div className="inline-flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                      <span>Cargando departamentos...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDepartamentos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    No se encontraron departamentos registrados.
                  </td>
                </tr>
              ) : (
                filteredDepartamentos.map((dept) => {
                  const numEmps = empleadosPorDept.get(dept.id) || 0;
                  return (
                    <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center font-bold text-blue-600 shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {dept.nombre}
                            </p>
                            <span className="text-[11px] font-mono text-slate-400">
                              ID #{dept.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 max-w-sm">
                        {dept.descripcion || (
                          <span className="italic text-slate-400">Sin descripción</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{numEmps} {numEmps === 1 ? 'empleado' : 'empleados'}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {dept.activo ? (
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

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingDept(dept)}
                            title="Editar departamento"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(dept)}
                            disabled={isDeletingDepartamento}
                            title="Eliminar departamento"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      <CreateDepartamentoModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditDepartamentoModal
        departamento={editingDept}
        isOpen={!!editingDept}
        onClose={() => setEditingDept(null)}
      />
    </div>
  );
};

