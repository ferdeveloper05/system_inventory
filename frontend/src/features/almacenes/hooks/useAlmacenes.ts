import { useQuery } from '@tanstack/react-query';
import { almacenesApi } from '../api/almacenesApi';

export const useAlmacenes = (filters?: { id_almacen?: number; id_producto?: number }) => {
  const almacenesQuery = useQuery({
    queryKey: ['almacenes'],
    queryFn: almacenesApi.getAlmacenes,
  });

  const inventarioQuery = useQuery({
    queryKey: ['inventario', filters],
    queryFn: () => almacenesApi.getInventario(filters),
  });

  return {
    almacenes: almacenesQuery.data ?? [],
    inventario: inventarioQuery.data ?? [],
    isLoading: almacenesQuery.isLoading || inventarioQuery.isLoading,
  };
};

