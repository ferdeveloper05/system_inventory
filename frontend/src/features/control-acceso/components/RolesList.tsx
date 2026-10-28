import React, { useState, useMemo } from 'react';
import { useUsuarios } from '../../usuarios/hooks/useUsuarios';
import { Rol } from '../../usuarios/types';
import { CreateRolModal } from './CreateRolModal';
import { EditRolModal } from './EditRolModal';
import {
  Shield,
  ShieldPlus,
  Search,
  Users,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  KeyRound,
} from 'lucide-react';

export const RolesList: React.FC = () => {
  const {
    roles,
    usuarios,
    isLoadingRoles,
    deleteRol,
    isDeletingRol,
  } = useUsuarios();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);

  // Mapeo de usuarios por rol
  const usuariosPorRol = useMemo(() => {
    const map = new Map<number, number>();
    usuarios.forEach((u) => {
      map.set(u.id_rol, (map.get(u.id_rol) || 0) + 1);
    });
    return map;
  }, [usuarios]);

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const full = `${r.nombre} ${r.descripcion || ''}`.toLowerCase();
      return full.includes(searchTerm.toLowerCase());
    });
  }, [roles, searchTerm]);

  const handleDelete = async (rol: Rol) => {
    const totalUsers = usuariosPorRol.get(rol.id) || 0;
    if (totalUsers > 0) {
      alert(
        `No es posible eliminar el rol "${rol.nombre}" porque actualmente está asignado a ${totalUsers} usuario(s). Modifique el rol de dichos usuarios antes de continuar.`
      );
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar permanentemente el rol "${rol.nombre}"?`)) {
      try {
        await deleteRol(rol.id);
      } catch (err: any) {
        alert(err.response?.data?.detail || err.response?.data?.message || 'Error al eliminar rol');
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
            placeholder="Buscar rol por nombre o permisos..."
            className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:ring-purple-500 focus:border-purple-500 transition-colors"
          />
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <ShieldPlus className="w-4 h-4" />
          <span>Nuevo Rol de Acceso</span>
        </button>
      </div>

      {/* Tabla de Roles */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Perfil de Rol</th>
                <th className="px-6 py-3.5">Alcance / Permisos</th>
                <th className="px-6 py-3.5 text-center">Usuarios Asignados</th>
                <th className="px-6 py-3.5 text-center">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingRoles ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    <div className="inline-flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />
                      <span>Cargando roles del sistema...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    No se encontraron roles registrados.
                  </td>
                </tr>
              ) : (
                filteredRoles.map((rol) => {
                  const numUsers = usuariosPorRol.get(rol.id) || 0;
                  const isSystemAdmin = rol.nombre === 'ADMINISTRADOR';

                  return (
                    <tr key={rol.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                            isSystemAdmin
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-indigo-50 text-indigo-600 border border-indigo-200/60'
                          }`}>
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-mono font-bold text-slate-900 leading-tight">
                              {rol.nombre}
                            </p>
                            <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1 mt-0.5">
                              <KeyRound className="w-3 h-3 text-slate-400" />
                              <span>ID #{rol.id}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 max-w-sm">
                        {rol.descripcion || (
                          <span className="italic text-slate-400">Sin descripción especificada</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{numUsers} {numUsers === 1 ? 'cuenta' : 'cuentas'}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {rol.activo ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            <span>Habilitado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            <XCircle className="w-3 h-3" />
                            <span>Deshabilitado</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingRol(rol)}
                            title="Editar rol"
                            className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 border border-slate-200 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(rol)}
                            disabled={isDeletingRol || isSystemAdmin}
                            title={isSystemAdmin ? 'El rol de Administrador no se puede eliminar' : 'Eliminar rol'}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isSystemAdmin
                                ? 'text-slate-300 border-transparent cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-200'
                            }`}
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
      <CreateRolModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditRolModal
        rol={editingRol}
        isOpen={!!editingRol}
        onClose={() => setEditingRol(null)}
      />
    </div>
  );
};

