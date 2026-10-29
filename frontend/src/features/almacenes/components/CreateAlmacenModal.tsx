import React, { useState, useEffect } from 'react';
import { useAlmacenes } from '../hooks/useAlmacenes';
import { AlmacenTipo, TIPOS_ALMACEN_META } from '../types';
import {
  X,
  Warehouse,
  MapPin,
  Barcode,
  Package,
  AlignLeft,
  AlertCircle,
  UtensilsCrossed,
  Sparkles,
  Laptop,
  FileText,
  Wrench,
  Tag,
} from 'lucide-react';

interface CreateAlmacenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAlmacenModal: React.FC<CreateAlmacenModalProps> = ({ isOpen, onClose }) => {
  const { createAlmacen, isCreatingAlmacen, categoriasDisponibles } = useAlmacenes();

  const [formData, setFormData] = useState({
    codigo: 'ALM-TEC-01',
    nombre: '',
    tipo: 'TECNOLOGIA' as AlmacenTipo,
    ubicacion: '',
    capacidad: '' as number | string,
    descripcion: '',
    activo: true,
    ids_categorias: [] as number[],
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-seleccionar categoría sugerida al cambiar el tipo
  const handleTipoChange = (newTipo: AlmacenTipo) => {
    const meta = TIPOS_ALMACEN_META[newTipo];
    let nuevoCodigo = formData.codigo;
    if (!formData.codigo || formData.codigo.startsWith('ALM-')) {
      const suffix = formData.codigo.split('-')[2] || '01';
      nuevoCodigo = `${meta.prefix}${suffix}`;
    }

    // Buscar categoría sugerida por defecto
    const matchingCat = categoriasDisponibles.find(
      (c) => c.nombre.toLowerCase().includes(meta.defaultCategoryName.toLowerCase()) ||
             c.nombre.toLowerCase().includes(newTipo.toLowerCase())
    );

    const newCats = matchingCat ? [matchingCat.id] : [];

    setFormData({
      ...formData,
      tipo: newTipo,
      codigo: nuevoCodigo,
      ids_categorias: newCats,
    });
  };

  const toggleCategoria = (catId: number) => {
    setFormData((prev) => {
      const exists = prev.ids_categorias.includes(catId);
      return {
        ...prev,
        ids_categorias: exists
          ? prev.ids_categorias.filter((id) => id !== catId)
          : [...prev.ids_categorias, catId],
      };
    });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await createAlmacen({
        codigo: formData.codigo.trim().toUpperCase(),
        nombre: formData.nombre.trim(),
        tipo: formData.tipo,
        ubicacion: formData.ubicacion.trim(),
        capacidad: formData.capacidad ? Number(formData.capacidad) : undefined,
        descripcion: formData.descripcion.trim() || undefined,
        activo: formData.activo,
        ids_categorias: formData.ids_categorias.length > 0 ? formData.ids_categorias : undefined,
      });

      setFormData({
        codigo: 'ALM-TEC-01',
        nombre: '',
        tipo: 'TECNOLOGIA',
        ubicacion: '',
        capacidad: '',
        descripcion: '',
        activo: true,
        ids_categorias: [],
      });
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al crear el almacén';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const getTipoIcon = (tipo: AlmacenTipo) => {
    switch (tipo) {
      case 'ALIMENTOS':
        return <UtensilsCrossed className="w-4 h-4" />;
      case 'LIMPIEZA':
        return <Sparkles className="w-4 h-4" />;
      case 'TECNOLOGIA':
        return <Laptop className="w-4 h-4" />;
      case 'PAPELERIA':
        return <FileText className="w-4 h-4" />;
      case 'MANTENIMIENTO':
        return <Wrench className="w-4 h-4" />;
      case 'GENERAL':
        return <Warehouse className="w-4 h-4" />;
      default:
        return <Warehouse className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                Nuevo Almacén Especializado
              </h3>
              <p className="text-xs text-slate-500">
                Define el tipo de suministro (comida, limpieza, tecnología, papelería), ubicación y capacidad.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Selector de Tipo de Almacén */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Línea de Suministro / Tipo de Almacén *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {(Object.keys(TIPOS_ALMACEN_META) as AlmacenTipo[]).map((tipoKey) => {
                const meta = TIPOS_ALMACEN_META[tipoKey];
                const isSelected = formData.tipo === tipoKey;
                return (
                  <button
                    type="button"
                    key={tipoKey}
                    onClick={() => handleTipoChange(tipoKey)}
                    className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1.5">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected ? 'bg-indigo-600 text-white' : `${meta.iconBg} ${meta.iconText}`
                        }`}
                      >
                        {getTipoIcon(tipoKey)}
                      </div>
                      <span className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {meta.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categorías que recibe el almacén */}
          {categoriasDisponibles.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Categorías de Producto que Recibe este Almacén</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {categoriasDisponibles.map((cat) => {
                  const isChecked = formData.ids_categorias.includes(cat.id);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => toggleCategoria(cat.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {cat.nombre}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                La infraestructura despachará automáticamente los productos de estas categorías a este almacén.
              </p>
            </div>
          )}

          {/* Código y Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código del Almacén *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Barcode className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  placeholder="ej. ALM-ALIM-01"
                  className="block w-full pl-9 pr-3 py-2 text-sm uppercase font-mono border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Identificador de ubicación para despachos</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre Descriptivo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Warehouse className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="ej. Almacén de Insumos de Cafetería y Perecederos"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Ubicación y Capacidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ubicación Física *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  placeholder="ej. Edificio Sede, Sótano 1 - Área de Aseo"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Capacidad Máxima (Unidades)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Package className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  min="1"
                  value={formData.capacidad}
                  onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                  placeholder="ej. 3000"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Control de llenado y alertas de capacidad</p>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción & Condiciones Especiales
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 flex items-start pointer-events-none text-slate-400">
                <AlignLeft className="h-4 w-4" />
              </div>
              <textarea
                rows={2}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Condiciones de almacenamiento (ej. refrigeración requerida, ventilación para químicos, estantes metálicos)..."
                className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreatingAlmacen}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isCreatingAlmacen ? 'Registrando...' : 'Registrar Almacén'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
