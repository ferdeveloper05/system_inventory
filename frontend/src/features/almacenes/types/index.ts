export type AlmacenTipo =
  | 'GENERAL'
  | 'REPUESTOS'
  | 'TRANSITO'
  | 'DATACENTER'
  | 'SEGURIDAD'
  | 'DESECHO';

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
}

export interface AlmacenCreate {
  codigo: string;
  nombre: string;
  tipo: AlmacenTipo;
  ubicacion: string;
  capacidad?: number;
  descripcion?: string;
  activo?: boolean;
}

export interface AlmacenUpdate {
  codigo?: string;
  nombre?: string;
  tipo?: AlmacenTipo;
  ubicacion?: string;
  capacidad?: number;
  descripcion?: string;
  activo?: boolean;
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
  }
> = {
  GENERAL: {
    label: 'Almacén Principal / Central',
    description: 'Equipos principales, servidores, switches core y almacenamiento mayorista.',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-600',
    prefix: 'ALM-PRI-',
  },
  REPUESTOS: {
    label: 'Repuestos & Componentes',
    description: 'Cables, patch cords, discos, memorias RAM, transceptores SFP y fuentes.',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    prefix: 'ALM-REP-',
  },
  TRANSITO: {
    label: 'Tránsito & Recepción (Staging)',
    description: 'Área de inspección, recepción de compras y pruebas antes de puesta en producción.',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    prefix: 'ALM-TRA-',
  },
  DATACENTER: {
    label: 'Data Center / Sala de Racks',
    description: 'Almacenes in-situ en cuartos de comunicaciones, PoPs o salas de servidores.',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    prefix: 'ALM-DAT-',
  },
  SEGURIDAD: {
    label: 'Resguardo / Alta Seguridad',
    description: 'Dispositivos criptográficos (HSM), licencias físicas, tarjetas y activos críticos.',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    prefix: 'ALM-SEG-',
  },
  DESECHO: {
    label: 'Bajas & Disposición Final (Scrap)',
    description: 'Equipos obsoletos o averiados en espera de desincorporación, reciclaje o subasta.',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-600',
    prefix: 'ALM-BAJ-',
  },
};
