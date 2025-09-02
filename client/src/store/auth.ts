import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserDto, AuthResponseDto } from '../types/auth';
import { authApi } from '../api/auth';

interface AuthStore {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, phone?: string) => Promise<void>;
  googleAuth: (idToken: string, email: string, firstName: string, lastName: string, picture?: string) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  updateUser: (data: Partial<UserDto>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => {
      console.log('Initializing auth store...');
      
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            const response: AuthResponseDto = await authApi.login({ email, password });
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error: any) {
            set({
              error: error.response?.data?.message || 'Error al iniciar sesión',
              isLoading: false
            });
            throw error;
          }
        },

        register: async (email: string, password: string, firstName: string, lastName: string, phone?: string) => {
          set({ isLoading: true, error: null });
          try {
            const response: AuthResponseDto = await authApi.register({ email, password, firstName, lastName, phone });
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error: any) {
            set({
              error: error.response?.data?.message || 'Error al registrarse',
              isLoading: false
            });
            throw error;
          }
        },

        googleAuth: async (idToken: string, email: string, firstName: string, lastName: string, picture?: string) => {
          set({ isLoading: true, error: null });
          try {
            const response: AuthResponseDto = await authApi.googleAuth({ idToken, email, firstName, lastName, picture });
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error: any) {
            set({
              error: error.response?.data?.message || 'Error con Google Auth',
              isLoading: false
            });
            throw error;
          }
        },

        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null
          });
        },

        getCurrentUser: async () => {
          const { token } = get();
          console.log('getCurrentUser called, token:', token);
          
          if (!token) {
            console.log('No token found, setting loading to false');
            set({ isLoading: false });
            return;
          }

          set({ isLoading: true, error: null });
          try {
            console.log('Fetching current user...');
            const user = await authApi.getCurrentUser();
            console.log('User fetched successfully:', user);
            set({
              user,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error: any) {
            console.log('Error getting current user:', error);
            // No mostrar error al usuario, solo limpiar el estado
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        },

        updateUser: async (data: Partial<UserDto>) => {
          set({ isLoading: true, error: null });
          try {
            const user = await authApi.updateUser(data);
            set({
              user,
              isLoading: false
            });
          } catch (error: any) {
            set({
              error: error.response?.data?.message || 'Error al actualizar usuario',
              isLoading: false
            });
            throw error;
          }
        },

        clearError: () => {
          set({ error: null });
        }
      };
    },
    {
      name: 'auth-storage',
      partialize: (state: any) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);
