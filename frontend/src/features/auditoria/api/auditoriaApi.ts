import apiClient from '../../../api/client';
import { AuditoriaRegistro } from '../types';

export const auditoriaApi = {
  getAuditoria: async (params?: { tabla?: string; operacion?: string }): Promise<AuditoriaRegistro[]> => {
    const response = await apiClient.get<AuditoriaRegistro[]>('/auditoria', { params });
    return response.data;
  },
};

