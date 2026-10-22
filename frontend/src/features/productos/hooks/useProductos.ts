import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productosApi } from '../api/productosApi';
import { Producto } from '../types';

export const useProductos = () => {
  const queryClient = useQueryClient();

  const productosQuery = useQuery({
    queryKey: ['productos'],
    queryFn: productosApi.getProductos,
  });

  const categoriasQuery = useQuery({
    queryKey: ['categorias'],
    queryFn: productosApi.getCategorias,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Producto>) => productosApi.createProducto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  return {
    productos: productosQuery.data ?? [],
    categorias: categoriasQuery.data ?? [],
    isLoading: productosQuery.isLoading || categoriasQuery.isLoading,
    createProducto: createMutation.mutateAsync,
  };
};

