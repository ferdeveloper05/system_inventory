import React from 'react';
import { SolicitudStats } from '../types';
import {
  FileText,
  Clock,
  RotateCw,
  Truck,
  CheckCircle2,
} from 'lucide-react';

interface SolicitudesStatsProps {
  stats?: SolicitudStats;
  isLoading?: boolean;
}

export const SolicitudesStats: React.FC<SolicitudesStatsProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      title: 'Total Solicitudes',
      value: stats?.total_solicitudes ?? 0,
      sublabel: 'Requerimientos registrados',
      icon: FileText,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      title: 'Abiertas',
      value: stats?.total_abiertas ?? 0,
      sublabel: stats
        ? `${stats.total_pendientes_aprobacion_director} por aprobar, ${stats.total_listas_para_infraestructura} listas`
        : 'Pendientes de inicio',
      icon: Clock,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'En Proceso',
      value: stats?.total_en_proceso ?? 0,
      sublabel: 'Aceptadas / En recolección',
      icon: RotateCw,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Entrega en Camino',
      value: stats?.total_entrega_en_camino ?? 0,
      sublabel: 'Despachadas con comprobante',
      icon: Truck,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Cerradas',
      value: stats?.total_cerradas ?? 0,
      sublabel: 'Conformidad acreditada',
      icon: CheckCircle2,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  {card.title}
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {isLoading ? (
                      <span className="inline-block w-8 h-6 bg-slate-100 rounded animate-pulse" />
                    ) : (
                      card.value
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]" title={card.sublabel}>
                  {card.sublabel}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl border shrink-0 ${card.lightColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${card.color}`} />
          </div>
        );
      })}
    </div>
  );
};
