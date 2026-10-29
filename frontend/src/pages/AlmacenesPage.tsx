import React from 'react';
import { AlmacenesList } from '../features/almacenes/components/AlmacenesList';

export const AlmacenesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Almacenes & Logística de Infraestructura
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Gestión centralizada de recepción y distribución de productos hacia sus depósitos correspondientes: comida y perecederos, insumos de limpieza, equipos de tecnología, papelería y mantenimiento.
        </p>
      </div>

      {/* Lista CRUD y Controles */}
      <AlmacenesList />
    </div>
  );
};
