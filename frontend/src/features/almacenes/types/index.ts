export interface Almacen {
  id: number;
  codigo: string;
  nombre: string;
  ubicacion: string;
  capacidad?: number;
  activo: boolean;
}

export interface InventarioItem {
  id: number;
  id_almacen: number;
  id_producto: number;
  stock_actual: number;
  stock_reservado: number;
  ubicacion_pasillo?: string;
  almacen?: Almacen;
  producto?: {
    id: number;
    codigo: string;
    nombre: string;
    unidad_medida: string;
  };
}

