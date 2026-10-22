import apiClient from '../../../api/client';
import { Recepcion, RecepcionCreatePayload } from '../types';

export const recepcionesApi = {
  getRecepciones: async (): Promise<Recepcion[]> => {
    const response = await apiClient.get<Recepcion[]>('/recepciones');
    return response.data;
  },

  createRecepcion: async (payload: RecepcionCreatePayload): Promise<Recepcion> => {
    const response = await apiClient.post<Recepcion>('/recepciones', payload);
    return response.data;
  },
};

