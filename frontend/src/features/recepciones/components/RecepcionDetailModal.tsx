import React from 'react';
import { Recepcion } from '../types';
import {
  X,
  Printer,
  Ban,
  Warehouse,
  UserCheck,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Package,
  FileText,
  Boxes,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecepcionDetailModalProps {
  recepcion: Recepcion | null;
  isOpen: boolean;
  onClose: () => void;
  onAnular: (recepcion: Recepcion) => void;
}

export const RecepcionDetailModal: React.FC<RecepcionDetailModalProps> = ({
  recepcion,
  isOpen,
  onClose,
  onAnular,
}) => {
  if (!isOpen || !recepcion) return null;

  const totalUnidades = recepcion.detalles.reduce(
    (acc, det) => acc + (det.cantidad_recibida || 0),
    0
  );

  const getStatusBadge = (estado: string) => {
    switch (estado.toUpperCase()) {
      case 'COMPLETADA':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            COMPLETADA
          </span>
        );
      case 'ANULADA':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
            ANULADA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
            {estado}
          </span>
        );
    }
  };

  const getCondicionBadge = (condicion?: string) => {
    const estado = (condicion || 'CONFORME').toUpperCase();
    if (estado === 'CONFORME') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
          Conforme
        </span>
      );
    }
    if (estado === 'DANADO' || estado === 'DAÑADO') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 mr-1 text-rose-500" />
          Dañado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
        {condicion}
      </span>
    );
  };

  const handlePrint = () => {
    window.print();
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
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold tracking-tight">
                  Recepción: {recepcion.numero_recepcion}
                </h3>
                {getStatusBadge(recepcion.estado)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprobante oficial de entrada de suministros a infraestructura
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

        {/* Contenido */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Alerta si está anulada */}
          {recepcion.estado === 'ANULADA' && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Esta recepción ha sido ANULADA</p>
                <p className="mt-0.5 text-rose-700">
                  El stock ingresado por esta recepción fue revertido automáticamente del almacén de destino y se registraron los movimientos de salida correspondientes en el Kardex.
                </p>
              </div>
            </div>
          )}

          {/* Tarjetas de Metadatos: Almacén Destino y Responsable */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Almacén */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <Warehouse className="w-4 h-4 text-emerald-600" />
                <span>Almacén de Destino</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {recepcion.almacen?.nombre || `Almacén #${recepcion.id_almacen}`}
              </p>
              {recepcion.almacen?.tipo && (
                <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Tipo: {recepcion.almacen.tipo}
                </span>
              )}
              {recepcion.almacen?.ubicacion && (
                <p className="text-xs text-slate-500 mt-1">
                  {recepcion.almacen.ubicacion}
                </p>
              )}
              <div className="mt-2.5 pt-2 border-t border-slate-200">
                <Link
                  to="/inventario"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                >
                  <span>Ver stock del almacén</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Funcionario Receptor */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Receptor Responsable</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {recepcion.empleado_recibe
                  ? `${recepcion.empleado_recibe.nombre} ${recepcion.empleado_recibe.apellido}`
                  : `Empleado #${recepcion.id_empleado_recibe}`}
              </p>
              {recepcion.empleado_recibe?.cargo && (
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  {recepcion.empleado_recibe.cargo}
                </p>
              )}
              {recepcion.empleado_recibe?.email && (
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {recepcion.empleado_recibe.email}
                </p>
              )}
              {recepcion.empleado_recibe?.departamento && (
                <span className="inline-block mt-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {recepcion.empleado_recibe.departamento.nombre}
                </span>
              )}
            </div>

            {/* Fecha y Órden */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <span>Fecha y Registro</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {new Date(recepcion.fecha_recepcion).toLocaleString('es-ES', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
              <div className="mt-2 text-xs text-slate-600">
                <span className="font-medium text-slate-500">Orden de Compra: </span>
                {recepcion.id_orden_compra ? (
                  <span className="font-semibold text-slate-800">
                    OC #{recepcion.id_orden_compra}
                  </span>
                ) : (
                  <span className="italic text-slate-400">Ingreso directo sin OC</span>
                )}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Registrado: {new Date(recepcion.created_at || recepcion.fecha_recepcion).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Tabla de Productos Recibidos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Productos Recibidos ({recepcion.detalles.length})</span>
              </h4>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                Total Unidades: <strong>{totalUnidades}</strong>
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Producto / Categoría</th>
                    <th className="px-4 py-3 text-center">U.M.</th>
                    <th className="px-4 py-3 text-center">Cant. Recibida</th>
                    <th className="px-4 py-3 text-center">Estado Físico</th>
                    <th className="px-4 py-3">Observaciones de Ítem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recepcion.detalles.map((det, idx) => (
                    <tr key={det.id || idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">
                        {det.producto?.codigo || `PROD-#${det.id_producto}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">
                          {det.producto?.nombre || `Producto ID #${det.id_producto}`}
                        </div>
                        {det.producto?.categoria && (
                          <span className="text-[11px] text-slate-400">
                            {det.producto.categoria.nombre}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-xs text-slate-600">
                        {det.producto?.unidad_medida || 'UNIDAD'}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-900 text-base">
                        {det.cantidad_recibida}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getCondicionBadge(det.estado_producto)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {det.observaciones || <span className="italic text-slate-400">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Observaciones Generales */}
          {recepcion.observaciones && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Observaciones y Notas de Recepción</span>
              </h5>
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                {recepcion.observaciones}
              </p>
            </div>
          )}
        </div>

        {/* Pie de modal */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Imprimir / Exportar</span>
            </button>

            {recepcion.estado !== 'ANULADA' && (
              <button
                onClick={() => onAnular(recepcion)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
              >
                <Ban className="w-3.5 h-3.5 text-rose-600" />
                <span>Anular Recepción</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors shadow-2xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

