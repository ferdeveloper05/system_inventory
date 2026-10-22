import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitudesApi } from '../api/solicitudesApi';
import { SolicitudCreatePayload } from '../types';

export const useSolicitudes = () => {
  const queryClient = useQueryClient();

  const solicitudesQuery = useQuery({
    queryKey: ['solicitudes'],
    queryFn: solicitudesApi.getSolicitudes,
  });

  const createMutation = useMutation({
    mutationFn: (payload: SolicitudCreatePayload) => solicitudesApi.createSolicitud(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
    },
  });

  const despacharMutation = useMutation({
    mutationFn: (idSolicitud: number) => solicitudesApi.despacharSolicitud(idSolicitud),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });

  return {
    solicitudes: solicitudesQuery.data ?? [],
    isLoading: solicitudesQuery.isLoading,
    createSolicitud: createMutation.mutateAsync,
    despacharSolicitud: despacharMutation.mutateAsync,
    isDespachando: despacharMutation.isPending,
  };
};

