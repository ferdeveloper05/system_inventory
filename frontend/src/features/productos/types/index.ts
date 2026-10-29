export interface Categoria {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo: boolean;
  total_productos?: number;
}

export interface CategoriaCreate {
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CategoriaUpdate {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface AlmacenSimple {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
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
  id_almacen_predeterminado?: number;
  atributos?: Record<string, any>;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
  categoria?: Categoria;
  almacen_predeterminado?: AlmacenSimple;
  total_stock?: number;
}

export interface ProductoCreate {
  codigo: string;
  nombre: string;
  descripcion?: string;
  unidad_medida: string;
  stock_minimo: number;
  stock_maximo: number;
  id_categoria: number;
  id_almacen_predeterminado?: number;
  atributos?: Record<string, any>;
  activo?: boolean;
}

export interface ProductoUpdate {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  unidad_medida?: string;
  stock_minimo?: number;
  stock_maximo?: number;
  id_categoria?: number;
  id_almacen_predeterminado?: number;
  atributos?: Record<string, any>;
  activo?: boolean;
}

export type CategoriaDominio =
  | 'TECNOLOGIA'
  | 'ALIMENTOS'
  | 'LIMPIEZA'
  | 'PAPELERIA'
  | 'MANTENIMIENTO'
  | 'GENERAL';

export function detectarDominioCategoria(nombreCat?: string, codigoCat?: string): CategoriaDominio {
  const texto = `${nombreCat || ''} ${codigoCat || ''}`.toLowerCase();

  if (texto.includes('alim') || texto.includes('comida') || texto.includes('perecedero') || texto.includes('cafe')) {
    return 'ALIMENTOS';
  }
  if (texto.includes('limp') || texto.includes('aseo') || texto.includes('quimic') || texto.includes('sanitari')) {
    return 'LIMPIEZA';
  }
  if (texto.includes('tec') || texto.includes('comput') || texto.includes('hard') || texto.includes('servidor') || texto.includes('red')) {
    return 'TECNOLOGIA';
  }
  if (texto.includes('papel') || texto.includes('oficina') || texto.includes('util') || texto.includes('toner')) {
    return 'PAPELERIA';
  }
  if (texto.includes('mant') || texto.includes('herram') || texto.includes('ferret') || texto.includes('electr')) {
    return 'MANTENIMIENTO';
  }
  return 'GENERAL';
}
