/**
 * Utility para construir URLs de imágenes correctamente
 * Maneja tanto URLs absolutas como relativas
 */

import { loadConfig } from '../config/theme';

// Cache del apiUrl del config.json
let cachedApiUrl: string | null = null;

loadConfig().then(config => {
  cachedApiUrl = config.apiUrl || null;
}).catch(() => {});

/**
 * Construye la URL completa para una imagen
 * @param imageUrl - La URL de la imagen (puede ser relativa o absoluta)
 * @param apiBaseUrl - La URL base del API (opcional, se obtiene del config si no se provee)
 * @returns La URL completa de la imagen
 */
export const getImageUrl = (
  imageUrl: string | null | undefined,
  apiBaseUrl?: string
): string => {
  // Placeholder por defecto
  if (!imageUrl) {
    return 'https://picsum.photos/seed/placeholder/600/600';
  }

  // Si la URL ya es absoluta (http/https), retornarla tal cual
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return encodeURI(imageUrl);
  }

  // Usar apiUrl del config.json, fallback a window.location.origin
  const baseUrl = apiBaseUrl || cachedApiUrl || window.location.origin;

  // Asegurar que la imageUrl empiece con /
  const normalizedImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

  return encodeURI(`${baseUrl}${normalizedImageUrl}`);
};

/**
 * Obtiene un placeholder para imágenes según el tamaño
 */
export const getPlaceholderUrl = (width: number = 600, height: number = 600): string => {
  return `https://picsum.photos/seed/placeholder/${width}/${height}`;
};
