export interface DetalleSolicitud {
  id: number;
  id_producto: number;
  cantidad_solicitada: number;
  cantidad_despachada: number;
  estado_item: string;
  producto?: {
    id: number;
    codigo: string;
    nombre: string;
  };
}

export interface Solicitud {
  id: number;
  numero_solicitud: string;
  id_empleado_solicita: number;
  id_almacen_origen: number;
  fecha_solicitud: string;
  estado: string;
  motivo_justificacion?: string;
  almacen_origen?: { id: number; nombre: string };
  empleado_solicita?: { id: number; nombre: string; apellido: string };
  detalles: DetalleSolicitud[];
}

export interface SolicitudCreatePayload {
  numero_solicitud: string;
  id_empleado_solicita: number;
  id_almacen_origen: number;
  motivo_justificacion?: string;
  detalles: {
    id_producto: number;
    cantidad_solicitada: number;
  }[];
}

