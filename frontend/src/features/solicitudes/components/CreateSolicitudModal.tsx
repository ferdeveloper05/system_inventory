import React, { useState, useEffect } from 'react';
import { useSolicitudes } from '../hooks/useSolicitudes';
import { DetalleSolicitudCreateInput, ProductoSimple } from '../types';
import { useAuthStore, isUserDirector, isUserAdmin } from '../../../store/authStore';
import {
  X,
  Plus,
  Trash2,
  FileText,
  Boxes,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Clock,
  Send,
} from 'lucide-react';

interface CreateSolicitudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateSolicitudModal: React.FC<CreateSolicitudModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const isAdmin = isUserAdmin(user);
  const isDirectorUser = isUserDirector(user);

  const { productos, createSolicitud, isCreating } = useSolicitudes();

  // Generador de número de solicitud
  const generateNumero = () => {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `SOL-${yyyy}${mm}${dd}-${rand}`;
  };

  const [numeroSolicitud, setNumeroSolicitud] = useState(generateNumero());
  const [motivo, setMotivo] = useState('');
  const [items, setItems] = useState<DetalleSolicitudCreateInput[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNumeroSolicitud(generateNumero());
      setMotivo('');
      setErrorMessage(null);

      // Ítem inicial
      if (productos.length > 0 && items.length === 0) {
        setItems([
          {
            id_producto: productos[0].id,
            cantidad_solicitada: 5,
            observaciones_item: '',
          },
        ]);
      }
    }
  }, [isOpen, productos]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const existingIds = new Set(items.map((i) => i.id_producto));
    const available = productos.find((p) => !existingIds.has(p.id)) || productos[0];
    if (!available) return;

    setItems((prev) => [
      ...prev,
      {
        id_producto: available.id,
        cantidad_solicitada: 1,
        observaciones_item: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setErrorMessage('La solicitud debe contener al menos un producto.');
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof DetalleSolicitudCreateInput,
    value: any
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Debe incluir al menos un producto en la solicitud.');
      return;
    }

    for (const it of items) {
      if (!it.id_producto) {
        setErrorMessage('Todos los ítems deben tener un producto válido.');
        return;
      }
      if (it.cantidad_solicitada <= 0) {
        setErrorMessage('Las cantidades solicitadas deben ser mayores a cero.');
        return;
      }
    }

    try {
      await createSolicitud({
        numero_solicitud: numeroSolicitud.trim() || undefined,
        motivo_justificacion: motivo.trim() || undefined,
        detalles: items.map((it) => ({
          id_producto: it.id_producto,
          cantidad_solicitada: Number(it.cantidad_solicitada),
          observaciones_item: it.observaciones_item?.trim() || undefined,
        })),
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al crear solicitud:', err);
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : err?.message || 'Error al registrar solicitud';
      setErrorMessage(msg);
    }
  };

  const totalUnidades = items.reduce((acc, it) => acc + (Number(it.cantidad_solicitada) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Nueva Solicitud de Materiales</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Requerimiento oficial de insumos dirigido al Departamento de Infraestructura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isCreating}
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
                <p className="font-bold">Error en la solicitud:</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Banner de Contexto de Rol & Aprobación */}
          {isDirectorUser || isAdmin ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-emerald-900 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-bold">Emisión Directa por Jefatura / Dirección:</p>
                <p className="mt-0.5 text-emerald-800">
                  Como <strong>{isAdmin ? 'Administrador' : 'Director del Departamento'}</strong>, esta solicitud nacerá{' '}
                  <strong>automáticamente aprobada</strong> y entrará directamente al Departamento de Infraestructura en estado <strong>Abierto</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-amber-900 text-xs">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-bold">Emisión por Analista (Supervisión Requerida):</p>
                <p className="mt-0.5 text-amber-800">
                  Como <strong>Analista</strong>, su petición quedará registrada en estado <strong>Abierto</strong> pero{' '}
                  <em>pendiente de aprobación interna</em>. El <strong>Director de su departamento</strong> deberá revisarla y aprobarla para remitirla a Infraestructura.
                </p>
              </div>
            </div>
          )}

          {/* Fila 1: Número y Departamento Solicitante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nº de Solicitud *
              </label>
              <input
                type="text"
                value={numeroSolicitud}
                onChange={(e) => setNumeroSolicitud(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 font-mono font-bold text-slate-800 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Departamento Solicitante
              </label>
              <div className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-100 text-slate-700 font-semibold truncate">
                {user?.departamento_nombre || 'Departamento Solicitante Asignado'}
              </div>
            </div>
          </div>

          {/* Justificación o Motivo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Motivo o Justificación del Requerimiento
            </label>
            <textarea
              rows={2}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describa el propósito, proyecto, evento o área que utilizará los materiales solicitados..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-800 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Sección de Productos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2">
                <Boxes className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Productos Requeridos ({totalUnidades} unidades en total)
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Producto</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Producto del Catálogo</th>
                    <th className="px-3.5 py-2.5 w-28 text-center">Cantidad *</th>
                    <th className="px-3.5 py-2.5">Notas / Especificaciones</th>
                    <th className="px-3.5 py-2.5 w-12 text-center">Quitar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-3.5 py-2.5">
                        <select
                          value={it.id_producto}
                          onChange={(e) =>
                            handleItemChange(idx, 'id_producto', Number(e.target.value))
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {productos.map((p) => (
                            <option key={p.id} value={p.id}>
                              [{p.codigo}] {p.nombre} ({p.categoria?.nombre || 'General'})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={it.cantidad_solicitada}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              'cantidad_solicitada',
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          required
                          className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white text-center font-bold text-slate-900 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-3.5 py-2.5">
                        <input
                          type="text"
                          value={it.observaciones_item || ''}
                          onChange={(e) =>
                            handleItemChange(idx, 'observaciones_item', e.target.value)
                          }
                          placeholder="Color, marca o detalle específico..."
                          className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length <= 1}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors disabled:opacity-30"
                          title="Eliminar fila"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pie de Acciones */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando requerimiento...</span>
                </>
              ) : isDirectorUser || isAdmin ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>Crear y Enviar Solicitud (Autoaprobada)</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Crear Solicitud (Enviar a Director)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
