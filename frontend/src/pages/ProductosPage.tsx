import React from 'react';
import { ProductosList } from '../features/productos/components/ProductosList';

export const ProductosPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Catálogo de Productos & Suministros
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Administración centralizada de artículos, fichas técnicas dinámicas y enrutamiento automático hacia sus almacenes de destino (tecnología, alimentos, limpieza, papelería y mantenimiento).
        </p>
      </div>

      <ProductosList />
    </div>
  );
};

