import React, { useState } from 'react';
import { useSolicitudes } from '../features/solicitudes/hooks/useSolicitudes';
import { Solicitud } from '../features/solicitudes/types';
import { SolicitudesStats } from '../features/solicitudes/components/SolicitudesStats';
import { SolicitudesList } from '../features/solicitudes/components/SolicitudesList';
import { CreateSolicitudModal } from '../features/solicitudes/components/CreateSolicitudModal';
import { SolicitudDetailModal } from '../features/solicitudes/components/SolicitudDetailModal';
import { DespachoModal } from '../features/solicitudes/components/DespachoModal';
import { ConformidadModal } from '../features/solicitudes/components/ConformidadModal';
import {
  useAuthStore,
  isUserAdmin,
  isUserDirector,
  isUserAnalista,
  isUserInfraestructura,
} from '../store/authStore';
import {
  FileText,
  ShieldCheck,
  Building2,
  User,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCw,
} from 'lucide-react';

export const SolicitudesPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = isUserAdmin(user);
  const isDirector = isUserDirector(user);
  const isAnalista = isUserAnalista(user);
  const isInfra = isUserInfraestructura(user);

  // Filtros de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('ALL');
  const [selectedDepartamento, setSelectedDepartamento] = useState('ALL');

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [despachoTarget, setDespachoTarget] = useState<Solicitud | null>(null);
  const [conformidadTarget, setConformidadTarget] = useState<Solicitud | null>(null);

  // Hook con filtros aplicados
  const {
    solicitudes,
    stats,
    departamentos,
    isLoading,
    isLoadingStats,
    refetch,
    aprobarDirector,
    aceptarInfraestructura,
    deleteSolicitud,
    isAprobando,
    isAceptando,
    isDeleting,
  } = useSolicitudes({
    search: searchTerm || undefined,
    estado: selectedEstado === 'ALL' ? undefined : selectedEstado,
    id_departamento: selectedDepartamento === 'ALL' ? undefined : Number(selectedDepartamento),
  });

  // Handler para Aprobar como Director Solicitante
  const handleAprobarDirector = async (solicitud: Solicitud) => {
    const confirmacion = window.confirm(
      `¿Confirmas la aprobación formal de la solicitud ${solicitud.numero_solicitud}?\n\nAl aprobarla, se enviará formalmente a Infraestructura en estado "Abierto".`
    );
    if (!confirmacion) return;

    try {
      const solId = solicitud.id ?? (solicitud as any).id_solicitud;
      await aprobarDirector(solId);
      refetch();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          'Error al aprobar la solicitud como Director'
      );
    }
  };

  // Handler para Aceptar como Director de Infraestructura
  const handleAceptarInfraestructura = async (solicitud: Solicitud) => {
    const confirmacion = window.confirm(
      `¿Confirmas la aceptación de la solicitud ${solicitud.numero_solicitud} para su atención en Infraestructura?\n\nPasará al estado "En Proceso" para su posterior preparación y despacho.`
    );
    if (!confirmacion) return;

    try {
      const solId = solicitud.id ?? (solicitud as any).id_solicitud;
      await aceptarInfraestructura(solId);
      refetch();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          'Error al aceptar la solicitud en Infraestructura'
      );
    }
  };

  // Handler para Eliminar Solicitud
  const handleDeleteSolicitud = async (solicitud: Solicitud) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente la solicitud ${solicitud.numero_solicitud}?\n\nEsta acción revertirá los registros asociados.`
    );
    if (!confirmacion) return;

    try {
      const solId = solicitud.id ?? (solicitud as any).id_solicitud;
      await deleteSolicitud(solId);
      refetch();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          'Error al eliminar la solicitud'
      );
    }
  };

  // Etiqueta de contexto de rol para el usuario
  const renderUserRoleBanner = () => {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span>{user?.nombre_completo || user?.username}</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-1 text-slate-600">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span>{user?.departamento_nombre || 'Sin Dpto. Asignado'}</span>
        </div>
        <span className="text-slate-300">|</span>
        {isAdmin ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 text-[11px] border border-amber-300">
            <ShieldCheck className="w-3 h-3 text-amber-700" />
            ADMINISTRADOR (Acceso Total)
          </span>
        ) : isInfra ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-800 text-[11px] border border-indigo-200">
            <Truck className="w-3 h-3 text-indigo-600" />
            INFRAESTRUCTURA ({user?.rol_nombre})
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 text-[11px] border border-slate-200">
            {user?.rol_nombre || 'Analista'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Solicitudes & Despacho
            </h2>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              Flujo Oficial
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Gestión integral de requerimientos de materiales: Aprobación departamental, Aceptación por Infraestructura, Despacho desde almacenes y Conformidad con evidencia fotográfica.
          </p>
        </div>

        {/* Banner de contexto del usuario */}
        {renderUserRoleBanner()}
      </div>

      {/* Tarjetas de Métricas KPI */}
      <SolicitudesStats stats={stats} isLoading={isLoadingStats} />

      {/* Lista de Solicitudes con Filtros y Acciones */}
      <SolicitudesList
        solicitudes={solicitudes}
        departamentos={departamentos}
        isLoading={isLoading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedEstado={selectedEstado}
        setSelectedEstado={setSelectedEstado}
        selectedDepartamento={selectedDepartamento}
        setSelectedDepartamento={setSelectedDepartamento}
        onRefresh={refetch}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenDetail={(sol) => setSelectedSolicitud(sol)}
        onOpenDespachar={(sol) => setDespachoTarget(sol)}
        onOpenCerrar={(sol) => setConformidadTarget(sol)}
        onAprobarDirector={handleAprobarDirector}
        onAceptarInfraestructura={handleAceptarInfraestructura}
        onDelete={handleDeleteSolicitud}
        isActionLoading={isAprobando || isAceptando || isDeleting}
      />

      {/* Modal: Nueva Solicitud */}
      <CreateSolicitudModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          refetch();
          setIsCreateOpen(false);
        }}
      />

      {/* Modal: Detalle y Bitácora Visual */}
      <SolicitudDetailModal
        solicitud={selectedSolicitud}
        isOpen={!!selectedSolicitud}
        onClose={() => setSelectedSolicitud(null)}
        onOpenDespachar={(sol) => {
          setSelectedSolicitud(null);
          setDespachoTarget(sol);
        }}
        onOpenCerrar={(sol) => {
          setSelectedSolicitud(null);
          setConformidadTarget(sol);
        }}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Modal: Despacho y Descuento de Stock con Evidencia */}
      <DespachoModal
        solicitud={despachoTarget}
        isOpen={!!despachoTarget}
        onClose={() => setDespachoTarget(null)}
        onSuccess={() => {
          refetch();
          setDespachoTarget(null);
        }}
      />

      {/* Modal: Conformidad de Entrega con Evidencia Fotográfica y Cierre */}
      <ConformidadModal
        solicitud={conformidadTarget}
        isOpen={!!conformidadTarget}
        onClose={() => setConformidadTarget(null)}
        onSuccess={() => {
          refetch();
          setConformidadTarget(null);
        }}
      />
    </div>
  );
};
