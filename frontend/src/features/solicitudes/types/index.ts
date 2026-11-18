export interface CategoriaRef {
  id: number;
  nombre: string;
  codigo: string;
}

export interface AlmacenRef {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
}

export interface DepartamentoRef {
  id: number;
  id_departamento?: number;
  nombre: string;
  descripcion?: string;
}

export interface EmpleadoRef {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  cargo: string;
  id_departamento: number;
  departamento?: DepartamentoRef;
}

export interface UsuarioRef {
  id: number;
  username: string;
  email: string;
  empleado?: EmpleadoRef;
}

export interface ProductoSimple {
  id: number;
  codigo: string;
  nombre: string;
  unidad_medida: string;
  id_categoria: number;
  id_almacen_predeterminado?: number;
  categoria?: CategoriaRef;
  almacen_predeterminado?: AlmacenRef;
}

export interface DetalleSolicitud {
  id: number;
  id_solicitud: number;
  id_producto: number;
  cantidad_solicitada: number;
  cantidad_despachada: number;
  estado_item: string;
  id_almacen_despacho?: number;
  observaciones_item?: string;
  producto?: ProductoSimple;
  almacen_despacho?: AlmacenRef;
}

export type EstadoSolicitud =
  | 'Abierto'
  | 'En Proceso'
  | 'Entrega en Camino'
  | 'Cerrado';

export interface Solicitud {
  id: number;
  id_solicitud?: number;
  numero_solicitud: string;
  id_empleado_solicita: number;
  id_departamento_solicitante?: number;
  id_departamento?: number;
  id_almacen_origen: number;
  fecha_solicitud: string;
  estado: EstadoSolicitud | string;
  motivo_justificacion?: string;
  justificacion?: string;
  departamento_nombre?: string;
  solicitante_nombre?: string;
  solicitante_cargo?: string;

  // Supervisión y Aprobaciones
  aprobada_por_director: boolean;
  id_director_aprueba?: number;
  fecha_aprobacion_director?: string;

  id_director_infraestructura?: number;
  fecha_aceptacion_infraestructura?: string;

  id_usuario_despacha?: number;
  fecha_despacho?: string;
  comprobante_despacho_url?: string;
  observaciones_despacho?: string;

  id_usuario_recibe?: number;
  fecha_cierre?: string;
  comprobante_entrega_url?: string;
  observaciones_entrega?: string;

  created_at: string;
  updated_at: string;

  // Relaciones
  empleado_solicita?: EmpleadoRef;
  departamento_solicitante?: DepartamentoRef;
  almacen_origen?: AlmacenRef;
  director_aprueba?: UsuarioRef;
  director_infraestructura?: UsuarioRef;
  usuario_despacha?: UsuarioRef;
  usuario_recibe?: UsuarioRef;
  detalles: DetalleSolicitud[];
}

export interface DetalleSolicitudCreateInput {
  id_producto: number;
  cantidad_solicitada: number;
  id_almacen_despacho?: number;
  observaciones_item?: string;
}

export interface SolicitudCreatePayload {
  numero_solicitud?: string;
  id_empleado_solicita?: number;
  id_almacen_origen?: number;
  motivo_justificacion?: string;
  detalles: DetalleSolicitudCreateInput[];
}

export interface SolicitudDespachoItemInput {
  id_producto: number;
  cantidad_despachada: number;
  id_almacen_despacho: number;
  observaciones_item?: string;
}

export interface SolicitudDespachoFormData {
  foto_comprobante?: File;
  comprobante_url?: string;
  observaciones?: string;
  items?: SolicitudDespachoItemInput[];
}

export interface SolicitudCierreFormData {
  foto_conformidad?: File;
  comprobante_url?: string;
  observaciones?: string;
}

export interface SolicitudStats {
  total_solicitudes: number;
  total_abiertas: number;
  total_pendientes_aprobacion_director: number;
  total_listas_para_infraestructura: number;
  total_en_proceso: number;
  total_entrega_en_camino: number;
  total_cerradas: number;
}

export interface SolicitudFilterParams {
  estado?: string;
  id_departamento?: number;
  search?: string;
  skip?: number;
  limit?: number;
}
