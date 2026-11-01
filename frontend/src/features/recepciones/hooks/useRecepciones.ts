import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recepcionesApi } from '../api/recepcionesApi';
import { RecepcionCreatePayload, RecepcionFilterParams } from '../types';

export const useRecepciones = (filters?: RecepcionFilterParams) => {
  const queryClient = useQueryClient();

  const recepcionesQuery = useQuery({
    queryKey: ['recepciones', filters?.search, filters?.id_almacen, filters?.estado, filters?.skip, filters?.limit],
    queryFn: () => recepcionesApi.getRecepciones(filters),
  });

  const statsQuery = useQuery({
    queryKey: ['recepciones-stats'],
    queryFn: recepcionesApi.getStats,
  });

  // Interconexiones para formulario de creación
  const almacenesQuery = useQuery({
    queryKey: ['almacenes-lookup'],
    queryFn: recepcionesApi.getAlmacenes,
  });

  const productosQuery = useQuery({
    queryKey: ['productos-lookup'],
    queryFn: recepcionesApi.getProductos,
  });

  const empleadosQuery = useQuery({
    queryKey: ['empleados-lookup'],
    queryFn: recepcionesApi.getEmpleados,
  });

  // Mutaciones
  const createMutation = useMutation({
    mutationFn: (payload: RecepcionCreatePayload) => recepcionesApi.createRecepcion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recepciones'] });
      queryClient.invalidateQueries({ queryKey: ['recepciones-stats'] });
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      queryClient.invalidateQueries({ queryKey: ['almacenes'] });
    },
  });

  const anularMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo?: string }) =>
      recepcionesApi.anularRecepcion(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recepciones'] });
      queryClient.invalidateQueries({ queryKey: ['recepciones-stats'] });
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      queryClient.invalidateQueries({ queryKey: ['almacenes'] });
    },
  });

  return {
    recepciones: recepcionesQuery.data ?? [],
    stats: statsQuery.data,
    almacenes: almacenesQuery.data ?? [],
    productos: productosQuery.data ?? [],
    empleados: empleadosQuery.data ?? [],

    isLoading: recepcionesQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    isLoadingCatalogos:
      almacenesQuery.isLoading || productosQuery.isLoading || empleadosQuery.isLoading,

    isCreating: createMutation.isPending,
    createRecepcion: createMutation.mutateAsync,

    isAnulando: anularMutation.isPending,
    anularRecepcion: anularMutation.mutateAsync,

    refetch: () => {
      recepcionesQuery.refetch();
      statsQuery.refetch();
    },
  };
};
