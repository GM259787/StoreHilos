/**
 * Utility para construir URLs de imágenes correctamente
 * Maneja tanto URLs absolutas como relativas
 */

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

  // Si es una ruta relativa, construir URL completa
  // Las imágenes se sirven desde el mismo servidor del API
  // Usar window.location.origin como fallback para cuando el config no esté disponible
  const baseUrl = apiBaseUrl || window.location.origin;
  
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
