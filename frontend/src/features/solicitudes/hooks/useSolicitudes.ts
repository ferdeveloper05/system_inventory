import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesApi } from '../api/solicitudesApi';
import {
  SolicitudCreatePayload,
  SolicitudFilterParams,
  SolicitudDespachoFormData,
  SolicitudCierreFormData,
} from '../types';

export const useSolicitudes = (filters?: SolicitudFilterParams) => {
  const queryClient = useQueryClient();

  const solicitudesQuery = useQuery({
    queryKey: [
      'solicitudes',
      filters?.estado,
      filters?.id_departamento,
      filters?.search,
      filters?.skip,
      filters?.limit,
    ],
    queryFn: () => solicitudesApi.getSolicitudes(filters),
  });

  const statsQuery = useQuery({
    queryKey: ['solicitudes-stats'],
    queryFn: solicitudesApi.getStats,
  });

  // Catálogos para formularios de creación y despacho
  const productosQuery = useQuery({
    queryKey: ['productos-lookup'],
    queryFn: solicitudesApi.getProductos,
  });

  const almacenesQuery = useQuery({
    queryKey: ['almacenes-lookup'],
    queryFn: solicitudesApi.getAlmacenes,
  });

  const departamentosQuery = useQuery({
    queryKey: ['departamentos-lookup'],
    queryFn: solicitudesApi.getDepartamentos,
  });

  // Helper de invalidación general
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
    queryClient.invalidateQueries({ queryKey: ['solicitudes-stats'] });
    queryClient.invalidateQueries({ queryKey: ['inventario'] });
    queryClient.invalidateQueries({ queryKey: ['productos'] });
    queryClient.invalidateQueries({ queryKey: ['almacenes'] });
    queryClient.invalidateQueries({ queryKey: ['movimientos'] });
  };

  // Mutaciones del ciclo de vida
  const createMutation = useMutation({
    mutationFn: (payload: SolicitudCreatePayload) => solicitudesApi.createSolicitud(payload),
    onSuccess: () => {
      invalidateAll();
    },
  });

  const aprobarDirectorMutation = useMutation({
    mutationFn: (id: number) => solicitudesApi.aprobarDirector(id),
    onSuccess: () => {
      invalidateAll();
    },
  });

  const aceptarInfraestructuraMutation = useMutation({
    mutationFn: (id: number) => solicitudesApi.aceptarInfraestructura(id),
    onSuccess: () => {
      invalidateAll();
    },
  });

  const despacharMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SolicitudDespachoFormData }) =>
      solicitudesApi.despachar(id, data),
    onSuccess: () => {
      invalidateAll();
    },
  });

  const cerrarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SolicitudCierreFormData }) =>
      solicitudesApi.cerrar(id, data),
    onSuccess: () => {
      invalidateAll();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => solicitudesApi.deleteSolicitud(id),
    onSuccess: () => {
      invalidateAll();
    },
  });

  return {
    solicitudes: solicitudesQuery.data ?? [],
    stats: statsQuery.data,
    productos: productosQuery.data ?? [],
    almacenes: almacenesQuery.data ?? [],
    departamentos: departamentosQuery.data ?? [],

    isLoading: solicitudesQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    isLoadingCatalogos:
      productosQuery.isLoading || almacenesQuery.isLoading || departamentosQuery.isLoading,

    isCreating: createMutation.isPending,
    createSolicitud: createMutation.mutateAsync,

    isAprobando: aprobarDirectorMutation.isPending,
    aprobarDirector: aprobarDirectorMutation.mutateAsync,

    isAceptando: aceptarInfraestructuraMutation.isPending,
    aceptarInfraestructura: aceptarInfraestructuraMutation.mutateAsync,

    isDespachando: despacharMutation.isPending,
    despacharSolicitud: despacharMutation.mutateAsync,

    isCerrando: cerrarMutation.isPending,
    cerrarSolicitud: cerrarMutation.mutateAsync,

    isDeleting: deleteMutation.isPending,
    deleteSolicitud: deleteMutation.mutateAsync,

    refetch: () => {
      solicitudesQuery.refetch();
      statsQuery.refetch();
    },
  };
};
