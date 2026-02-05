import { loadConfig } from '../config/theme';

/**
 * Obtiene la URL base del API desde el config.json
 * @returns La URL base del API
 */
export const getApiBaseUrl = async (): Promise<string> => {
  try {
    const config = await loadConfig();
    // Si apiUrl está vacío o es undefined, usar el mismo origen
    return config.apiUrl || window.location.origin;
  } catch (error) {
    console.error('Error loading config for API URL, using fallback:', error);
    // Fallback a localhost si falla
    return 'http://localhost:5175';
  }
};

/**
 * Construye una URL completa del API
 * @param path - El path del endpoint (ejemplo: '/api/auth/login')
 * @returns La URL completa
 */
export const buildApiUrl = async (path: string): Promise<string> => {
  const baseUrl = await getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};
