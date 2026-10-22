import apiClient from '../../../api/client';
import { Producto, Categoria } from '../types';

export const productosApi = {
  getProductos: async (): Promise<Producto[]> => {
    const response = await apiClient.get<Producto[]>('/productos');
    return response.data;
  },

  getCategorias: async (): Promise<Categoria[]> => {
    const response = await apiClient.get<Categoria[]>('/productos/categorias');
    return response.data;
  },

  createProducto: async (data: Partial<Producto>): Promise<Producto> => {
    const response = await apiClient.post<Producto>('/productos', data);
    return response.data;
  },
};

