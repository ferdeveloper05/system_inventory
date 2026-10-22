import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Lock, Briefcase, Phone, UserCheck } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    username: '',
    telefono: '',
    cargo: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { register, isRegistering } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validaciones del cliente
    if (formData.password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    try {
      await register({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        username: formData.username,
        telefono: formData.telefono || undefined,
        cargo: formData.cargo || 'Especialista de Infraestructura',
        password: formData.password,
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Ocurrió un error al registrar el usuario.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nombre *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Juan"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Apellido *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <UserCheck className="h-4 w-4" />
            </div>
            <input
              type="text"
              name="apellido"
              required
              value={formData.apellido}
              onChange={handleChange}
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Pérez"
            />
          </div>
        </div>
      </div>

      {/* Correo y Usuario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Correo Institucional *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="juan.perez@organizacion.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nombre de Usuario *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="jperez"
            />
          </div>
        </div>
      </div>

      {/* Cargo y Teléfono */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Cargo / Rol en Infraestructura
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Briefcase className="h-4 w-4" />
            </div>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Especialista de Redes / Almacén"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Teléfono de Contacto
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="h-4 w-4" />
            </div>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="+54 9 11 1234-5678"
            />
          </div>
        </div>
      </div>

      {/* Contraseña y Confirmación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Contraseña *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Confirmar Contraseña *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isRegistering}
        className="w-full mt-4 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
      >
        {isRegistering ? 'Creando cuenta...' : 'Crear Cuenta'}
      </button>

      {/* Acceso directo a Login */}
      <div className="text-center pt-3 border-t border-slate-200 mt-4">
        <p className="text-xs text-slate-600">
          ¿Ya tienes una cuenta de acceso?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </form>
  );
};

