import React from 'react';
import { RecepcionStats } from '../types';
import {
  ArrowDownToLine,
  Boxes,
  CheckCircle2,
  XCircle,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';

interface RecepcionesStatsProps {
  stats?: RecepcionStats;
  isLoading?: boolean;
}

export const RecepcionesStats: React.FC<RecepcionesStatsProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      title: 'Total Recepciones',
      value: stats?.total_recepciones ?? 0,
      sublabel: 'Ingresos históricos',
      icon: ArrowDownToLine,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Unidades Ingresadas',
      value: stats?.total_items_recibidos ?? 0,
      sublabel: 'Stock total recibido',
      icon: Boxes,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      title: 'Recepciones Conformes',
      value: stats?.total_completadas ?? 0,
      sublabel: 'Ingresos completados',
      icon: CheckCircle2,
      color: 'bg-teal-500',
      lightColor: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      title: 'Recepciones Anuladas',
      value: stats?.total_anuladas ?? 0,
      sublabel: 'Reversiones de inventario',
      icon: XCircle,
      color: 'bg-rose-500',
      lightColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      title: 'Actividad Hoy',
      value: stats?.recepciones_hoy ?? 0,
      sublabel: 'Entradas registradas hoy',
      icon: CalendarDays,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.color} text-white shadow-2xs`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {isLoading ? (
                  <span className="inline-block w-12 h-6 bg-slate-200 rounded animate-pulse" />
                ) : (
                  card.value.toLocaleString()
                )}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                {card.sublabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

