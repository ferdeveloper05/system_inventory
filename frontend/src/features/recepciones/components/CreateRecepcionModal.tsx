import React, { useState, useEffect } from 'react';
import { useRecepciones } from '../hooks/useRecepciones';
import { AlmacenRef, EmpleadoRef, ProductoSimple } from '../types';
import {
  X,
  Plus,
  Trash2,
  Boxes,
  Warehouse,
  UserCheck,
  Package,
  Barcode,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  FileCheck2,
} from 'lucide-react';

interface CreateRecepcionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAlmacenId?: number;
  defaultProductoId?: number;
}

interface ItemRow {
  id_producto: number;
  cantidad_recibida: number;
  estado_producto: string;
  observaciones: string;
}

export const CreateRecepcionModal: React.FC<CreateRecepcionModalProps> = ({
  isOpen,
  onClose,
  defaultAlmacenId,
  defaultProductoId,
}) => {
  const { almacenes, productos, empleados, createRecepcion, isCreating } = useRecepciones();

  // Generador de número de recepción inicial
  const generateNumeroRecepcion = () => {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `REC-${yyyy}${mm}${dd}-${rand}`;
  };

  const [numeroRecepcion, setNumeroRecepcion] = useState(generateNumeroRecepcion());
  const [idAlmacen, setIdAlmacen] = useState<number>(0);
  const [idEmpleado, setIdEmpleado] = useState<number>(0);
  const [idOrdenCompra, setIdOrdenCompra] = useState<string>('');
  const [estado, setEstado] = useState<string>('COMPLETADA');
  const [observaciones, setObservaciones] = useState<string>('');

  const [items, setItems] = useState<ItemRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inicializar valores al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setNumeroRecepcion(generateNumeroRecepcion());
      setErrorMessage(null);
      setObservaciones('');
      setIdOrdenCompra('');
      setEstado('COMPLETADA');

      // Almacén por defecto
      if (defaultAlmacenId) {
        setIdAlmacen(defaultAlmacenId);
      } else if (almacenes.length > 0 && idAlmacen === 0) {
        setIdAlmacen(almacenes[0].id);
      }

      // Empleado por defecto
      if (empleados.length > 0 && idEmpleado === 0) {
        setIdEmpleado(empleados[0].id);
      }

      // Ítem inicial por defecto
      const initialProdId = defaultProductoId
        ? defaultProductoId
        : productos.length > 0
        ? productos[0].id
        : 0;

      if (initialProdId > 0) {
        setItems([
          {
            id_producto: initialProdId,
            cantidad_recibida: 10,
            estado_producto: 'CONFORME',
            observaciones: 'Llegada en buen estado',
          },
        ]);
      } else {
        setItems([]);
      }
    }
  }, [isOpen, almacenes, empleados, productos, defaultAlmacenId, defaultProductoId]);

  if (!isOpen) return null;

  const almacenSeleccionado = almacenes.find((a) => a.id === idAlmacen);
  const empleadoSeleccionado = empleados.find((e) => e.id === idEmpleado);

  const handleAddItem = () => {
    // Sugerir un producto que no esté aún en la lista, o el primero disponible
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
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof ItemRow, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const totalUnidades = items.reduce((acc, it) => acc + (Number(it.cantidad_recibida) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!idAlmacen) {
      setErrorMessage('Por favor seleccione un almacén de destino.');
      return;
    }

    if (!idEmpleado) {
      setErrorMessage('Por favor seleccione el empleado responsable que recibe la mercancía.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Debe añadir al menos un producto a la recepción.');
      return;
    }

    // Validar cantidades
    for (const it of items) {
      if (!it.id_producto) {
        setErrorMessage('Todos los ítems deben tener un producto seleccionado.');
        return;
      }
      if (Number(it.cantidad_recibida) <= 0) {
        setErrorMessage('La cantidad recibida de cada producto debe ser mayor a 0.');
        return;
      }
    }

    try {
      await createRecepcion({
        numero_recepcion: numeroRecepcion.trim().toUpperCase(),
        id_almacen: Number(idAlmacen),
        id_empleado_recibe: Number(idEmpleado),
        id_orden_compra: idOrdenCompra.trim() ? Number(idOrdenCompra) : undefined,
        estado: estado,
        observaciones: observaciones.trim() || undefined,
        detalles: items.map((it) => ({
          id_producto: Number(it.id_producto),
          cantidad_recibida: Number(it.cantidad_recibida),
          estado_producto: it.estado_producto || 'CONFORME',
          observaciones: it.observaciones.trim() || undefined,
        })),
      });

      onClose();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          err?.message ||
          'Error al registrar la recepción de mercancía.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Registrar Nueva Recepción de Mercancía
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ingreso físico a almacén, inspección técnica e incremento inmediato de stock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Datos Principales de la Recepción */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Datos del Albarán y Destino</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Número de Recepción */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <Barcode className="w-3.5 h-3.5 text-slate-500" />
                  <span>Nº de Recepción / Albarán *</span>
                </label>
                <input
                  type="text"
                  required
                  value={numeroRecepcion}
                  onChange={(e) => setNumeroRecepcion(e.target.value.toUpperCase())}
                  placeholder="REC-20261031-0001"
                  className="block w-full px-3 py-2 text-sm uppercase font-mono font-bold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
                />
              </div>

              {/* Almacén de Destino */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Almacén de Destino *</span>
                  </span>
                  {almacenSeleccionado && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                      {almacenSeleccionado.tipo}
                    </span>
                  )}
                </label>
                <select
                  required
                  value={idAlmacen}
                  onChange={(e) => setIdAlmacen(Number(e.target.value))}
                  className="block w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
                >
                  <option value="">-- Seleccionar almacén --</option>
                  {almacenes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} [{a.tipo}] - {a.codigo}
                    </option>
                  ))}
                </select>
                {almacenes.length === 0 && (
                  <p className="mt-1 text-[11px] text-amber-700">
                    No hay almacenes disponibles. Por favor cree un almacén primero.
                  </p>
                )}
              </div>

              {/* Empleado Receptor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Funcionario que Recibe *</span>
                </label>
                <select
                  required
                  value={idEmpleado}
                  onChange={(e) => setIdEmpleado(Number(e.target.value))}
                  className="block w-full px-3 py-2 text-sm border border-indigo-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
                >
                  <option value="">-- Seleccionar funcionario --</option>
                  {empleados.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} {emp.apellido} ({emp.cargo})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Orden de Compra */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nº Orden de Compra (Opcional)
                </label>
                <input
                  type="number"
                  value={idOrdenCompra}
                  onChange={(e) => setIdOrdenCompra(e.target.value)}
                  placeholder="Ej: 1045 (dejar vacío si es ingreso directo)"
                  className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Estado Inicial de la Recepción
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="COMPLETADA">COMPLETADA (Incrementar stock de inmediato)</option>
                  <option value="BORRADOR">BORRADOR (No afecta existencias aún)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Tabla Dinámica de Productos a Recibir */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>Detalle de Artículos y Materiales a Ingresar</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Agregue cada producto recibido con su cantidad e inspección técnica.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Producto</span>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                <Boxes className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">
                  No hay productos agregados a esta recepción.
                </p>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors inline-flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Agregar primer producto
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">Producto del Catálogo *</th>
                      <th className="px-3 py-2.5 w-28 text-center">Cantidad *</th>
                      <th className="px-3 py-2.5 w-36">Estado Físico</th>
                      <th className="px-3 py-2.5">Notas / Lote</th>
                      <th className="px-3 py-2.5 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((row, idx) => {
                      const prodSel = productos.find((p) => p.id === row.id_producto);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          {/* Selector de Producto */}
                          <td className="px-3 py-2.5">
                            <select
                              required
                              value={row.id_producto}
                              onChange={(e) =>
                                handleItemChange(idx, 'id_producto', Number(e.target.value))
                              }
                              className="block w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                              {productos.map((prod) => (
                                <option key={prod.id} value={prod.id}>
                                  {prod.nombre} [{prod.codigo}] - {prod.categoria?.nombre || 'General'}
                                </option>
                              ))}
                            </select>
                            {prodSel && (
                              <div className="mt-1 flex items-center space-x-2 text-[10px] text-slate-400">
                                <span>Unidad: {prodSel.unidad_medida}</span>
                                <span>•</span>
                                <span>SKU: {prodSel.codigo}</span>
                              </div>
                            )}
                          </td>

                          {/* Cantidad */}
                          <td className="px-3 py-2.5">
                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                required
                                value={row.cantidad_recibida}
                                onChange={(e) =>
                                  handleItemChange(
                                    idx,
                                    'cantidad_recibida',
                                    Math.max(1, Number(e.target.value))
                                  )
                                }
                                className="block w-full text-center px-2 py-1.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                          </td>

                          {/* Estado de inspección */}
                          <td className="px-3 py-2.5">
                            <select
                              value={row.estado_producto}
                              onChange={(e) =>
                                handleItemChange(idx, 'estado_producto', e.target.value)
                              }
                              className={`block w-full px-2 py-1.5 text-xs font-semibold rounded-lg border ${
                                row.estado_producto === 'CONFORME'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : row.estado_producto === 'DANADO'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
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
                              value={row.observaciones}
                              onChange={(e) =>
                                handleItemChange(idx, 'observaciones', e.target.value)
                              }
                              placeholder="Ej: Caja sellada, lote #2405"
                              className="block w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </td>

                          {/* Eliminar */}
                          <td className="px-3 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Eliminar ítem"
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
            )}

            {/* Resumen de totales */}
            {items.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Total de artículos a recibir:{' '}
                    <strong>{items.length} productos distintos</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-950">
                    {totalUnidades} unidades en total
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Observaciones Generales */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones Generales de la Entrega / Transporte
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Entregado por Transportes Express, chofer Juan Pérez, placa ABC-123. Guía de remisión nº 45892."
              className="block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Nota de impacto de infraestructura */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Trazabilidad Automática:</strong> Al confirmar, el stock del almacén{' '}
              <strong>{almacenSeleccionado?.nombre || 'seleccionado'}</strong> se incrementará
              inmediatamente, se generará el movimiento de entrada en el <strong>Kardex</strong> y se
              asentará el evento en la bitácora de auditoría.
            </span>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating || items.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando Ingreso...</span>
                </>
              ) : (
                <>
                  <Boxes className="w-4 h-4" />
                  <span>Registrar Recepción e Incrementar Stock</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

