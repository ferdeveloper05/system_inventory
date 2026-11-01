import React, { useState } from 'react';
import { Recepcion } from '../types';
import { AlertTriangle, X, Ban, Loader2 } from 'lucide-react';

interface AnularRecepcionModalProps {
  recepcion: Recepcion | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => Promise<void>;
}

export const AnularRecepcionModal: React.FC<AnularRecepcionModalProps> = ({
  recepcion,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}) => {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !recepcion) return null;

  const totalUnidades = recepcion.detalles.reduce(
    (acc, det) => acc + (det.cantidad_recibida || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) {
      setError('Debe especificar un motivo para anular la recepción.');
      return;
    }
    setError(null);
    try {
      await onConfirm(motivo.trim());
      setMotivo('');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Error al anular recepción');
    }
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Ban className="w-5 h-5 text-white" />
            <h3 className="font-bold text-base">Anular Recepción de Mercancía</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-rose-700 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold">¡Atención! Acción de reversión de inventario</p>
              <p className="mt-1 text-amber-700">
                Está a punto de anular la recepción <strong>{recepcion.numero_recepcion}</strong>. Se descontarán automáticamente <strong>{totalUnidades} unidades</strong> del <strong>{recepcion.almacen?.nombre || `Almacén #${recepcion.id_almacen}`}</strong> y se asentará un movimiento de salida en el Kardex.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Motivo o justificación de anulación *
            </label>
            <textarea
              required
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Mercancía devuelta por proveedor con lote dañado, error de digitación de cantidades..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center space-x-1.5 shadow-2xs disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirmar Anulación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

