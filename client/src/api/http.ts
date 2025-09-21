import axios from 'axios';

// Configuración flexible de la API
const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  if (!baseUrl) {
    throw new Error('VITE_API_URL no está configurado. Verifica tu archivo .env');
  }
  console.log('API Base URL:', baseUrl);
  return baseUrl;
};

const api = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos de timeout
});

// Interceptor para agregar el token JWT
api.interceptors.request.use(
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
api.interceptors.response.use(
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

export default api;
