export type AlmacenTipo =
  | 'ALIMENTOS'
  | 'LIMPIEZA'
  | 'TECNOLOGIA'
  | 'PAPELERIA'
  | 'MANTENIMIENTO'
  | 'GENERAL';

export interface CategoriaSimple {
  id: number;
  nombre: string;
  codigo: string;
}

export interface Almacen {
  id: number;
  codigo: string;
  nombre: string;
  tipo: AlmacenTipo;
  ubicacion: string;
  capacidad?: number;
  descripcion?: string;
  activo: boolean;
  created_at?: string;
  total_productos?: number;
  stock_total?: number;
  porcentaje_ocupacion?: number;
  categorias?: CategoriaSimple[];
}

export interface AlmacenCreate {
  codigo: string;
  nombre: string;
  tipo: AlmacenTipo;
  ubicacion: string;
  capacidad?: number;
  descripcion?: string;
  activo?: boolean;
  ids_categorias?: number[];
}

export interface AlmacenUpdate {
  codigo?: string;
  nombre?: string;
  tipo?: AlmacenTipo;
  ubicacion?: string;
  capacidad?: number;
  descripcion?: string;
  activo?: boolean;
  ids_categorias?: number[];
}

export interface TipoAlmacenInfo {
  id: AlmacenTipo;
  nombre: string;
  descripcion: string;
  badge_color: string;
  prefix: string;
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
    stock_minimo?: number;
    stock_maximo?: number;
  };
}

export const TIPOS_ALMACEN_META: Record<
  AlmacenTipo,
  {
    label: string;
    description: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    iconBg: string;
    iconText: string;
    prefix: string;
    defaultCategoryName: string;
  }
> = {
  ALIMENTOS: {
    label: 'Comida & Perecederos',
    description: 'Alimentos, refrigerios, café, bebidas e insumos perecederos de cafetería y comedor.',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    prefix: 'ALM-ALIM-',
    defaultCategoryName: 'Comida y Perecederos',
  },
  LIMPIEZA: {
    label: 'Productos de Limpieza & Aseo',
    description: 'Detergentes, desinfectantes, papel higiénico, químicos de aseo e insumos sanitarios.',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700',
    badgeBorder: 'border-cyan-200',
    iconBg: 'bg-cyan-100',
    iconText: 'text-cyan-600',
    prefix: 'ALM-LIMP-',
    defaultCategoryName: 'Productos de Limpieza',
  },
  TECNOLOGIA: {
    label: 'Equipos de Tecnología & TI',
    description: 'Computadores, servidores, laptops, periféricos, cables, hardware y componentes electrónicos.',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-600',
    prefix: 'ALM-TEC-',
    defaultCategoryName: 'Equipos de Tecnología',
  },
  PAPELERIA: {
    label: 'Papelería & Útiles de Oficina',
    description: 'Hojas, carpetas, bolígrafos, archivadores, tóners de impresión y útiles de escritorio.',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    prefix: 'ALM-PAP-',
    defaultCategoryName: 'Papelería y Oficina',
  },
  MANTENIMIENTO: {
    label: 'Mantenimiento & Herramientas',
    description: 'Herramientas, repuestos de fontanería, electricidad, pintura, tornillería e infraestructura física.',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    prefix: 'ALM-MANT-',
    defaultCategoryName: 'Mantenimiento y Ferretería',
  },
  GENERAL: {
    label: 'Almacén General / Recepción',
    description: 'Área centralizada de infraestructura para acopio temporal, inspección y enrutamiento a almacenes.',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-300',
    iconBg: 'bg-slate-200',
    iconText: 'text-slate-700',
    prefix: 'ALM-GEN-',
    defaultCategoryName: 'Insumos Generales',
  },
};
