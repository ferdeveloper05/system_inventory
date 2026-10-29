import apiClient from '../../../api/client';
import { Almacen, AlmacenCreate, AlmacenUpdate, InventarioItem } from '../types';

export const almacenesApi = {
  getAlmacenes: async (params?: {
    activo?: boolean;
    tipo?: string;
    search?: string;
  }): Promise<Almacen[]> => {
    const response = await apiClient.get<Almacen[]>('/almacenes', { params });
    return response.data;
  },

  getAlmacen: async (id: number): Promise<Almacen> => {
    const response = await apiClient.get<Almacen>(`/almacenes/${id}`);
    return response.data;
  },

  createAlmacen: async (data: AlmacenCreate): Promise<Almacen> => {
    const response = await apiClient.post<Almacen>('/almacenes', data);
    return response.data;
  },

  updateAlmacen: async (id: number, data: AlmacenUpdate): Promise<Almacen> => {
    const response = await apiClient.put<Almacen>(`/almacenes/${id}`, data);
    return response.data;
  },

  toggleActivoAlmacen: async (id: number): Promise<Almacen> => {
    const response = await apiClient.patch<Almacen>(`/almacenes/${id}/toggle-activo`);
    return response.data;
  },

  deleteAlmacen: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/almacenes/${id}`);
    return response.data;
  },

  getInventario: async (params?: {
    id_almacen?: number;
    id_producto?: number;
  }): Promise<InventarioItem[]> => {
    const response = await apiClient.get<InventarioItem[]>('/inventario', { params });
    return response.data;
  },

  getTiposAlmacen: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/almacenes/tipos');
    return response.data;
  },
};
