import React from 'react';
import { CategoriaDominio } from '../types';
import {
  Laptop,
  UtensilsCrossed,
  Sparkles,
  FileText,
  Wrench,
  Calendar,
  ShieldAlert,
  Cpu,
  HardDrive,
  Info,
} from 'lucide-react';

interface DynamicCategoryFieldsProps {
  dominio: CategoriaDominio;
  atributos: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export const DynamicCategoryFields: React.FC<DynamicCategoryFieldsProps> = ({
  dominio,
  atributos,
  onChange,
}) => {
  if (dominio === 'TECNOLOGIA') {
    return (
      <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 space-y-3.5">
        <div className="flex items-center space-x-2 text-indigo-900 border-b border-indigo-100 pb-2">
          <Laptop className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold uppercase tracking-wide">
            Ficha Técnica de Equipos de Tecnología & TI
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Marca *</label>
            <input
              type="text"
              required
              value={atributos.marca || ''}
              onChange={(e) => onChange('marca', e.target.value)}
              placeholder="ej. Dell / HP / Lenovo / Cisco"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Modelo Comercial</label>
            <input
              type="text"
              value={atributos.modelo || ''}
              onChange={(e) => onChange('modelo', e.target.value)}
              placeholder="ej. Latitude 5420 / Catalyst 2960"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Número de Serie / Service Tag
            </label>
            <input
              type="text"
              value={atributos.numero_serie || ''}
              onChange={(e) => onChange('numero_serie', e.target.value)}
              placeholder="ej. SN-89412-ABC"
              className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Procesador / Chip</label>
            <input
              type="text"
              value={atributos.procesador || ''}
              onChange={(e) => onChange('procesador', e.target.value)}
              placeholder="ej. Intel Core i7 12va Gen"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Memoria RAM</label>
            <input
              type="text"
              value={atributos.ram || ''}
              onChange={(e) => onChange('ram', e.target.value)}
              placeholder="ej. 16 GB DDR4"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Almacenamiento</label>
            <input
              type="text"
              value={atributos.almacenamiento || ''}
              onChange={(e) => onChange('almacenamiento', e.target.value)}
              placeholder="ej. 512 GB NVMe SSD"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Garantía (Meses)</label>
            <input
              type="number"
              min="0"
              value={atributos.garantia_meses || ''}
              onChange={(e) => onChange('garantia_meses', e.target.value ? Number(e.target.value) : '')}
              placeholder="ej. 36"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Estado del Activo</label>
            <select
              value={atributos.estado_equipo || 'NUEVO'}
              onChange={(e) => onChange('estado_equipo', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="NUEVO">Nuevo en Caja</option>
              <option value="REACONDICIONADO">Reacondicionado / Certificado</option>
              <option value="OPERATIVO">Operativo / En Resguardo</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  if (dominio === 'ALIMENTOS') {
    return (
      <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100 space-y-3.5">
        <div className="flex items-center space-x-2 text-emerald-900 border-b border-emerald-100 pb-2">
          <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold uppercase tracking-wide">
            Control de Insumos de Alimentos & Perecederos
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Fecha de Vencimiento / Caducidad *</span>
            </label>
            <input
              type="date"
              required
              value={atributos.fecha_vencimiento || ''}
              onChange={(e) => onChange('fecha_vencimiento', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Lote de Fabricación
            </label>
            <input
              type="text"
              value={atributos.lote || ''}
              onChange={(e) => onChange('lote', e.target.value)}
              placeholder="ej. LOTE-2026-B4"
              className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-lg bg-white focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Régimen de Conservación
            </label>
            <select
              value={atributos.temperatura || 'AMBIENTE'}
              onChange={(e) => onChange('temperatura', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="AMBIENTE">Ambiente Seco / Fresco</option>
              <option value="REFRIGERADO">Refrigerado (2°C - 8°C)</option>
              <option value="CONGELADO">Congelado (-18°C)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Presentación Comercial
            </label>
            <input
              type="text"
              value={atributos.presentacion || ''}
              onChange={(e) => onChange('presentacion', e.target.value)}
              placeholder="ej. Bolsa 1 Kg / Caja x 24 unidades"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Advertencias de Consumo / Alérgenos
            </label>
            <input
              type="text"
              value={atributos.alergenos || ''}
              onChange={(e) => onChange('alergenos', e.target.value)}
              placeholder="ej. Contiene gluten / Libre de sellos / Consumir antes de 30 días de abierto"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>
    );
  }

  if (dominio === 'LIMPIEZA') {
    return (
      <div className="bg-cyan-50/60 rounded-xl p-4 border border-cyan-100 space-y-3.5">
        <div className="flex items-center space-x-2 text-cyan-900 border-b border-cyan-100 pb-2">
          <Sparkles className="w-4 h-4 text-cyan-600" />
          <h4 className="text-xs font-bold uppercase tracking-wide">
            Ficha de Seguridad de Productos de Limpieza & Aseo
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Volumen / Presentación *
            </label>
            <input
              type="text"
              required
              value={atributos.presentacion_volumen || ''}
              onChange={(e) => onChange('presentacion_volumen', e.target.value)}
              placeholder="ej. Galón 3.8 Litros / Envase 1000 ml"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Clasificación de Riesgo Químico
            </label>
            <select
              value={atributos.nivel_riesgo || 'BAJO'}
              onChange={(e) => onChange('nivel_riesgo', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="BAJO">Uso General / No Corrosivo</option>
              <option value="MEDIO">Desinfectante Fuerte / Grado Institucional</option>
              <option value="ALTO">Químico Corrosivo / Clorado Industrial</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Equipo de Protección Personal (EPP) Requerido</span>
            </label>
            <input
              type="text"
              value={atributos.epp_requerido || ''}
              onChange={(e) => onChange('epp_requerido', e.target.value)}
              placeholder="ej. Guantes de nitrilo, gafas de seguridad y mascarilla"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>
      </div>
    );
  }

  if (dominio === 'PAPELERIA') {
    return (
      <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100 space-y-3.5">
        <div className="flex items-center space-x-2 text-amber-900 border-b border-amber-100 pb-2">
          <FileText className="w-4 h-4 text-amber-600" />
          <h4 className="text-xs font-bold uppercase tracking-wide">
            Especificaciones de Papelería & Suministros
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Formato / Tamaño *
            </label>
            <input
              type="text"
              required
              value={atributos.formato || ''}
              onChange={(e) => onChange('formato', e.target.value)}
              placeholder="ej. Carta (8.5 x 11) / Oficio / A4"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Gramaje / Calibre</label>
            <input
              type="text"
              value={atributos.gramaje || ''}
              onChange={(e) => onChange('gramaje', e.target.value)}
              placeholder="ej. 75 gr/m²"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Unidades por Paquete / Empaque
            </label>
            <input
              type="text"
              value={atributos.unidades_paquete || ''}
              onChange={(e) => onChange('unidades_paquete', e.target.value)}
              placeholder="ej. 500 hojas por resma / Caja x 12"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Color / Tinta</label>
            <input
              type="text"
              value={atributos.color || ''}
              onChange={(e) => onChange('color', e.target.value)}
              placeholder="ej. Blanco / Negro / Azul"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </div>
    );
  }

  if (dominio === 'MANTENIMIENTO') {
    return (
      <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-100 space-y-3.5">
        <div className="flex items-center space-x-2 text-purple-900 border-b border-purple-100 pb-2">
          <Wrench className="w-4 h-4 text-purple-600" />
          <h4 className="text-xs font-bold uppercase tracking-wide">
            Ficha de Herramientas & Mantenimiento de Infraestructura
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tipo de Herramienta o Material *
            </label>
            <select
              value={atributos.tipo_herramienta || 'MANUAL'}
              onChange={(e) => onChange('tipo_herramienta', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="MANUAL">Herramienta Manual</option>
              <option value="ELECTRICA">Herramienta Eléctrica / Potencia</option>
              <option value="FONTANERIA">Fontanería / Tuberías</option>
              <option value="ELECTRICIDAD">Electricidad / Cableado</option>
              <option value="FERRETERIA">Ferretería / Tornillería</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Medida / Calibre / Dimensiones
            </label>
            <input
              type="text"
              value={atributos.medida || ''}
              onChange={(e) => onChange('medida', e.target.value)}
              placeholder="ej. 1/2 pulgada / Broca 6mm / Cable 12 AWG"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Voltaje / Alimentación
            </label>
            <input
              type="text"
              value={atributos.voltaje || ''}
              onChange={(e) => onChange('voltaje', e.target.value)}
              placeholder="ej. 110V / 220V / Batería 18V / N/A"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Material</label>
            <input
              type="text"
              value={atributos.material || ''}
              onChange={(e) => onChange('material', e.target.value)}
              placeholder="ej. Acero Cromo-Vanadio / Cobre / PVC"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>
    );
  }

  // Dominio General / Otros
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3.5">
      <div className="flex items-center space-x-2 text-slate-800 border-b border-slate-200 pb-2">
        <Info className="w-4 h-4 text-slate-500" />
        <h4 className="text-xs font-bold uppercase tracking-wide">
          Atributos Generales del Artículo
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Marca o Fabricante</label>
          <input
            type="text"
            value={atributos.marca || ''}
            onChange={(e) => onChange('marca', e.target.value)}
            placeholder="ej. 3M / Genérico"
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-slate-500 focus:border-slate-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Referencia / Código de Fábrica</label>
          <input
            type="text"
            value={atributos.referencia_fabrica || ''}
            onChange={(e) => onChange('referencia_fabrica', e.target.value)}
            placeholder="ej. REF-90210"
            className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-lg bg-white focus:ring-slate-500 focus:border-slate-500"
          />
        </div>
      </div>
    </div>
  );
};

