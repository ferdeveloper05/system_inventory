import React, { useState } from 'react';
import { useUsuarios } from '../hooks/useUsuarios';
import { Building2, Shield, Plus, Check } from 'lucide-react';

export const DepartamentosRolesSection: React.FC = () => {
  const {
    departamentos,
    roles,
    createDepartamento,
    isCreatingDepartamento,
    createRol,
    isCreatingRol,
  } = useUsuarios();

  // Estados para nuevo departamento
  const [depNombre, setDepNombre] = useState('');
  const [depDesc, setDepDesc] = useState('');
  const [depMsg, setDepMsg] = useState<string | null>(null);

  // Estados para nuevo rol
  const [rolNombre, setRolNombre] = useState('');
  const [rolDesc, setRolDesc] = useState('');
  const [rolMsg, setRolMsg] = useState<string | null>(null);

  const handleCreateDep = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepMsg(null);
    try {
      await createDepartamento({ nombre: depNombre, descripcion: depDesc, activo: true });
      setDepNombre('');
      setDepDesc('');
      setDepMsg('Departamento creado con éxito');
      setTimeout(() => setDepMsg(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al crear departamento');
    }
  };

  const handleCreateRol = async (e: React.FormEvent) => {
    e.preventDefault();
    setRolMsg(null);
    try {
      await createRol({ nombre: rolNombre.toUpperCase(), descripcion: rolDesc, activo: true });
      setRolNombre('');
      setRolDesc('');
      setRolMsg('Rol creado con éxito');
      setTimeout(() => setRolMsg(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al crear rol');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Departamentos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">Departamentos</h3>
            <p className="text-xs text-slate-500">Estructura organizativa de la entidad</p>
          </div>
        </div>

        {/* Lista */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {departamentos.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{d.nombre}</p>
                {d.descripcion && <p className="text-xs text-slate-500 mt-0.5">{d.descripcion}</p>}
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                Activo
              </span>
            </div>
          ))}
        </div>

        {/* Formulario rápido */}
        <form onSubmit={handleCreateDep} className="pt-3 border-t border-slate-100 space-y-3">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Agregar Departamento
          </p>
          {depMsg && (
            <div className="p-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>{depMsg}</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              required
              placeholder="Nombre del departamento"
              value={depNombre}
              onChange={(e) => setDepNombre(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Descripción breve (opcional)"
              value={depDesc}
              onChange={(e) => setDepDesc(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isCreatingDepartamento}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isCreatingDepartamento ? 'Guardando...' : 'Crear Departamento'}</span>
          </button>
        </form>
      </div>

      {/* Roles */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">Roles de Acceso</h3>
            <p className="text-xs text-slate-500">Perfiles de permisos para usuarios</p>
          </div>
        </div>

        {/* Lista */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {roles.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800 font-mono">{r.nombre}</p>
                {r.descripcion && <p className="text-xs text-slate-500 mt-0.5">{r.descripcion}</p>}
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-medium">
                ID #{r.id}
              </span>
            </div>
          ))}
        </div>

        {/* Formulario rápido */}
        <form onSubmit={handleCreateRol} className="pt-3 border-t border-slate-100 space-y-3">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Agregar Nuevo Rol
          </p>
          {rolMsg && (
            <div className="p-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>{rolMsg}</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              required
              placeholder="Nombre del rol (ej. AUDITOR)"
              value={rolNombre}
              onChange={(e) => setRolNombre(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Descripción de alcance"
              value={rolDesc}
              onChange={(e) => setRolDesc(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isCreatingRol}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isCreatingRol ? 'Guardando...' : 'Crear Rol'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

