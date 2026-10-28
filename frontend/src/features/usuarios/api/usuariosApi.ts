import apiClient from '../../../api/client';
import {
  Usuario,
  UsuarioCreate,
  UsuarioUpdate,
  Rol,
  RolCreate,
  Departamento,
  DepartamentoCreate,
  Empleado,
  EmpleadoCreate,
  EmpleadoUpdate,
} from '../types';

export const usuariosApi = {
  // Usuarios
  getUsuarios: async (params?: { activo?: boolean }): Promise<Usuario[]> => {
    const response = await apiClient.get<Usuario[]>('/usuarios', { params });
    return response.data;
  },

  getUsuario: async (id: number): Promise<Usuario> => {
    const response = await apiClient.get<Usuario>(`/usuarios/${id}`);
    return response.data;
  },

  createUsuario: async (data: UsuarioCreate): Promise<Usuario> => {
    const response = await apiClient.post<Usuario>('/usuarios', data);
    return response.data;
  },

  updateUsuario: async (id: number, data: UsuarioUpdate): Promise<Usuario> => {
    const response = await apiClient.put<Usuario>(`/usuarios/${id}`, data);
    return response.data;
  },

  toggleActivoUsuario: async (id: number): Promise<Usuario> => {
    const response = await apiClient.patch<Usuario>(`/usuarios/${id}/toggle-activo`);
    return response.data;
  },

  deleteUsuario: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/usuarios/${id}`);
    return response.data;
  },

  // Roles
  getRoles: async (): Promise<Rol[]> => {
    const response = await apiClient.get<Rol[]>('/usuarios/roles');
    return response.data;
  },

  createRol: async (data: RolCreate): Promise<Rol> => {
    const response = await apiClient.post<Rol>('/usuarios/roles', data);
    return response.data;
  },

  // Departamentos
  getDepartamentos: async (): Promise<Departamento[]> => {
    const response = await apiClient.get<Departamento[]>('/usuarios/departamentos');
    return response.data;
  },

  createDepartamento: async (data: DepartamentoCreate): Promise<Departamento> => {
    const response = await apiClient.post<Departamento>('/usuarios/departamentos', data);
    return response.data;
  },

  // Empleados
  getEmpleados: async (): Promise<Empleado[]> => {
    const response = await apiClient.get<Empleado[]>('/usuarios/empleados');
    return response.data;
  },

  createEmpleado: async (data: EmpleadoCreate): Promise<Empleado> => {
    const response = await apiClient.post<Empleado>('/usuarios/empleados', data);
    return response.data;
  },

  updateEmpleado: async (id: number, data: EmpleadoUpdate): Promise<Empleado> => {
    const response = await apiClient.put<Empleado>(`/usuarios/empleados/${id}`, data);
    return response.data;
  },
};

