import React, { useState } from 'react';
import { useUsuarios } from '../../usuarios/hooks/useUsuarios';
import { X, ShieldPlus, AlignLeft, Shield } from 'lucide-react';

interface CreateRolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRolModal: React.FC<CreateRolModalProps> = ({ isOpen, onClose }) => {
  const { createRol, isCreatingRol } = useUsuarios();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await createRol({
        nombre: formData.nombre.trim().toUpperCase(),
        descripcion: formData.descripcion.trim() || undefined,
        activo: formData.activo,
      });
      setFormData({ nombre: '', descripcion: '', activo: true });
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Error al crear rol';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ShieldPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Nuevo Rol de Acceso</h3>
              <p className="text-xs text-slate-500">Definir perfil de permisos y nivel de seguridad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre del Rol *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Shield className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="ej. AUDITOR_INFRAESTRUCTURA"
                className="block w-full pl-9 pr-3 py-2 text-sm uppercase font-mono border border-slate-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Se guardará automáticamente en mayúsculas.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción del Perfil / Alcance
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 flex items-start pointer-events-none text-slate-400">
                <AlignLeft className="h-4 w-4" />
              </div>
              <textarea
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Permisos otorgados, módulos accesibles y nivel de operaciones..."
                className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center border-t border-slate-100">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
              />
              <span>Rol Habilitado / Activo</span>
            </label>
          </div>

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
              disabled={isCreatingRol}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isCreatingRol ? 'Guardando...' : 'Crear Rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

