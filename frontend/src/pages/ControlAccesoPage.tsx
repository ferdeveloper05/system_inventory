import React from 'react';
import { useUsuarios } from '../features/usuarios/hooks/useUsuarios';
import { RolesList } from '../features/control-acceso/components/RolesList';
import { ShieldCheck, Users, Lock, KeyRound } from 'lucide-react';

export const ControlAccesoPage: React.FC = () => {
  const { roles, usuarios, isLoadingRoles } = useUsuarios();

  const totalRoles = roles.length;
  const rolesActivos = roles.filter((r) => r.activo).length;
  const totalUsuarios = usuarios.length;

  const stats = [
    { name: 'Roles de Acceso', value: totalRoles, icon: ShieldCheck, color: 'bg-purple-600' },
    { name: 'Roles Habilitados', value: rolesActivos, icon: Lock, color: 'bg-indigo-600' },
    { name: 'Cuentas Vinculadas', value: totalUsuarios, icon: Users, color: 'bg-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
          <KeyRound className="w-6 h-6 text-purple-600" />
          <span>Control de Acceso & Perfiles de Seguridad</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Definición de roles organizacionales, políticas de privilegios y permisos de sistema.
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.name}
              className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/80 p-5 flex items-center"
            >
              <div className={`p-3 rounded-lg ${s.color} text-white mr-4 shadow-sm`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 truncate">{s.name}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {isLoadingRoles ? '...' : s.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla y Operaciones */}
      <RolesList />
    </div>
  );
};

