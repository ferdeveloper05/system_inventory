import React, { useState, useEffect } from 'react';
import { Solicitud } from '../types';
import { useSolicitudes } from '../hooks/useSolicitudes';
import {
  X,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  FileCheck2,
  Loader2,
  Lock,
} from 'lucide-react';

interface ConformidadModalProps {
  solicitud: Solicitud | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ConformidadModal: React.FC<ConformidadModalProps> = ({
  solicitud,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { cerrarSolicitud, isCerrando } = useSolicitudes();

  const [observaciones, setObservaciones] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setObservaciones('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen || !solicitud) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedFile) {
      setErrorMessage(
        'Validación crítica: Es obligatorio adjuntar una fotografía de conformidad con los productos entregados.'
      );
      return;
    }

    try {
      await cerrarSolicitud({
        id: solicitud.id,
        data: {
          foto_conformidad: selectedFile,
          observaciones: observaciones.trim() || undefined,
        },
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al cerrar solicitud:', err);
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : err?.message || 'Error al confirmar la recepción';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold tracking-tight">
                  Conformidad de Entrega: {solicitud.numero_solicitud}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Recepción física de insumos y cierre formal del requerimiento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isCerrando}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Error en la confirmación:</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Aviso de Cierre Definitivo */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-amber-900 text-xs">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-bold">Aviso de Cierre Definitivo:</p>
              <p className="mt-0.5">
                Al confirmar la recepción satisfactoria, la solicitud pasará al estado <strong>Cerrado</strong> y quedará permanentemente blindada contra cualquier modificación posterior.
              </p>
            </div>
          </div>

          {/* Subida Obligatoria de Fotografía de Conformidad */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Fotografía de Conformidad de los Productos * <span className="text-rose-600">(Obligatorio)</span>
            </label>
            <p className="text-xs text-slate-500">
              Capture o adjunte la fotografía de los productos recibidos en la unidad solicitante.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Dropzone */}
              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/20 text-center">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {selectedFile ? 'Cambiar fotografía' : 'Adjuntar fotografía de conformidad'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">JPG, PNG o WEBP</span>
              </label>

              {/* Previsualización */}
              <div className="h-36 border border-slate-200 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Previsualización de conformidad"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-xs">Sin imagen seleccionada</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Observaciones de Conformidad */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Observaciones de Entrega y Recepción
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Constancia de recepción en buen estado, observaciones de empaque..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-800 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Pie */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isCerrando}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCerrando}
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {isCerrando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cerrando solicitud...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Entrega y Cerrar Caso</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
