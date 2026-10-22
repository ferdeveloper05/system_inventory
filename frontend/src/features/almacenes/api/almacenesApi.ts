import apiClient from '../../../api/client';
import { Almacen, InventarioItem } from '../types';

export const almacenesApi = {
  getAlmacenes: async (): Promise<Almacen[]> => {
    const response = await apiClient.get<Almacen[]>('/almacenes');
    return response.data;
  },

  getInventario: async (params?: { id_almacen?: number; id_producto?: number }): Promise<InventarioItem[]> => {
    const response = await apiClient.get<InventarioItem[]>('/inventario', { params });
    return response.data;
  },
};

