export interface Departamento {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at?: string;
}

export interface DepartamentoCreate {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at?: string;
}

export interface RolCreate {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  cargo: string;
  id_departamento: number;
  activo: boolean;
  created_at?: string;
  departamento?: Departamento;
}

export interface EmpleadoCreate {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  cargo: string;
  id_departamento: number;
  activo?: boolean;
}

export interface EmpleadoUpdate {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  cargo?: string;
  id_departamento?: number;
  activo?: boolean;
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  id_rol: number;
  id_empleado?: number | null;
  activo: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at?: string;
  rol?: Rol;
  empleado?: Empleado;
}

export interface UsuarioCreate {
  username: string;
  email: string;
  password: string;
  id_rol: number;
  id_empleado?: number | null;
  activo?: boolean;
  is_superuser?: boolean;
}

export interface UsuarioUpdate {
  email?: string;
  password?: string;
  id_rol?: number;
  id_empleado?: number | null;
  activo?: boolean;
}

