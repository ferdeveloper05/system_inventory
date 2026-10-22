import { useQuery } from '@tanstack/react-query';
import { auditoriaApi } from '../api/auditoriaApi';

export const useAuditoria = (params?: { tabla?: string; operacion?: string }) => {
  const auditoriaQuery = useQuery({
    queryKey: ['auditoria', params],
    queryFn: () => auditoriaApi.getAuditoria(params),
  });

  return {
    registros: auditoriaQuery.data ?? [],
    isLoading: auditoriaQuery.isLoading,
  };
};

