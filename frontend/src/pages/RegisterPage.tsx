import React from 'react';
import { RegisterForm } from '../features/auth/components/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg">
          TI
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
          Registro de Nuevo Usuario
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Crea tu cuenta para acceder a la gestión de inventarios y trazabilidad
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-xl sm:px-10 border border-slate-100">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

