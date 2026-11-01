import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecepciones } from '../features/recepciones/hooks/useRecepciones';
import { Recepcion } from '../features/recepciones/types';
import { RecepcionesStats } from '../features/recepciones/components/RecepcionesStats';
import { RecepcionesList } from '../features/recepciones/components/RecepcionesList';
import { CreateRecepcionModal } from '../features/recepciones/components/CreateRecepcionModal';
import { RecepcionDetailModal } from '../features/recepciones/components/RecepcionDetailModal';
import { AnularRecepcionModal } from '../features/recepciones/components/AnularRecepcionModal';

export const RecepcionesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados de modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRecepcion, setSelectedRecepcion] = useState<Recepcion | null>(null);
  const [anularTarget, setAnularTarget] = useState<Recepcion | null>(null);

  // Parámetros preseleccionados pasados por URL (interconexión desde Almacenes o Productos)
  const [defaultAlmacenId, setDefaultAlmacenId] = useState<number | undefined>(undefined);
  const [defaultProductoId, setDefaultProductoId] = useState<number | undefined>(undefined);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlmacen, setSelectedAlmacen] = useState('ALL');
  const [selectedEstado, setSelectedEstado] = useState('ALL');

  const { stats, isLoadingStats, anularRecepcion, isAnulando } = useRecepciones();

  // Detectar parámetros de URL al montar
  useEffect(() => {
    const shouldCreate = searchParams.get('crear');
    const almacenParam = searchParams.get('almacen');
    const productoParam = searchParams.get('producto');

    if (almacenParam) {
      const almId = Number(almacenParam);
      if (!isNaN(almId)) {
        setDefaultAlmacenId(almId);
        setSelectedAlmacen(String(almId));
      }
    }

    if (productoParam) {
      const prodId = Number(productoParam);
      if (!isNaN(prodId)) {
        setDefaultProductoId(prodId);
      }
    }

    if (shouldCreate === 'true') {
      setIsCreateOpen(true);
      // Limpiar query param para evitar reapertura accidental al refrescar
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('crear');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleOpenDetail = (recepcion: Recepcion) => {
    setSelectedRecepcion(recepcion);
  };

  const handleOpenAnular = (recepcion: Recepcion) => {
    setAnularTarget(recepcion);
  };

  const handleConfirmAnular = async (motivo: string) => {
    if (!anularTarget) return;
    await anularRecepcion({ id: anularTarget.id, motivo });
    // Si estaba abierto el detalle de esta misma recepción, actualizar estado local
    if (selectedRecepcion && selectedRecepcion.id === anularTarget.id) {
      setSelectedRecepcion({ ...selectedRecepcion, estado: 'ANULADA' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Entradas & Recepciones de Mercancía
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gestión y registro de aprovisionamiento, inspección de insumos e incremento de inventario en infraestructura.
          </p>
        </div>
      </div>

      {/* Métricas KPI */}
      <RecepcionesStats stats={stats} isLoading={isLoadingStats} />

      {/* Lista con Filtros y Acciones */}
      <RecepcionesList
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenDetail={handleOpenDetail}
        onOpenAnular={handleOpenAnular}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedAlmacen={selectedAlmacen}
        setSelectedAlmacen={setSelectedAlmacen}
        selectedEstado={selectedEstado}
        setSelectedEstado={setSelectedEstado}
      />

      {/* Modal: Crear Recepción */}
      <CreateRecepcionModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setDefaultAlmacenId(undefined);
          setDefaultProductoId(undefined);
        }}
        defaultAlmacenId={defaultAlmacenId}
        defaultProductoId={defaultProductoId}
      />

      {/* Modal: Detalle / Albarán de Recepción */}
      <RecepcionDetailModal
        recepcion={selectedRecepcion}
        isOpen={!!selectedRecepcion}
        onClose={() => setSelectedRecepcion(null)}
        onAnular={(rec) => {
          setSelectedRecepcion(null);
          setAnularTarget(rec);
        }}
      />

      {/* Modal: Confirmación de Anulación */}
      <AnularRecepcionModal
        recepcion={anularTarget}
        isOpen={!!anularTarget}
        isLoading={isAnulando}
        onClose={() => setAnularTarget(null)}
        onConfirm={handleConfirmAnular}
      />
    </div>
  );
};
