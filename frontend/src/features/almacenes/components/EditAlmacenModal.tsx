import React, { useState, useEffect } from 'react';
import { useAlmacenes } from '../hooks/useAlmacenes';
import { Almacen, AlmacenTipo, TIPOS_ALMACEN_META } from '../types';
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
  CheckCircle,
  Tag,
} from 'lucide-react';

interface EditAlmacenModalProps {
  almacen: Almacen | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditAlmacenModal: React.FC<EditAlmacenModalProps> = ({
  almacen,
  isOpen,
  onClose,
}) => {
  const { updateAlmacen, isUpdatingAlmacen, categoriasDisponibles } = useAlmacenes();

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: 'GENERAL' as AlmacenTipo,
    ubicacion: '',
    capacidad: '' as number | string,
    descripcion: '',
    activo: true,
    ids_categorias: [] as number[],
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (almacen) {
      setFormData({
        codigo: almacen.codigo,
        nombre: almacen.nombre,
        tipo: almacen.tipo || 'GENERAL',
        ubicacion: almacen.ubicacion,
        capacidad:
          almacen.capacidad !== null && almacen.capacidad !== undefined
            ? almacen.capacidad
            : '',
        descripcion: almacen.descripcion || '',
        activo: almacen.activo,
        ids_categorias: almacen.categorias ? almacen.categorias.map((c) => c.id) : [],
      });
      setErrorMessage(null);
    }
  }, [almacen]);

  if (!isOpen || !almacen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await updateAlmacen({
        id: almacen.id,
        data: {
          codigo: formData.codigo.trim().toUpperCase(),
          nombre: formData.nombre.trim(),
          tipo: formData.tipo,
          ubicacion: formData.ubicacion.trim(),
          capacidad: formData.capacidad ? Number(formData.capacidad) : undefined,
          descripcion: formData.descripcion.trim() || undefined,
          activo: formData.activo,
          ids_categorias: formData.ids_categorias,
        },
      });
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al actualizar el almacén';
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
                Editar Almacén #{almacen.id} - {almacen.nombre}
              </h3>
              <p className="text-xs text-slate-500">
                Actualizar clasificación de suministro, categorías asociadas y capacidad física.
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
                    onClick={() => setFormData({ ...formData, tipo: tipoKey })}
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

          {/* Categorías vinculadas */}
          {categoriasDisponibles.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Categorías de Producto Asignadas a este Almacén</span>
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
                  className="block w-full pl-9 pr-3 py-2 text-sm uppercase font-mono border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Almacén *
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
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción & Observaciones
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 flex items-start pointer-events-none text-slate-400">
                <AlignLeft className="h-4 w-4" />
              </div>
              <textarea
                rows={2}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Estado Activo */}
          <div className="pt-2">
            <label className="flex items-center space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div className="flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">
                  Almacén activo para despachos, recepciones y transferencias
                </span>
              </div>
            </label>
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
              disabled={isUpdatingAlmacen}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isUpdatingAlmacen ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
