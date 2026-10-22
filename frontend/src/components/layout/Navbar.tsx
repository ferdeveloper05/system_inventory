import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { LogOut, UserCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-semibold text-slate-800">
          Departamento de Infraestructura
        </h1>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <UserCircle className="w-8 h-8 text-slate-400" />
          <div className="text-left">
            <p className="text-sm font-medium text-slate-700">
              {user?.nombre_completo || user?.username || 'Usuario'}
            </p>
            <p className="text-xs text-indigo-600 font-medium">
              {user?.rol_nombre || (user?.is_superuser ? 'Superadministrador' : 'Operador')}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Cerrar sesión"
          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

