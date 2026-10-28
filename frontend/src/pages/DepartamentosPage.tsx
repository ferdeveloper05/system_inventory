import React from 'react';
import { useUsuarios } from '../features/usuarios/hooks/useUsuarios';
import { DepartamentosList } from '../features/departamentos/components/DepartamentosList';
import { Building2, Users, CheckCircle2 } from 'lucide-react';

export const DepartamentosPage: React.FC = () => {
  const { departamentos, empleados, isLoadingDepartamentos } = useUsuarios();

  const totalDept = departamentos.length;
  const activosDept = departamentos.filter((d) => d.activo).length;
  const totalEmps = empleados.length;

  const stats = [
    { name: 'Total Departamentos', value: totalDept, icon: Building2, color: 'bg-blue-600' },
    { name: 'Departamentos Operativos', value: activosDept, icon: CheckCircle2, color: 'bg-emerald-600' },
    { name: 'Personal Distribuido', value: totalEmps, icon: Users, color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Estructura de Departamentos</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configuración de áreas funcionales y asignación organizacional de infraestructura.
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.name}
              className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/80 p-5 flex items-center"
            >
              <div className={`p-3 rounded-lg ${s.color} text-white mr-4 shadow-sm`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 truncate">{s.name}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {isLoadingDepartamentos ? '...' : s.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla y Operaciones */}
      <DepartamentosList />
    </div>
  );
};

