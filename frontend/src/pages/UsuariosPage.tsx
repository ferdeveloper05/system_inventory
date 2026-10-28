import React, { useState } from 'react';
import { useUsuarios } from '../features/usuarios/hooks/useUsuarios';
import { UsuariosList } from '../features/usuarios/components/UsuariosList';
import { EmpleadosList } from '../features/usuarios/components/EmpleadosList';
import { DepartamentosRolesSection } from '../features/usuarios/components/DepartamentosRolesSection';
import { Users, UserCheck, Shield, Building2 } from 'lucide-react';

export const UsuariosPage: React.FC = () => {
  const { usuarios, empleados, roles, departamentos, isLoading } = useUsuarios();
  const [activeTab, setActiveTab] = useState<'usuarios' | 'empleados' | 'roles'>('usuarios');

  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter((u) => u.activo).length;
  const totalEmpleados = empleados.length;
  const totalRoles = roles.length;

  const stats = [
    { name: 'Usuarios Totales', value: totalUsuarios, icon: Users, color: 'bg-indigo-500' },
    { name: 'Usuarios Activos', value: usuariosActivos, icon: UserCheck, color: 'bg-emerald-500' },
    { name: 'Personal / Empleados', value: totalEmpleados, icon: Building2, color: 'bg-blue-500' },
    { name: 'Roles de Acceso', value: totalRoles, icon: Shield, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Gestión de Usuarios & Accesos</h2>
        <p className="text-sm text-slate-500 mt-1">
          Administración de cuentas del sistema, vinculación con personal y configuración de roles.
        </p>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.name}
              className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/80 p-4 flex items-center"
            >
              <div className={`p-3 rounded-lg ${s.color} text-white mr-4 shadow-sm`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 truncate">{s.name}</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {isLoading ? '...' : s.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selector de Pestañas */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
              activeTab === 'usuarios'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Cuentas de Usuario</span>
            <span
              className={`ml-1.5 py-0.5 px-2 rounded-full text-xs font-semibold ${
                activeTab === 'usuarios'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {totalUsuarios}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('empleados')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
              activeTab === 'empleados'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Personal & Empleados</span>
            <span
              className={`ml-1.5 py-0.5 px-2 rounded-full text-xs font-semibold ${
                activeTab === 'empleados'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {totalEmpleados}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
              activeTab === 'roles'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Departamentos & Roles</span>
            <span
              className={`ml-1.5 py-0.5 px-2 rounded-full text-xs font-semibold ${
                activeTab === 'roles'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {departamentos.length + roles.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Contenido de la pestaña activa */}
      <div>
        {activeTab === 'usuarios' && <UsuariosList />}
        {activeTab === 'empleados' && <EmpleadosList />}
        {activeTab === 'roles' && <DepartamentosRolesSection />}
      </div>
    </div>
  );
};

