import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recepcionesApi } from '../api/recepcionesApi';
import { RecepcionCreatePayload } from '../types';

export const useRecepciones = () => {
  const queryClient = useQueryClient();

  const recepcionesQuery = useQuery({
    queryKey: ['recepciones'],
    queryFn: recepcionesApi.getRecepciones,
  });

  const createMutation = useMutation({
    mutationFn: (payload: RecepcionCreatePayload) => recepcionesApi.createRecepcion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recepciones'] });
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });

  return {
    recepciones: recepcionesQuery.data ?? [],
    isLoading: recepcionesQuery.isLoading,
    createRecepcion: createMutation.mutateAsync,
  };
};

