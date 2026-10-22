import { create } from 'zustand';

export interface User {
  id: number;
  username: string;
  email: string;
  activo: boolean;
  is_superuser: boolean;
  id_rol: number;
  rol_nombre?: string;
  id_empleado?: number;
  nombre_completo?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const TOKEN_KEY = 'inventory_auth_token';
const USER_KEY = 'inventory_auth_user';

export const useAuthStore = create<AuthState>((set) => {
  // Inicializar estado desde localStorage si existe
  const initialToken = localStorage.getItem(TOKEN_KEY);
  const storedUser = localStorage.getItem(USER_KEY);
  const initialUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  return {
    token: initialToken,
    user: initialUser,
    isAuthenticated: !!initialToken,

    setAuth: (token: string, user: User) => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({
        token,
        user,
        isAuthenticated: true,
      });
    },

    setUser: (user: User) => {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user });
    },

    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
      });
    },
  };
});
