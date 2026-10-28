import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { InventarioPage } from '../pages/InventarioPage';
import { RecepcionesPage } from '../pages/RecepcionesPage';
import { SolicitudesPage } from '../pages/SolicitudesPage';
import { AuditoriaPage } from '../pages/AuditoriaPage';
import { UsuariosPage } from '../pages/UsuariosPage';
import { DepartamentosPage } from '../pages/DepartamentosPage';
import { ControlAccesoPage } from '../pages/ControlAccesoPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas Privadas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/almacenes" element={<InventarioPage />} />
          <Route path="/recepciones" element={<RecepcionesPage />} />
          <Route path="/solicitudes" element={<SolicitudesPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/departamentos" element={<DepartamentosPage />} />
          <Route path="/control-acceso" element={<ControlAccesoPage />} />
          <Route path="/auditoria" element={<AuditoriaPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

