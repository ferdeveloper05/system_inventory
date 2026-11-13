import apiClient from '../../../api/client';
import {
  Recepcion,
  RecepcionCreatePayload,
  RecepcionUpdatePayload,
  RecepcionStats,
  RecepcionFilterParams,
  AlmacenRef,
  EmpleadoRef,
  ProductoSimple,
} from '../types';

export const recepcionesApi = {
  // Recepciones
  getRecepciones: async (params?: RecepcionFilterParams): Promise<Recepcion[]> => {
    const response = await apiClient.get<Recepcion[]>('/recepciones', { params });
    return response.data;
  },

  getRecepcion: async (id: number): Promise<Recepcion> => {
    const response = await apiClient.get<Recepcion>(`/recepciones/${id}`);
    return response.data;
  },

  getStats: async (): Promise<RecepcionStats> => {
    const response = await apiClient.get<RecepcionStats>('/recepciones/stats');
    return response.data;
  },

  createRecepcion: async (payload: RecepcionCreatePayload): Promise<Recepcion> => {
    const response = await apiClient.post<Recepcion>('/recepciones', payload);
    return response.data;
  },

  updateRecepcion: async (id: number, payload: RecepcionUpdatePayload): Promise<Recepcion> => {
    const response = await apiClient.put<Recepcion>(`/recepciones/${id}`, payload);
    return response.data;
  },

  deleteRecepcion: async (id: number): Promise<{ message: string; id: number; numero_recepcion: string }> => {
    const response = await apiClient.delete<{ message: string; id: number; numero_recepcion: string }>(
      `/recepciones/${id}`
    );
    return response.data;
  },

  anularRecepcion: async (id: number, motivo?: string): Promise<Recepcion> => {
    const response = await apiClient.patch<Recepcion>(`/recepciones/${id}/anular`, {
      motivo: motivo || 'Anulación solicitada desde interfaz gráfica de recepciones',
    });
    return response.data;
  },

  // Interconexión con otros módulos
  getAlmacenes: async (): Promise<AlmacenRef[]> => {
    const response = await apiClient.get<AlmacenRef[]>('/almacenes');
    return response.data;
  },

  getProductos: async (): Promise<ProductoSimple[]> => {
    const response = await apiClient.get<ProductoSimple[]>('/productos');
    return response.data;
  },

  getEmpleados: async (): Promise<EmpleadoRef[]> => {
    const response = await apiClient.get<EmpleadoRef[]>('/usuarios/empleados');
    return response.data;
  },
};
