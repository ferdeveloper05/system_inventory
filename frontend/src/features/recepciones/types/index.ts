export interface ProductoSimple {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  unidad_medida: string;
  id_categoria: number;
  id_almacen_predeterminado?: number;
  categoria?: {
    id: number;
    nombre: string;
    codigo: string;
  };
  almacen_predeterminado?: {
    id: number;
    codigo: string;
    nombre: string;
    tipo: string;
  };
}

export interface DetalleRecepcion {
  id?: number;
  id_recepcion?: number;
  id_producto: number;
  cantidad_recibida: number;
  estado_producto?: 'CONFORME' | 'DANADO' | 'INCOMPLETO' | string;
  observaciones?: string;
  producto?: ProductoSimple;
}

export interface AlmacenRef {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  capacidad?: number;
}

export interface EmpleadoRef {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  cargo: string;
  id_departamento: number;
  departamento?: {
    id: number;
    nombre: string;
  };
}

export interface Recepcion {
  id: number;
  numero_recepcion: string;
  id_orden_compra?: number;
  id_almacen: number;
  id_empleado_recibe: number;
  fecha_recepcion: string;
  estado: 'COMPLETADA' | 'BORRADOR' | 'ANULADA' | string;
  observaciones?: string;
  created_at: string;
  almacen?: AlmacenRef;
  empleado_recibe?: EmpleadoRef;
  detalles: DetalleRecepcion[];
}

export interface DetalleRecepcionInput {
  id_producto: number;
  cantidad_recibida: number;
  estado_producto?: string;
  observaciones?: string;
}

export interface RecepcionCreatePayload {
  numero_recepcion: string;
  id_orden_compra?: number;
  id_almacen: number;
  id_empleado_recibe: number;
  estado: string;
  observaciones?: string;
  detalles: DetalleRecepcionInput[];
}

export interface RecepcionStats {
  total_recepciones: number;
  total_items_recibidos: number;
  total_completadas: number;
  total_anuladas: number;
  recepciones_hoy: number;
}

export interface RecepcionFilterParams {
  search?: string;
  id_almacen?: number;
  estado?: string;
  skip?: number;
  limit?: number;
}
