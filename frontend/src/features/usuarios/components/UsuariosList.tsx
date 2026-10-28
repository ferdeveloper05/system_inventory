import React, { useState, useMemo } from 'react';
import { useUsuarios } from '../hooks/useUsuarios';
import { Usuario } from '../types';
import { CreateUsuarioModal } from './CreateUsuarioModal';
import { EditUsuarioModal } from './EditUsuarioModal';
import {
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  UserCheck,
  Mail,
  RefreshCw,
} from 'lucide-react';

export const UsuariosList: React.FC = () => {
  const { usuarios, isLoadingUsuarios, toggleActivo, isTogglingActivo, deleteUsuario, isDeletingUsuario } = useUsuarios();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState<'all' | 'true' | 'false'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);

  // Filtrado reactivo en el cliente
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.empleado && `${u.empleado.nombre} ${u.empleado.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.rol && u.rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchEstado =
        filterActivo === 'all'
          ? true
          : filterActivo === 'true'
          ? u.activo === true
          : u.activo === false;

      return matchSearch && matchEstado;
    });
  }, [usuarios, searchTerm, filterActivo]);

  const handleToggle = async (usuario: Usuario) => {
    try {
      await toggleActivo(usuario.id);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleDelete = async (usuario: Usuario) => {
    if (window.confirm(`¿Estás seguro de eliminar permanentemente al usuario @${usuario.username}? Esta acción no se puede deshacer.`)) {
      try {
        await deleteUsuario(usuario.id);
      } catch (err: any) {
        alert(err.response?.data?.detail || err.response?.data?.message || 'Error al eliminar usuario');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-1 items-center gap-3">
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por usuario, correo, empleado o rol..."
              className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Filtro Estado */}
          <select
            value={filterActivo}
            onChange={(e) => setFilterActivo(e.target.value as any)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Todos los estados</option>
            <option value="true">Solo activos</option>
            <option value="false">Solo inactivos</option>
          </select>
        </div>

        {/* Botón Nuevo Usuario */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Usuario & Correo</th>
                <th className="px-6 py-3.5">Rol de Acceso</th>
                <th className="px-6 py-3.5">Empleado Vinculado</th>
                <th className="px-6 py-3.5 text-center">Tipo Cuenta</th>
                <th className="px-6 py-3.5 text-center">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingUsuarios ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <div className="inline-flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                      <span>Cargando usuarios...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Usuario & Correo */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                          {u.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">
                            @{u.username}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{u.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                        <Shield className="w-3 h-3" />
                        <span>{u.rol?.nombre || `Rol #${u.id_rol}`}</span>
                      </span>
                    </td>

                    {/* Empleado Vinculado */}
                    <td className="px-6 py-4">
                      {u.empleado ? (
                        <div>
                          <p className="font-medium text-slate-800 text-xs flex items-center space-x-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{u.empleado.nombre} {u.empleado.apellido}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {u.empleado.cargo}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Sin ficha laboral
                        </span>
                      )}
                    </td>

                    {/* Tipo Cuenta */}
                    <td className="px-6 py-4 text-center">
                      {u.is_superuser ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Superadmin</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Estándar</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 text-center">
                      {u.activo ? (
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

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Toggle Activo */}
                        <button
                          onClick={() => handleToggle(u)}
                          disabled={isTogglingActivo}
                          title={u.activo ? 'Desactivar cuenta' : 'Activar cuenta'}
                          className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                            u.activo
                              ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
                              : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => setEditingUsuario(u)}
                          title="Editar usuario"
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={isDeletingUsuario}
                          title="Eliminar usuario"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors"
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

      {/* Modales */}
      <CreateUsuarioModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditUsuarioModal
        usuario={editingUsuario}
        isOpen={!!editingUsuario}
        onClose={() => setEditingUsuario(null)}
      />
    </div>
  );
};

