import apiClient from '../../../api/client';
import {
  Producto,
  ProductoCreate,
  ProductoUpdate,
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
  AlmacenSimple,
} from '../types';

export const productosApi = {
  // Productos
  getProductos: async (params?: {
    search?: string;
    categoria_id?: number;
    almacen_id?: number;
    activo?: boolean;
  }): Promise<Producto[]> => {
    const response = await apiClient.get<Producto[]>('/productos', { params });
    return response.data;
  },

  getProducto: async (id: number): Promise<Producto> => {
    const response = await apiClient.get<Producto>(`/productos/${id}`);
    return response.data;
  },

  createProducto: async (data: ProductoCreate): Promise<Producto> => {
    const response = await apiClient.post<Producto>('/productos', data);
    return response.data;
  },

  updateProducto: async (id: number, data: ProductoUpdate): Promise<Producto> => {
    const response = await apiClient.put<Producto>(`/productos/${id}`, data);
    return response.data;
  },

  toggleActivoProducto: async (id: number): Promise<Producto> => {
    const response = await apiClient.patch<Producto>(`/productos/${id}/toggle-activo`);
    return response.data;
  },

  deleteProducto: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/productos/${id}`);
    return response.data;
  },

  // Categorías
  getCategorias: async (params?: { activo?: boolean }): Promise<Categoria[]> => {
    const response = await apiClient.get<Categoria[]>('/productos/categorias', { params });
    return response.data;
  },

  getCategoria: async (id: number): Promise<Categoria> => {
    const response = await apiClient.get<Categoria>(`/productos/categorias/${id}`);
    return response.data;
  },

  createCategoria: async (data: CategoriaCreate): Promise<Categoria> => {
    const response = await apiClient.post<Categoria>('/productos/categorias', data);
    return response.data;
  },

  updateCategoria: async (id: number, data: CategoriaUpdate): Promise<Categoria> => {
    const response = await apiClient.put<Categoria>(`/productos/categorias/${id}`, data);
    return response.data;
  },

  toggleActivoCategoria: async (id: number): Promise<Categoria> => {
    const response = await apiClient.patch<Categoria>(`/productos/categorias/${id}/toggle-activo`);
    return response.data;
  },

  deleteCategoria: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/productos/categorias/${id}`);
    return response.data;
  },

  // Almacenes disponibles
  getAlmacenes: async (): Promise<AlmacenSimple[]> => {
    const response = await apiClient.get<AlmacenSimple[]>('/almacenes');
    return response.data;
  },
};
