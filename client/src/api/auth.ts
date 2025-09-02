import api from './http';
import { AuthResponse, LoginData, RegisterData, GoogleAuthData, User } from '../types/catalog';

export const authApi = {
  // Login tradicional
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  // Registro
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  // Google Auth
  googleAuth: async (data: GoogleAuthData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/google', data);
    return response.data;
  },

  // Obtener usuario actual
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },

  // Actualizar usuario
  updateUser: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/api/auth/me', data);
    return response.data;
  }
};
