import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.rol_nombre;
    const hasRole = user?.is_superuser || (userRole && allowedRoles.includes(userRole));
    if (!hasRole) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Restringido</h2>
          <p className="text-slate-600">No cuentas con los permisos necesarios para visualizar este módulo.</p>
        </div>
      );
    }
  }

  return <Outlet />;
};

