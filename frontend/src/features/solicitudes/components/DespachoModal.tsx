import React, { useState, useEffect } from 'react';
import { Solicitud, SolicitudDespachoItemInput, AlmacenRef } from '../types';
import { useSolicitudes } from '../hooks/useSolicitudes';
import {
  X,
  Truck,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Warehouse,
  CheckCircle2,
  Loader2,
  Trash2,
} from 'lucide-react';

interface DespachoModalProps {
  solicitud: Solicitud | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DespachoModal: React.FC<DespachoModalProps> = ({
  solicitud,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { almacenes, despacharSolicitud, isDespachando } = useSolicitudes();

  const [items, setItems] = useState<SolicitudDespachoItemInput[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && solicitud) {
      setObservaciones('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setErrorMessage(null);

      // Pre-cargar items con almacenes sugeridos o existentes
      if (solicitud.detalles) {
        setItems(
          solicitud.detalles.map((det) => ({
            id_producto: det.id_producto,
            cantidad_despachada: det.cantidad_solicitada,
            id_almacen_despacho:
              det.id_almacen_despacho ||
              det.producto?.id_almacen_predeterminado ||
              solicitud.id_almacen_origen ||
              (almacenes[0]?.id ?? 1),
            observaciones_item: det.observaciones_item || '',
          }))
        );
      }
    }
  }, [isOpen, solicitud, almacenes]);

  // Limpiar URL de previsualización al desmontar
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

  const handleItemChange = (index: number, field: keyof SolicitudDespachoItemInput, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedFile) {
      setErrorMessage('Validación crítica: Es obligatorio adjuntar una fotografía como comprobante de salida física de insumos.');
      return;
    }

    for (const it of items) {
      if (it.cantidad_despachada <= 0) {
        setErrorMessage('La cantidad despachada de cada producto debe ser mayor a cero.');
        return;
      }
      if (!it.id_almacen_despacho) {
        setErrorMessage('Debe seleccionar el almacén especializado de salida para cada ítem.');
        return;
      }
    }

    try {
      await despacharSolicitud({
        id: solicitud.id,
        data: {
          foto_comprobante: selectedFile,
          observaciones: observaciones.trim() || undefined,
          items: items,
        },
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al despachar solicitud:', err);
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : err?.message || 'Error al procesar el despacho';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30 text-blue-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold tracking-tight">
                  Despacho de Insumos: {solicitud.numero_solicitud}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  INFRAESTRUCTURA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Salida física de almacenes, descuento de stock y registro de comprobante fotográfico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDespachando}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Error en el despacho:</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Información del Destino */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <span className="text-slate-500 block">Departamento Destino:</span>
              <strong className="text-slate-900 text-sm">
                {solicitud.departamento_solicitante?.nombre || 'Departamento Solicitante'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Funcionario Solicitante:</span>
              <strong className="text-slate-900">
                {solicitud.empleado_solicita
                  ? `${solicitud.empleado_solicita.nombre} ${solicitud.empleado_solicita.apellido}`
                  : `Empleado #${solicitud.id_empleado_solicita}`}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Aprobado por:</span>
              <strong className="text-emerald-700">
                {solicitud.director_aprueba?.username || 'Director Solicitante'}
              </strong>
            </div>
          </div>

          {/* Tabla de Productos y Asignación de Almacenes Especializados */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Warehouse className="w-4 h-4 text-blue-600" />
              <span>Productos a Despachar & Almacenes Especializados</span>
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Producto</th>
                    <th className="px-3.5 py-2.5 w-24 text-center">Sol.</th>
                    <th className="px-3.5 py-2.5 w-28 text-center">A Despachar *</th>
                    <th className="px-3.5 py-2.5">Almacén de Salida *</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {solicitud.detalles.map((det, idx) => {
                    const currentItem = items[idx];
                    return (
                      <tr key={det.id} className="hover:bg-slate-50/50">
                        <td className="px-3.5 py-2.5">
                          <span className="font-bold text-slate-900 block">
                            {det.producto?.nombre || `Producto #${det.id_producto}`}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            [{det.producto?.codigo || 'N/A'}] • {det.producto?.categoria?.nombre || 'General'}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-center font-bold text-slate-600 text-sm">
                          {det.cantidad_solicitada}
                        </td>
                        <td className="px-3.5 py-2.5 text-center">
                          <input
                            type="number"
                            min="1"
                            max={det.cantidad_solicitada}
                            value={currentItem?.cantidad_despachada ?? det.cantidad_solicitada}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                'cantidad_despachada',
                                Math.max(1, parseInt(e.target.value) || 1)
                              )
                            }
                            required
                            className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white text-center font-bold text-blue-700 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-3.5 py-2.5">
                          <select
                            value={currentItem?.id_almacen_despacho ?? ''}
                            onChange={(e) =>
                              handleItemChange(idx, 'id_almacen_despacho', Number(e.target.value))
                            }
                            required
                            className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {almacenes.map((alm) => (
                              <option key={alm.id} value={alm.id}>
                                {alm.nombre} [{alm.tipo}]
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subida Obligatoria de Fotografía Comprobante de Despacho */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Fotografía Comprobante de Despacho Físico * <span className="text-rose-600">(Obligatorio)</span>
            </label>
            <p className="text-xs text-slate-500">
              Adjunte una imagen clara de los insumos preparados o embalados en el andén de salida para acreditar la entrega en camino.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Dropzone / Input */}
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20 text-center">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {selectedFile ? 'Cambiar fotografía' : 'Seleccionar fotografía de despacho'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">Formatos JPG, PNG o WEBP</span>
              </label>

              {/* Previsualización */}
              <div className="h-36 border border-slate-200 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden relative">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Previsualización de despacho"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-slate-900/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                      {selectedFile?.name}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-xs">Sin imagen seleccionada</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Observaciones de Despacho */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Observaciones o Notas de Salida
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Detalles sobre transportista, precintos, número de bultos o condiciones..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-800 focus:bg-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Pie de Acciones */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isDespachando}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isDespachando}
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {isDespachando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Descontando inventario & Despachando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Despacho (Entrega en Camino)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
