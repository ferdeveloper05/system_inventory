import React, { useState, useEffect } from 'react';
import { useRecepciones } from '../hooks/useRecepciones';
import { Recepcion, RecepcionUpdatePayload } from '../types';
import { useAuthStore, isUserAdmin } from '../../../store/authStore';
import {
  X,
  Plus,
  Trash2,
  Boxes,
  Warehouse,
  UserCheck,
  Package,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  ArrowRightLeft,
  FileEdit,
} from 'lucide-react';

interface EditRecepcionModalProps {
  recepcion: Recepcion | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ItemRow {
  id?: number;
  id_producto: number;
  cantidad_recibida: number;
  estado_producto: string;
  observaciones: string;
}

export const EditRecepcionModal: React.FC<EditRecepcionModalProps> = ({
  recepcion,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const isAdmin = isUserAdmin(user);

  const { almacenes, productos, empleados, updateRecepcion, isUpdating } = useRecepciones();

  const [numeroRecepcion, setNumeroRecepcion] = useState('');
  const [idAlmacen, setIdAlmacen] = useState<number>(0);
  const [idEmpleado, setIdEmpleado] = useState<number>(0);
  const [idOrdenCompra, setIdOrdenCompra] = useState<string>('');
  const [estado, setEstado] = useState<string>('COMPLETADA');
  const [observaciones, setObservaciones] = useState<string>('');
  const [items, setItems] = useState<ItemRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && recepcion) {
      setNumeroRecepcion(recepcion.numero_recepcion || '');
      setIdAlmacen(recepcion.id_almacen);
      setIdEmpleado(recepcion.id_empleado_recibe);
      setIdOrdenCompra(recepcion.id_orden_compra ? String(recepcion.id_orden_compra) : '');
      setEstado(recepcion.estado || 'COMPLETADA');
      setObservaciones(recepcion.observaciones || '');
      setErrorMessage(null);

      if (recepcion.detalles && recepcion.detalles.length > 0) {
        setItems(
          recepcion.detalles.map((d) => ({
            id: d.id,
            id_producto: d.id_producto,
            cantidad_recibida: d.cantidad_recibida,
            estado_producto: d.estado_producto || 'CONFORME',
            observaciones: d.observaciones || '',
          }))
        );
      } else {
        setItems([]);
      }
    }
  }, [isOpen, recepcion]);

  if (!isOpen || !recepcion) return null;

  // Si no es administrador, no permitir edición
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-rose-200 p-6 text-center">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Acceso Denegado</h3>
          <p className="text-sm text-slate-600 mt-2">
            La edición de recepciones y corrección de almacenes está reservada exclusivamente para el usuario Administrador del sistema.
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

  const almacenOriginal = almacenes.find((a) => a.id === recepcion.id_almacen);
  const almacenSeleccionado = almacenes.find((a) => a.id === idAlmacen);
  const haCambiadoAlmacen = recepcion.id_almacen !== idAlmacen;

  const handleAddItem = () => {
    const existingIds = new Set(items.map((i) => i.id_producto));
    const availableProd = productos.find((p) => !existingIds.has(p.id)) || productos[0];

    if (!availableProd) return;

    setItems((prev) => [
      ...prev,
      {
        id_producto: availableProd.id,
        cantidad_recibida: 1,
        estado_producto: 'CONFORME',
        observaciones: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setErrorMessage('La recepción debe contener al menos un producto.');
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof ItemRow, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!numeroRecepcion.trim()) {
      setErrorMessage('El número de recepción es obligatorio.');
      return;
    }

    if (!idAlmacen) {
      setErrorMessage('Debe seleccionar un almacén de destino.');
      return;
    }

    if (!idEmpleado) {
      setErrorMessage('Debe seleccionar el empleado que recibe.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Debe incluir al menos un producto en la recepción.');
      return;
    }

    for (const item of items) {
      if (!item.id_producto) {
        setErrorMessage('Todos los ítems deben tener un producto válido asignado.');
        return;
      }
      if (item.cantidad_recibida <= 0) {
        setErrorMessage('Las cantidades recibidas deben ser números mayores a cero.');
        return;
      }
    }

    const payload: RecepcionUpdatePayload = {
      numero_recepcion: numeroRecepcion.trim(),
      id_almacen: idAlmacen,
      id_empleado_recibe: idEmpleado,
      id_orden_compra: idOrdenCompra.trim() ? Number(idOrdenCompra) : undefined,
      estado,
      observaciones: observaciones.trim() || undefined,
      detalles: items.map((it) => ({
        id_producto: it.id_producto,
        cantidad_recibida: Number(it.cantidad_recibida),
        estado_producto: it.estado_producto,
        observaciones: it.observaciones?.trim() || undefined,
      })),
    };

    try {
      await updateRecepcion({ id: recepcion.id, payload });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al actualizar recepción:', err);
      const detail = err?.response?.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
          : err?.message || 'Error al actualizar la recepción en el servidor.';
      setErrorMessage(message);
    }
  };

  const totalUnidades = items.reduce((acc, it) => acc + (Number(it.cantidad_recibida) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-400">
              <FileEdit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold tracking-tight">
                  Editar Recepción: {recepcion.numero_recepcion}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  MODO ADMINISTRADOR
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Corrección de almacén asignado, cantidades recibidas y reconciliación automática de inventario
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Error en la actualización:</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Aviso especial de reconciliación por cambio de almacén */}
          {haCambiadoAlmacen && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-amber-900">
              <ArrowRightLeft className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold">Reasignación de Almacén Detectada:</p>
                <p className="mt-0.5">
                  El almacén cambiará de <strong>{almacenOriginal?.nombre} [{almacenOriginal?.tipo}]</strong> a{' '}
                  <strong>{almacenSeleccionado?.nombre} [{almacenSeleccionado?.tipo}]</strong>.
                  El sistema transferirá automáticamente el stock físico correspondiente al nuevo almacén y registrará los movimientos de ajuste y auditoría.
                </p>
              </div>
            </div>
          )}

          {/* Sección 1: Datos Generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Número de Recepción */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nº de Recepción / Albarán *
              </label>
              <input
                type="text"
                value={numeroRecepcion}
                onChange={(e) => setNumeroRecepcion(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 font-mono font-bold text-slate-800 focus:bg-white focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Almacén Destino con Alerta de Tipo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Warehouse className="w-3.5 h-3.5 text-amber-600" />
                <span>Almacén de Destino *</span>
              </label>
              <select
                value={idAlmacen}
                onChange={(e) => setIdAlmacen(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-amber-50/40 text-slate-800 font-semibold focus:bg-white focus:ring-amber-500 focus:border-amber-500"
              >
                {almacenes.map((alm) => (
                  <option key={alm.id} value={alm.id}>
                    {alm.nombre} — [{alm.tipo}]
                  </option>
                ))}
              </select>
              {almacenSeleccionado && (
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Tipo: <strong className="text-amber-700">{almacenSeleccionado.tipo}</strong> | Ubicación: {almacenSeleccionado.ubicacion}
                </span>
              )}
            </div>

            {/* Empleado Receptor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Funcionario Receptor *</span>
              </label>
              <select
                value={idEmpleado}
                onChange={(e) => setIdEmpleado(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-800 focus:bg-white focus:ring-amber-500 focus:border-amber-500"
              >
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre} {emp.apellido} ({emp.cargo})
                  </option>
                ))}
              </select>
            </div>

            {/* Orden de Compra */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ID Orden de Compra (Opcional)
              </label>
              <input
                type="number"
                value={idOrdenCompra}
                onChange={(e) => setIdOrdenCompra(e.target.value)}
                placeholder="Ej. 101 (opcional)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-800 focus:bg-white focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estado de la Recepción *
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-800 font-semibold focus:bg-white focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="COMPLETADA">COMPLETADA (Impacta Inventario)</option>
                <option value="BORRADOR">BORRADOR</option>
                <option value="ANULADA">ANULADA</option>
              </select>
            </div>

            {/* Resumen Unidades */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Unidades en Recepción
              </span>
              <span className="text-xl font-extrabold text-slate-900 mt-0.5">
                {totalUnidades} unidades
              </span>
              <span className="text-[10px] text-slate-400">
                Distribuidas en {items.length} producto(s)
              </span>
            </div>
          </div>

          {/* Sección 2: Detalle de Productos Recibidos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2">
                <Boxes className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Productos y Cantidades
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Producto</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Producto</th>
                    <th className="px-3 py-2.5 w-28 text-center">Cantidad</th>
                    <th className="px-3 py-2.5 w-36">Condición</th>
                    <th className="px-3 py-2.5">Notas del Producto</th>
                    <th className="px-3 py-2.5 w-12 text-center">Quitar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => {
                    const prodSeleccionado = productos.find((p) => p.id === item.id_producto);
                    const prodAlmMatch =
                      prodSeleccionado &&
                      almacenSeleccionado &&
                      prodSeleccionado.id_almacen_predeterminado &&
                      prodSeleccionado.id_almacen_predeterminado !== almacenSeleccionado.id;

                    return (
                      <tr key={index} className="hover:bg-slate-50/50">
                        {/* Selector Producto */}
                        <td className="px-3 py-2.5">
                          <select
                            value={item.id_producto}
                            onChange={(e) =>
                              handleItemChange(index, 'id_producto', Number(e.target.value))
                            }
                            className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-medium focus:ring-amber-500 focus:border-amber-500"
                          >
                            {productos.map((prod) => (
                              <option key={prod.id} value={prod.id}>
                                [{prod.codigo}] {prod.nombre} ({prod.categoria?.nombre || 'General'})
                              </option>
                            ))}
                          </select>
                          {prodAlmMatch && (
                            <span className="text-[10px] text-amber-700 flex items-center mt-1">
                              <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
                              Almacén sugerido para este producto:{' '}
                              {prodSeleccionado?.almacen_predeterminado?.nombre || 'Otro'}
                            </span>
                          )}
                        </td>

                        {/* Cantidad */}
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.cantidad_recibida}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'cantidad_recibida',
                                Math.max(1, parseInt(e.target.value) || 1)
                              )
                            }
                            required
                            className="w-20 px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-center font-bold text-slate-900 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </td>

                        {/* Condición */}
                        <td className="px-3 py-2.5">
                          <select
                            value={item.estado_producto}
                            onChange={(e) =>
                              handleItemChange(index, 'estado_producto', e.target.value)
                            }
                            className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-medium focus:ring-amber-500 focus:border-amber-500"
                          >
                            <option value="CONFORME">Conforme</option>
                            <option value="DANADO">Dañado</option>
                            <option value="INCOMPLETO">Incompleto</option>
                          </select>
                        </td>

                        {/* Observaciones */}
                        <td className="px-3 py-2.5">
                          <input
                            type="text"
                            value={item.observaciones}
                            onChange={(e) =>
                              handleItemChange(index, 'observaciones', e.target.value)
                            }
                            placeholder="Detalle o lote..."
                            className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </td>

                        {/* Quitar */}
                        <td className="px-3 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            disabled={items.length <= 1}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-30 disabled:hover:text-slate-400"
                            title={items.length <= 1 ? 'Mínimo 1 producto' : 'Eliminar fila'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sección 3: Observaciones Generales */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Observaciones Generales de la Corrección
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Describa el motivo de la modificación o corrección de almacén..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-800 focus:bg-white focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Pie de Acciones */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reconciliando Inventario...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
