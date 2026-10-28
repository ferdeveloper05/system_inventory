import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  Warehouse, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ClipboardList,
  Users,
  Building2,
  ShieldCheck
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inventario', href: '/inventario', icon: Boxes },
  { name: 'Almacenes', href: '/almacenes', icon: Warehouse },
  { name: 'Recepciones', href: '/recepciones', icon: ArrowDownToLine },
  { name: 'Solicitudes', href: '/solicitudes', icon: ArrowUpFromLine },
  { name: 'Usuarios', href: '/usuarios', icon: Users },
  { name: 'Departamentos', href: '/departamentos', icon: Building2 },
  { name: 'Control de Acceso', href: '/control-acceso', icon: ShieldCheck },
  { name: 'Auditoría', href: '/auditoria', icon: ClipboardList },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            TI
          </div>
          <span className="font-semibold text-white tracking-wide text-sm">Infra Inventory</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3 shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p>Infraestructura v1.0.0</p>
        <p>Trazabilidad Segura</p>
      </div>
    </aside>
  );
};

