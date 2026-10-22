export interface AuditoriaRegistro {
  id: number;
  tabla_afectada: string;
  operacion: string;
  registro_id: string;
  datos_anteriores?: any;
  datos_nuevos?: any;
  id_usuario?: number;
  ip_origen?: string;
  fecha: string;
}

