export interface Categoria {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo: boolean;
}

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  unidad_medida: string;
  stock_minimo: number;
  stock_maximo: number;
  id_categoria: number;
  activo: boolean;
  categoria?: Categoria;
}

