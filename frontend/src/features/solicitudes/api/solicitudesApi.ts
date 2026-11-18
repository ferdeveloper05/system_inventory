import apiClient from '../../../api/client';
import {
  Solicitud,
  SolicitudCreatePayload,
  SolicitudStats,
  SolicitudFilterParams,
  SolicitudDespachoFormData,
  SolicitudCierreFormData,
  ProductoSimple,
  AlmacenRef,
  DepartamentoRef,
} from '../types';

export const solicitudesApi = {
  getSolicitudes: async (params?: SolicitudFilterParams): Promise<Solicitud[]> => {
    const response = await apiClient.get<Solicitud[]>('/solicitudes', { params });
    return response.data;
  },

  getStats: async (): Promise<SolicitudStats> => {
    const response = await apiClient.get<SolicitudStats>('/solicitudes/stats');
    return response.data;
  },

  getSolicitud: async (id: number): Promise<Solicitud> => {
    const response = await apiClient.get<Solicitud>(`/solicitudes/${id}`);
    return response.data;
  },

  createSolicitud: async (payload: SolicitudCreatePayload): Promise<Solicitud> => {
    const response = await apiClient.post<Solicitud>('/solicitudes', payload);
    return response.data;
  },

  aprobarDirector: async (id: number): Promise<Solicitud> => {
    const response = await apiClient.post<Solicitud>(`/solicitudes/${id}/aprobar-director`);
    return response.data;
  },

  aceptarInfraestructura: async (id: number): Promise<Solicitud> => {
    const response = await apiClient.post<Solicitud>(`/solicitudes/${id}/aceptar-infraestructura`);
    return response.data;
  },

  despachar: async (id: number, data: SolicitudDespachoFormData): Promise<Solicitud> => {
    const formData = new FormData();
    if (data.foto_comprobante) {
      formData.append('foto_comprobante', data.foto_comprobante);
    }
    if (data.comprobante_url) {
      formData.append('comprobante_url', data.comprobante_url);
    }
    if (data.observaciones) {
      formData.append('observaciones', data.observaciones);
    }
    if (data.items && data.items.length > 0) {
      formData.append('items_json', JSON.stringify(data.items));
    }

    const response = await apiClient.post<Solicitud>(`/solicitudes/${id}/despachar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  cerrar: async (id: number, data: SolicitudCierreFormData): Promise<Solicitud> => {
    const formData = new FormData();
    if (data.foto_conformidad) {
      formData.append('foto_conformidad', data.foto_conformidad);
    }
    if (data.comprobante_url) {
      formData.append('comprobante_url', data.comprobante_url);
    }
    if (data.observaciones) {
      formData.append('observaciones', data.observaciones);
    }

    const response = await apiClient.post<Solicitud>(`/solicitudes/${id}/cerrar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadEvidencia: async (file: File): Promise<{ success: boolean; url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ success: boolean; url: string; filename: string }>(
      '/solicitudes/upload-evidencia',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deleteSolicitud: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/solicitudes/${id}`);
    return response.data;
  },

  // Catálogos auxiliares para creación y despacho
  getProductos: async (): Promise<ProductoSimple[]> => {
    const response = await apiClient.get<ProductoSimple[]>('/productos');
    return response.data;
  },

  getAlmacenes: async (): Promise<AlmacenRef[]> => {
    const response = await apiClient.get<AlmacenRef[]>('/almacenes');
    return response.data;
  },

  getDepartamentos: async (): Promise<DepartamentoRef[]> => {
    const response = await apiClient.get<DepartamentoRef[]>('/usuarios/departamentos');
    return response.data;
  },
};
