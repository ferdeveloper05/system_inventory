import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../../../store/authStore';
import { LoginCredentials, RegisterData } from '../types';

export const useAuth = () => {
  const navigate = useNavigate();
  const { setAuth, logout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const authData = await authApi.login(credentials);
      // Guardar token temporalmente en store para que authApi.getCurrentUser pueda adjuntarlo
      useAuthStore.setState({ token: authData.access_token });
      const user = await authApi.getCurrentUser();
      return { token: authData.access_token, user };
    },
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      navigate('/', { replace: true });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      await authApi.register(data);
      // Auto-login tras registro exitoso
      const authData = await authApi.login({ username: data.username, password: data.password });
      useAuthStore.setState({ token: authData.access_token });
      const user = await authApi.getCurrentUser();
      return { token: authData.access_token, user };
    },
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      navigate('/', { replace: true });
    },
  });

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    isRegistering: registerMutation.isPending,
    error: loginMutation.error || registerMutation.error,
    logout,
  };
};

