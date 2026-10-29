import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { almacenesApi } from '../api/almacenesApi';
import { AlmacenCreate, AlmacenUpdate } from '../types';

export const useAlmacenes = (filters?: {
  activo?: boolean;
  tipo?: string;
  search?: string;
  id_almacen?: number;
  id_producto?: number;
}) => {
  const queryClient = useQueryClient();

  // Consulta de almacenes
  const almacenesQuery = useQuery({
    queryKey: ['almacenes', filters?.activo, filters?.tipo, filters?.search],
    queryFn: () =>
      almacenesApi.getAlmacenes({
        activo: filters?.activo,
        tipo: filters?.tipo,
        search: filters?.search,
      }),
  });

  // Consulta de inventario por almacén/producto
  const inventarioQuery = useQuery({
    queryKey: ['inventario', filters?.id_almacen, filters?.id_producto],
    queryFn: () =>
      almacenesApi.getInventario({
        id_almacen: filters?.id_almacen,
        id_producto: filters?.id_producto,
      }),
  });

  // Consulta de tipos de almacén
  const tiposQuery = useQuery({
    queryKey: ['almacenes-tipos'],
    queryFn: almacenesApi.getTiposAlmacen,
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  // Mutaciones CRUD
  const createAlmacenMutation = useMutation({
    mutationFn: (data: AlmacenCreate) => almacenesApi.createAlmacen(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['almacenes'] });
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });

  const updateAlmacenMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AlmacenUpdate }) =>
      almacenesApi.updateAlmacen(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['almacenes'] });
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });

  const toggleActivoMutation = useMutation({
    mutationFn: (id: number) => almacenesApi.toggleActivoAlmacen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['almacenes'] });
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });

  const deleteAlmacenMutation = useMutation({
    mutationFn: (id: number) => almacenesApi.deleteAlmacen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['almacenes'] });
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });

  return {
    almacenes: almacenesQuery.data ?? [],
    inventario: inventarioQuery.data ?? [],
    tipos: tiposQuery.data ?? [],

    isLoading: almacenesQuery.isLoading || inventarioQuery.isLoading,
    isLoadingAlmacenes: almacenesQuery.isLoading,
    isLoadingInventario: inventarioQuery.isLoading,

    createAlmacen: createAlmacenMutation.mutateAsync,
    isCreatingAlmacen: createAlmacenMutation.isPending,

    updateAlmacen: updateAlmacenMutation.mutateAsync,
    isUpdatingAlmacen: updateAlmacenMutation.isPending,

    toggleActivo: toggleActivoMutation.mutateAsync,
    isTogglingActivo: toggleActivoMutation.isPending,

    deleteAlmacen: deleteAlmacenMutation.mutateAsync,
    isDeletingAlmacen: deleteAlmacenMutation.isPending,
  };
};
