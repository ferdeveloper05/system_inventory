import React, { useState, useEffect } from 'react';
import { useProductos } from '../hooks/useProductos';
import { Producto, CategoriaDominio, detectarDominioCategoria } from '../types';
import { DynamicCategoryFields } from './DynamicCategoryFields';
import {
  X,
  Package,
  Barcode,
  Layers,
  Warehouse,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface EditProductoModalProps {
  producto: Producto | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditProductoModal: React.FC<EditProductoModalProps> = ({
  producto,
  isOpen,
  onClose,
}) => {
  const { categorias, almacenes, updateProducto, isUpdatingProducto } = useProductos();

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    unidad_medida: 'UNIDAD',
    stock_minimo: 5,
    stock_maximo: 500,
    id_categoria: 0,
    id_almacen_predeterminado: undefined as number | undefined,
    atributos: {} as Record<string, any>,
    activo: true,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Función para determinar el almacén óptimo según el dominio de la categoría
  const findMatchingAlmacen = (catId: number, currentAlmacenes = almacenes) => {
    if (!currentAlmacenes || currentAlmacenes.length === 0) return undefined;
    const cat = categorias.find((c) => c.id === catId);
    if (!cat) return currentAlmacenes[0];

    const dominio = detectarDominioCategoria(cat.nombre, cat.codigo);
    return (
      currentAlmacenes.find((a) => {
        if (a.tipo === dominio) return true;
        if (dominio === 'ALIMENTOS' && a.tipo === 'ALIMENTOS') return true;
        if (dominio === 'LIMPIEZA' && a.tipo === 'LIMPIEZA') return true;
        if (dominio === 'TECNOLOGIA' && a.tipo === 'TECNOLOGIA') return true;
        if (dominio === 'PAPELERIA' && a.tipo === 'PAPELERIA') return true;
        if (dominio === 'MANTENIMIENTO' && a.tipo === 'MANTENIMIENTO') return true;
        return false;
      }) || currentAlmacenes[0]
    );
  };

  useEffect(() => {
    if (producto && isOpen) {
      // Si el producto no tiene almacén asignado aún, buscar el correspondiente por categoría
      const initialAlmacenId =
        producto.id_almacen_predeterminado ||
        (almacenes.length > 0 ? findMatchingAlmacen(producto.id_categoria, almacenes)?.id : undefined);

      setFormData({
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        unidad_medida: producto.unidad_medida,
        stock_minimo: producto.stock_minimo,
        stock_maximo: producto.stock_maximo,
        id_categoria: producto.id_categoria,
        id_almacen_predeterminado: initialAlmacenId,
        atributos: producto.atributos || {},
        activo: producto.activo,
      });
      setErrorMessage(null);
    }
  }, [producto, isOpen, almacenes]);

  // Si los almacenes terminan de cargar después de haber abierto el modal
  useEffect(() => {
    if (isOpen && almacenes.length > 0 && formData.id_categoria > 0 && !formData.id_almacen_predeterminado) {
      const match = findMatchingAlmacen(formData.id_categoria, almacenes);
      if (match) {
        setFormData((prev) => ({
          ...prev,
          id_almacen_predeterminado: match.id,
        }));
      }
    }
  }, [isOpen, almacenes, formData.id_categoria, formData.id_almacen_predeterminado]);

  if (!isOpen || !producto) return null;

  const categoriaActual = categorias.find((c) => c.id === formData.id_categoria);
  const dominioActual: CategoriaDominio = categoriaActual
    ? detectarDominioCategoria(categoriaActual.nombre, categoriaActual.codigo)
    : 'GENERAL';

  const almacenActual = almacenes.find((a) => a.id === formData.id_almacen_predeterminado);

  const handleAtributoChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      atributos: {
        ...prev.atributos,
        [key]: value,
      },
    }));
  };

  const handleCategoriaChange = (newCatId: number) => {
    const matchingAlmacen = findMatchingAlmacen(newCatId, almacenes);

    setFormData((prev) => ({
      ...prev,
      id_categoria: newCatId,
      id_almacen_predeterminado: matchingAlmacen ? matchingAlmacen.id : prev.id_almacen_predeterminado,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await updateProducto({
        id: producto.id,
        data: {
          codigo: formData.codigo.trim().toUpperCase(),
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || undefined,
          unidad_medida: formData.unidad_medida.trim().toUpperCase(),
          stock_minimo: Number(formData.stock_minimo),
          stock_maximo: Number(formData.stock_maximo),
          id_categoria: Number(formData.id_categoria),
          id_almacen_predeterminado: formData.id_almacen_predeterminado
            ? Number(formData.id_almacen_predeterminado)
            : undefined,
          atributos: formData.atributos,
          activo: formData.activo,
        },
      });

      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al actualizar el producto';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                Editar Producto: {producto.nombre}
              </h3>
              <p className="text-xs text-slate-500">
                Código: <span className="font-mono font-bold text-slate-700">{producto.codigo}</span>
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

          {/* Categoría y Almacén */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Categoría del Producto *</span>
                </label>
                <select
                  value={formData.id_categoria}
                  onChange={(e) => handleCategoriaChange(Number(e.target.value))}
                  className="block w-full px-3 py-2 text-sm border border-indigo-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Almacén de Destino *</span>
                  </span>
                  {almacenActual && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                      Asignado ({almacenActual.tipo})
                    </span>
                  )}
                </label>
                <select
                  required
                  value={formData.id_almacen_predeterminado ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id_almacen_predeterminado: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="block w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
                >
                  <option value="">-- Seleccionar almacén de destino --</option>
                  {almacenes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} [{a.tipo}] - {a.codigo}
                    </option>
                  ))}
                </select>
                {almacenes.length === 0 && (
                  <p className="mt-1 text-[11px] text-amber-700 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>No hay almacenes disponibles en el sistema. Registre al menos un almacén.</span>
                  </p>
                )}
              </div>
            </div>

            {almacenActual ? (
              <div className="flex items-center space-x-2 text-xs text-slate-700 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Enrutamiento:</strong> Este producto está asignado a <strong>{almacenActual.nombre}</strong> ({almacenActual.tipo}).
                </span>
              </div>
            ) : almacenes.length === 0 ? (
              <div className="flex items-center space-x-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  No hay almacenes configurados en el sistema para vincular a este producto.
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Seleccione un almacén de destino predeterminado para este producto.
                </span>
              </div>
            )}
          </div>

          {/* Código, Nombre y Unidad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código SKU *
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

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Unidad y Umbrales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unidad de Medida *
              </label>
              <select
                value={formData.unidad_medida}
                onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="UNIDAD">Unidad (u)</option>
                <option value="KILO">Kilogramo (Kg)</option>
                <option value="LITRO">Litro (L)</option>
                <option value="PAQUETE">Paquete</option>
                <option value="CAJA">Caja</option>
                <option value="RESMA">Resma</option>
                <option value="METRO">Metro (m)</option>
                <option value="ROLLO">Rollo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stock Mínimo (Alerta) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock_minimo}
                onChange={(e) => setFormData({ ...formData, stock_minimo: Number(e.target.value) })}
                className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stock Máximo Capacidad *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.stock_maximo}
                onChange={(e) => setFormData({ ...formData, stock_maximo: Number(e.target.value) })}
                className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* CAMPOS DINÁMICOS */}
          <div>
            <DynamicCategoryFields
              dominio={dominioActual}
              atributos={formData.atributos}
              onChange={handleAtributoChange}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción General
            </label>
            <textarea
              rows={2}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Estado Activo */}
          <div className="pt-1">
            <label className="flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-700">
                Producto activo en catálogo institucional
              </span>
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
              disabled={isUpdatingProducto}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isUpdatingProducto ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

