import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5175',
  headers: {
    'Content-Type': 'application/json',
  },
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
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;
