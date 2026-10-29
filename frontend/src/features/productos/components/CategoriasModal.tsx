import React, { useState } from 'react';
import { useProductos } from '../hooks/useProductos';
import { Categoria } from '../types';
import {
  X,
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  Tag,
} from 'lucide-react';

interface CategoriasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoriasModal: React.FC<CategoriasModalProps> = ({ isOpen, onClose }) => {
  const {
    categorias,
    createCategoria,
    isCreatingCategoria,
    updateCategoria,
    isUpdatingCategoria,
    deleteCategoria,
    isDeletingCategoria,
  } = useProductos();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    activo: true,
  });

  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const startEdit = (cat: Categoria) => {
    setEditingId(cat.id);
    setFormData({
      nombre: cat.nombre,
      codigo: cat.codigo,
      descripcion: cat.descripcion || '',
      activo: cat.activo,
    });
    setIsAdding(false);
    setErrorMessage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ nombre: '', codigo: '', descripcion: '', activo: true });
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      if (editingId) {
        await updateCategoria({
          id: editingId,
          data: {
            nombre: formData.nombre.trim(),
            codigo: formData.codigo.trim().toUpperCase(),
            descripcion: formData.descripcion.trim() || undefined,
            activo: formData.activo,
          },
        });
        cancelEdit();
      } else {
        await createCategoria({
          nombre: formData.nombre.trim(),
          codigo: formData.codigo.trim().toUpperCase(),
          descripcion: formData.descripcion.trim() || undefined,
          activo: formData.activo,
        });
        cancelEdit();
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al guardar la categoría';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const handleDelete = async (cat: Categoria) => {
    if (cat.total_productos && cat.total_productos > 0) {
      alert(
        `No se puede eliminar la categoría "${cat.nombre}" porque contiene ${cat.total_productos} producto(s) asociado(s). Reasigne o elimine los productos primero.`
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Deseas eliminar la categoría "${cat.nombre}" (${cat.codigo})?`
    );
    if (!confirmed) return;

    try {
      await deleteCategoria(cat.id);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al eliminar la categoría';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                Gestión de Categorías de Catálogo
              </h3>
              <p className="text-xs text-slate-500">
                Líneas de suministro para clasificar y enrutar productos a almacenes.
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

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulario de Agregar o Editar */}
          {(isAdding || editingId !== null) && (
            <form onSubmit={handleSave} className="bg-slate-50 p-4 rounded-xl border border-indigo-200 space-y-3">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                {editingId ? 'Editar Categoría' : 'Nueva Categoría de Suministro'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="ej. Materiales Eléctricos"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código Único *</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    placeholder="ej. CAT-ELEC"
                    className="w-full px-3 py-1.5 uppercase font-mono border border-slate-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción del tipo de suministros que engloba..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCategoria || isUpdatingCategoria}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  {isCreatingCategoria || isUpdatingCategoria ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          )}

          {/* Barra de acción: Agregar Categoría */}
          {!isAdding && editingId === null && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">
                {categorias.length} categorías registradas
              </span>
              <button
                onClick={() => {
                  setIsAdding(true);
                  setFormData({ nombre: '', codigo: 'CAT-', descripcion: '', activo: true });
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Categoría</span>
              </button>
            </div>
          )}

          {/* Tabla de categorías */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase font-semibold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Código</th>
                  <th className="px-4 py-2.5">Nombre & Descripción</th>
                  <th className="px-4 py-2.5 text-center">Productos</th>
                  <th className="px-4 py-2.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categorias.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">
                      {cat.codigo}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{cat.nombre}</p>
                      {cat.descripcion && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">
                          {cat.descripcion}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {cat.total_productos ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => startEdit(cat)}
                          title="Editar categoría"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          disabled={isDeletingCategoria}
                          title="Eliminar categoría"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

