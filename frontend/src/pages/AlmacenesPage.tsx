import React from 'react';
import { AlmacenesList } from '../features/almacenes/components/AlmacenesList';

export const AlmacenesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Almacenes & Espacios de Infraestructura
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Control y clasificación de almacenes principales, depósitos de repuestos, áreas de tránsito, salas de racks y zonas de desecho.
        </p>
      </div>

      {/* Lista CRUD y Controles */}
      <AlmacenesList />
    </div>
  );
};

