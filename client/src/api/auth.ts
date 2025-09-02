import api from './http';
import { UserDto, AuthResponseDto, LoginDto, RegisterDto, GoogleAuthDto } from '../types/auth';
import { ShippingInfo } from '../components/ShippingInfoForm';

export const authApi = {
  // Login tradicional
  login: async (data: LoginDto): Promise<AuthResponseDto> => {
    const response = await api.post<AuthResponseDto>('/api/auth/login', data);
    return response.data;
  },

  // Registro
  register: async (data: RegisterDto): Promise<AuthResponseDto> => {
    const response = await api.post<AuthResponseDto>('/api/auth/register', data);
    return response.data;
  },

  // Google Auth
  googleAuth: async (data: GoogleAuthDto): Promise<AuthResponseDto> => {
    const response = await api.post<AuthResponseDto>('/api/auth/google', data);
    return response.data;
  },

  // Obtener usuario actual
  getCurrentUser: async (): Promise<UserDto> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Actualizar usuario
  updateUser: async (data: Partial<UserDto>): Promise<UserDto> => {
    const response = await api.put('/api/auth/me', data);
    return response.data;
  },

  // Actualizar datos de envío
  updateShippingInfo: async (shippingInfo: ShippingInfo): Promise<UserDto> => {
    const response = await api.put('/api/auth/shipping-info', shippingInfo);
    return response.data;
  }
};
