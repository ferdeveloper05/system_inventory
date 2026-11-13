import React, { useState } from 'react';
import { Recepcion } from '../types';
import { useRecepciones } from '../hooks/useRecepciones';
import { useAuthStore, isUserAdmin } from '../../../store/authStore';
import {
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  ShieldAlert,
  Boxes,
  Warehouse,
} from 'lucide-react';

interface DeleteRecepcionModalProps {
  recepcion: Recepcion | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteRecepcionModal: React.FC<DeleteRecepcionModalProps> = ({
  recepcion,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const isAdmin = isUserAdmin(user);
  const { deleteRecepcion, isDeleting } = useRecepciones();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !recepcion) return null;

  // Si no es administrador, rechazar acción
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-rose-200 p-6 text-center">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Acceso Restringido</h3>
          <p className="text-sm text-slate-600 mt-2">
            La eliminación completa de recepciones está restringida exclusivamente al usuario Administrador.
          </p>
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const totalUnidades = recepcion.detalles?.reduce(
    (acc, it) => acc + (it.cantidad_recibida || 0),
    0
  );

  const handleDelete = async () => {
    setErrorMessage(null);
    try {
      await deleteRecepcion(recepcion.id);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al eliminar recepción:', err);
      const detail = err?.response?.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
          : err?.message || 'Error al eliminar la recepción del servidor.';
      setErrorMessage(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-rose-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-700/50 rounded-xl border border-rose-400/40 text-white">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold tracking-tight">Eliminar Recepción</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white text-rose-700">
                  ADMINISTRADOR
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">Acción permanente e irreversible</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-rose-200 hover:text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              <strong className="block font-bold mb-0.5">Error:</strong>
              {errorMessage}
            </div>
          )}

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-amber-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Advertencia Crítica de Inventario:</p>
              <p className="mt-1 leading-relaxed">
                Está a punto de eliminar de forma completa la recepción{' '}
                <strong className="font-mono text-slate-900">{recepcion.numero_recepcion}</strong>.
                {recepcion.estado === 'COMPLETADA' ? (
                  <>
                    {' '}
                    El sistema <strong>descontará automáticamente las {totalUnidades} unidades</strong> ingresadas del almacén{' '}
                    <strong>{recepcion.almacen?.nombre || `#${recepcion.id_almacen}`}</strong>,
                    registrará un movimiento de salida correctivo en el Kardex y dejará constancia en la auditoría.
                  </>
                ) : (
                  <>
                    {' '}
                    El registro será borrado permanentemente y se dejará constancia en la auditoría del sistema.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Resumen de la Recepción */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Nº Recepción:</span>
              <span className="font-mono font-bold text-slate-800">{recepcion.numero_recepcion}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Almacén Destino:</span>
              <span className="font-semibold text-slate-800">
                {recepcion.almacen?.nombre || `#${recepcion.id_almacen}`} [{recepcion.almacen?.tipo}]
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Estado Actual:</span>
              <span className="font-bold text-slate-800">{recepcion.estado}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Total Unidades:</span>
              <span className="font-bold text-rose-600">{totalUnidades} unidades ({recepcion.detalles?.length || 0} productos)</span>
            </div>
          </div>
        </div>

        {/* Pie de Acciones */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Eliminando y Reconciliando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Confirmar Eliminación Completa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
