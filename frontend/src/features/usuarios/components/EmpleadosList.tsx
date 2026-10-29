import React, { useState, useMemo } from 'react';
import { useUsuarios } from '../hooks/useUsuarios';
import { Empleado } from '../types';
import { CreateEmpleadoModal } from './CreateEmpleadoModal';
import { EditEmpleadoModal } from './EditEmpleadoModal';
import {
  UserPlus,
  Search,
  Building2,
  Mail,
  Phone,
  Briefcase,
  UserCheck,
  RefreshCw,
  Edit,
  Trash2,
} from 'lucide-react';

export const EmpleadosList: React.FC = () => {
  const { empleados, isLoadingEmpleados, deleteEmpleado, isDeletingEmpleado } = useUsuarios();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);

  const filteredEmpleados = useMemo(() => {
    return empleados.filter((emp) => {
      const full = `${emp.nombre} ${emp.apellido} ${emp.email} ${emp.cargo} ${emp.departamento?.nombre || ''}`.toLowerCase();
      return full.includes(searchTerm.toLowerCase());
    });
  }, [empleados, searchTerm]);

  const handleDelete = async (emp: Empleado) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar al empleado "${emp.nombre} ${emp.apellido}"?\n\nNota: No se puede eliminar si tiene una cuenta de usuario vinculada.`
    );
    if (!confirmed) return;

    try {
      await deleteEmpleado(emp.id);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al eliminar el empleado';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
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
            placeholder="Buscar por nombre, cargo, email o departamento..."
            className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Empleado</span>
        </button>
      </div>

      {/* Tabla de Empleados */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Nombre & Cargo</th>
                <th className="px-6 py-3.5">Contacto</th>
                <th className="px-6 py-3.5">Departamento</th>
                <th className="px-6 py-3.5 text-center">Estado Laboral</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingEmpleados ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    <div className="inline-flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                      <span>Cargando plantilla de empleados...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEmpleados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    No se encontraron empleados registrados.
                  </td>
                </tr>
              ) : (
                filteredEmpleados.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Nombre & Cargo */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 text-xs shrink-0">
                          {emp.nombre.charAt(0)}{emp.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">
                            {emp.nombre} {emp.apellido}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            <span>{emp.cargo}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-700 flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.email}</span>
                      </p>
                      {emp.telefono && (
                        <p className="text-xs text-slate-500 flex items-center space-x-1.5 mt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{emp.telefono}</span>
                        </p>
                      )}
                    </td>

                    {/* Departamento */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{emp.departamento?.nombre || `Dpto #${emp.id_departamento}`}</span>
                      </span>
                    </td>

                    {/* Estado Laboral */}
                    <td className="px-6 py-4 text-center">
                      {emp.activo ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <UserCheck className="w-3 h-3" />
                          <span>Activo</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          Inactivo
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingEmpleado(emp)}
                          title="Editar empleado"
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(emp)}
                          disabled={isDeletingEmpleado}
                          title="Eliminar empleado"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Creación */}
      <CreateEmpleadoModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Modal de Edición */}
      <EditEmpleadoModal
        empleado={editingEmpleado}
        isOpen={!!editingEmpleado}
        onClose={() => setEditingEmpleado(null)}
      />
    </div>
  );
};
