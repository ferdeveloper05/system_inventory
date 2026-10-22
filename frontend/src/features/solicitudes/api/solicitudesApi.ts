import apiClient from '../../../api/client';
import { Solicitud, SolicitudCreatePayload } from '../types';

export const solicitudesApi = {
  getSolicitudes: async (): Promise<Solicitud[]> => {
    const response = await apiClient.get<Solicitud[]>('/solicitudes');
    return response.data;
  },

  createSolicitud: async (payload: SolicitudCreatePayload): Promise<Solicitud> => {
    const response = await apiClient.post<Solicitud>('/solicitudes', payload);
    return response.data;
  },

  despacharSolicitud: async (idSolicitud: number): Promise<Solicitud> => {
    const response = await apiClient.post<Solicitud>(`/solicitudes/${idSolicitud}/despachar`);
    return response.data;
  },
};

