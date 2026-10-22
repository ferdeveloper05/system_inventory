export interface DetalleRecepcion {
  id_producto: number;
  cantidad_recibida: number;
  estado_producto?: string;
  observaciones?: string;
  producto?: {
    id: number;
    codigo: string;
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
  estado: string;
  observaciones?: string;
  almacen?: { id: number; nombre: string };
  empleado_recibe?: { id: number; nombre: string; apellido: string };
  detalles: DetalleRecepcion[];
}

export interface RecepcionCreatePayload {
  numero_recepcion: string;
  id_orden_compra?: number;
  id_almacen: number;
  id_empleado_recibe: number;
  estado: string;
  observaciones?: string;
  detalles: {
    id_producto: number;
    cantidad_recibida: number;
    estado_producto?: string;
    observaciones?: string;
  }[];
}

