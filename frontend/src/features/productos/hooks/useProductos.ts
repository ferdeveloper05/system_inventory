import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productosApi } from '../api/productosApi';
import {
  ProductoCreate,
  ProductoUpdate,
  CategoriaCreate,
  CategoriaUpdate,
} from '../types';

export const useProductos = (filters?: {
  search?: string;
  categoria_id?: number;
  almacen_id?: number;
  activo?: boolean;
}) => {
  const queryClient = useQueryClient();

  const productosQuery = useQuery({
    queryKey: ['productos', filters?.search, filters?.categoria_id, filters?.almacen_id, filters?.activo],
    queryFn: () => productosApi.getProductos(filters),
  });

  const categoriasQuery = useQuery({
    queryKey: ['categorias'],
    queryFn: () => productosApi.getCategorias(),
  });

  const almacenesQuery = useQuery({
    queryKey: ['almacenes-simple'],
    queryFn: () => productosApi.getAlmacenes(),
  });

  // Mutaciones Productos
  const createProductoMutation = useMutation({
    mutationFn: (data: ProductoCreate) => productosApi.createProducto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });

  const updateProductoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdate }) =>
      productosApi.updateProducto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });

  const toggleActivoProductoMutation = useMutation({
    mutationFn: (id: number) => productosApi.toggleActivoProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const deleteProductoMutation = useMutation({
    mutationFn: (id: number) => productosApi.deleteProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });

  // Mutaciones Categorías
  const createCategoriaMutation = useMutation({
    mutationFn: (data: CategoriaCreate) => productosApi.createCategoria(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  const updateCategoriaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaUpdate }) =>
      productosApi.updateCategoria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const toggleActivoCategoriaMutation = useMutation({
    mutationFn: (id: number) => productosApi.toggleActivoCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  const deleteCategoriaMutation = useMutation({
    mutationFn: (id: number) => productosApi.deleteCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  return {
    productos: productosQuery.data ?? [],
    categorias: categoriasQuery.data ?? [],
    almacenes: almacenesQuery.data ?? [],

    isLoading:
      productosQuery.isLoading ||
      categoriasQuery.isLoading ||
      almacenesQuery.isLoading,
    isLoadingProductos: productosQuery.isLoading,
    isLoadingCategorias: categoriasQuery.isLoading,

    createProducto: createProductoMutation.mutateAsync,
    isCreatingProducto: createProductoMutation.isPending,

    updateProducto: updateProductoMutation.mutateAsync,
    isUpdatingProducto: updateProductoMutation.isPending,

    toggleActivoProducto: toggleActivoProductoMutation.mutateAsync,
    isTogglingActivoProducto: toggleActivoProductoMutation.isPending,

    deleteProducto: deleteProductoMutation.mutateAsync,
    isDeletingProducto: deleteProductoMutation.isPending,

    createCategoria: createCategoriaMutation.mutateAsync,
    isCreatingCategoria: createCategoriaMutation.isPending,

    updateCategoria: updateCategoriaMutation.mutateAsync,
    isUpdatingCategoria: updateCategoriaMutation.isPending,

    toggleActivoCategoria: toggleActivoCategoriaMutation.mutateAsync,
    isTogglingActivoCategoria: toggleActivoCategoriaMutation.isPending,

    deleteCategoria: deleteCategoriaMutation.mutateAsync,
    isDeletingCategoria: deleteCategoriaMutation.isPending,
  };
};
