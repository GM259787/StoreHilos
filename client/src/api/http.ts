import axios, { AxiosInstance } from 'axios';
import { loadConfig } from '../config/theme';

// Variable para cachear la API instance
let apiInstance: AxiosInstance | null = null;
let initPromise: Promise<AxiosInstance> | null = null;

// Configuración flexible de la API
const getApiBaseUrl = async () => {
  try {
    const config = await loadConfig();
    console.log('Config loaded, API URL:', config.apiUrl);
    return config.apiUrl;
  } catch (error) {
    console.error('Error loading config, using fallback:', error);
    return import.meta.env.VITE_API_URL || 'http://localhost:5175';
  }
};

const initializeApi = async (): Promise<AxiosInstance> => {
  if (apiInstance) {
    return apiInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const baseUrl = await getApiBaseUrl();
    console.log('Initializing API with base URL:', baseUrl);
    
    apiInstance = axios.create({
      baseURL: `${baseUrl}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Interceptor para agregar el token JWT
    apiInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth-storage');
        console.log('HTTP Interceptor - Raw token from localStorage:', token);
        
        if (token) {
          try {
            const authData = JSON.parse(token);
            console.log('HTTP Interceptor - Parsed auth data:', authData);
            
            if (authData.state?.token) {
              config.headers.Authorization = `Bearer ${authData.state.token}`;
              console.log('HTTP Interceptor - Token added to headers:', authData.state.token);
            } else {
              console.log('HTTP Interceptor - No token found in auth data');
            }
          } catch (error) {
            console.error('Error parsing auth token:', error);
          }
        } else {
          console.log('HTTP Interceptor - No token found in localStorage');
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores
    apiInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        
        // Log detallado del error para debugging
        if (error.response) {
          console.error('Response Error:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            url: error.config?.url,
            method: error.config?.method
          });
        } else if (error.request) {
          console.error('Request Error:', {
            message: error.message,
            code: error.code,
            url: error.config?.url,
            method: error.config?.method
          });
        } else {
          console.error('General Error:', error.message);
        }
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth-storage');
          window.location.href = '/auth';
        }
        
        return Promise.reject(error);
      }
    );

    return apiInstance;
  })();

  return initPromise;
};

// Función helper para obtener la instancia de API
export const getApi = async (): Promise<AxiosInstance> => {
  return initializeApi();
};

// Objeto API con métodos que esperan la inicialización
const api = {
  get: async <T = any>(url: string, config?: any) => {
    const instance = await initializeApi();
    return instance.get<T>(url, config);
  },
  post: async <T = any>(url: string, data?: any, config?: any) => {
    const instance = await initializeApi();
    return instance.post<T>(url, data, config);
  },
  put: async <T = any>(url: string, data?: any, config?: any) => {
    const instance = await initializeApi();
    return instance.put<T>(url, data, config);
  },
  delete: async <T = any>(url: string, config?: any) => {
    const instance = await initializeApi();
    return instance.delete<T>(url, config);
  },
  patch: async <T = any>(url: string, data?: any, config?: any) => {
    const instance = await initializeApi();
    return instance.patch<T>(url, data, config);
  },
};

export default api;
