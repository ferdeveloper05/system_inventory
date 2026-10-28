import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '../api/usuariosApi';
import {
  UsuarioCreate,
  UsuarioUpdate,
  EmpleadoCreate,
  EmpleadoUpdate,
  DepartamentoCreate,
  DepartamentoUpdate,
  RolCreate,
  RolUpdate,
} from '../types';

export const useUsuarios = (filters?: { activo?: boolean }) => {
  const queryClient = useQueryClient();

  // Queries
  const usuariosQuery = useQuery({
    queryKey: ['usuarios', filters],
    queryFn: () => usuariosApi.getUsuarios(filters),
  });

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: usuariosApi.getRoles,
  });

  const departamentosQuery = useQuery({
    queryKey: ['departamentos'],
    queryFn: usuariosApi.getDepartamentos,
  });

  const empleadosQuery = useQuery({
    queryKey: ['empleados'],
    queryFn: usuariosApi.getEmpleados,
  });

  // Mutaciones de Usuarios
  const createUsuarioMutation = useMutation({
    mutationFn: (data: UsuarioCreate) => usuariosApi.createUsuario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const updateUsuarioMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UsuarioUpdate }) =>
      usuariosApi.updateUsuario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const toggleActivoMutation = useMutation({
    mutationFn: (id: number) => usuariosApi.toggleActivoUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const deleteUsuarioMutation = useMutation({
    mutationFn: (id: number) => usuariosApi.deleteUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  // Mutaciones de Empleados
  const createEmpleadoMutation = useMutation({
    mutationFn: (data: EmpleadoCreate) => usuariosApi.createEmpleado(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
  });

  const updateEmpleadoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmpleadoUpdate }) =>
      usuariosApi.updateEmpleado(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
  });

  // Mutaciones de Departamentos y Roles
  const createDepartamentoMutation = useMutation({
    mutationFn: (data: DepartamentoCreate) => usuariosApi.createDepartamento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] });
    },
  });

  const updateDepartamentoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DepartamentoUpdate }) =>
      usuariosApi.updateDepartamento(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] });
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
  });

  const deleteDepartamentoMutation = useMutation({
    mutationFn: (id: number) => usuariosApi.deleteDepartamento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] });
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
  });

  const createRolMutation = useMutation({
    mutationFn: (data: RolCreate) => usuariosApi.createRol(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const updateRolMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RolUpdate }) =>
      usuariosApi.updateRol(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const deleteRolMutation = useMutation({
    mutationFn: (id: number) => usuariosApi.deleteRol(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  return {
    usuarios: usuariosQuery.data ?? [],
    roles: rolesQuery.data ?? [],
    departamentos: departamentosQuery.data ?? [],
    empleados: empleadosQuery.data ?? [],

    isLoading:
      usuariosQuery.isLoading ||
      rolesQuery.isLoading ||
      departamentosQuery.isLoading ||
      empleadosQuery.isLoading,

    isLoadingUsuarios: usuariosQuery.isLoading,
    isLoadingEmpleados: empleadosQuery.isLoading,
    isLoadingDepartamentos: departamentosQuery.isLoading,
    isLoadingRoles: rolesQuery.isLoading,

    createUsuario: createUsuarioMutation.mutateAsync,
    isCreatingUsuario: createUsuarioMutation.isPending,

    updateUsuario: updateUsuarioMutation.mutateAsync,
    isUpdatingUsuario: updateUsuarioMutation.isPending,

    toggleActivo: toggleActivoMutation.mutateAsync,
    isTogglingActivo: toggleActivoMutation.isPending,

    deleteUsuario: deleteUsuarioMutation.mutateAsync,
    isDeletingUsuario: deleteUsuarioMutation.isPending,

    createEmpleado: createEmpleadoMutation.mutateAsync,
    isCreatingEmpleado: createEmpleadoMutation.isPending,

    updateEmpleado: updateEmpleadoMutation.mutateAsync,
    isUpdatingEmpleado: updateEmpleadoMutation.isPending,

    createDepartamento: createDepartamentoMutation.mutateAsync,
    isCreatingDepartamento: createDepartamentoMutation.isPending,

    updateDepartamento: updateDepartamentoMutation.mutateAsync,
    isUpdatingDepartamento: updateDepartamentoMutation.isPending,

    deleteDepartamento: deleteDepartamentoMutation.mutateAsync,
    isDeletingDepartamento: deleteDepartamentoMutation.isPending,

    createRol: createRolMutation.mutateAsync,
    isCreatingRol: createRolMutation.isPending,

    updateRol: updateRolMutation.mutateAsync,
    isUpdatingRol: updateRolMutation.isPending,

    deleteRol: deleteRolMutation.mutateAsync,
    isDeletingRol: deleteRolMutation.isPending,
  };
};

