// Configuración de temas para diferentes sitios
import React from 'react';

export type SiteId = 'storehilos' | 'mashogar';

export interface SiteConfig {
  siteId: SiteId;
  companyName: string;
  description: string;
  apiUrl: string;
  logo: string;
  logoAlt?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    whatsappMessage?: string;
  };
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  shipping: {
    enableFreeShipping: boolean;
    freeShippingThreshold: number;
    shippingCost: number;
  };
  orders: {
    refreshInterval: number;
    enableNotifications: boolean;
  };
}

export interface ThemeConfig extends SiteConfig {}

// Variable para cachear la configuración
let cachedConfig: ThemeConfig | null = null;
let configPromise: Promise<ThemeConfig> | null = null;

// Función para limpiar el caché (útil durante desarrollo)
export const clearConfigCache = () => {
  cachedConfig = null;
  configPromise = null;
};

// Función para cargar la configuración desde el JSON
export const loadConfig = async (forceReload = false): Promise<ThemeConfig> => {
  if (forceReload) {
    clearConfigCache();
  }
  
  if (cachedConfig) {
    return cachedConfig;
  }

  if (configPromise) {
    return configPromise;
  }

  configPromise = (async () => {
    try {
      // Determinar qué archivo de configuración cargar según VITE_SITE_ID
      const envSiteId = import.meta.env.VITE_SITE_ID || 'mashogar';
      const configFile = `/${envSiteId}/config.json`;
      
      // Agregar timestamp para evitar caché del navegador
      const timestamp = new Date().getTime();
      const urlWithCacheBuster = `${configFile}?t=${timestamp}`;
      
      console.log('Loading config from:', urlWithCacheBuster);
      
      const response = await fetch(urlWithCacheBuster);
      if (!response.ok) {
        throw new Error(`Failed to load ${configFile}`);
      }
      
      const config: SiteConfig = await response.json();
      
      cachedConfig = {
        ...config,
      };
      
      return cachedConfig;
    } catch (error) {
      console.error('Error loading config, using defaults:', error);
      // Fallback a configuración por defecto
      cachedConfig = {
        siteId: 'mashogar',
        companyName: 'Más Hogar',
        description: 'En MasHogar queremos que comprar cosas para tu casa sea fácil.',
        apiUrl: 'http://localhost:5175',
        logo: '/src/images/logo_full_fondo_blanco.svg',
        logoAlt: '/src/images/logo_noletras_blanco.svg',
        colors: {
          primary: '#2563EB',
          secondary: '#0EA5E9',
          accent: '#10B981',
          background: '#f9fafb',
          text: '#1f2937',
        },
        contact: {
          email: 'contacto@mashogar.com',
          phone: '+598 XX XXX XXX',
          whatsapp: '+598XXXXXXXXX',
        },
        shipping: {
          enableFreeShipping: true,
          freeShippingThreshold: 2000,
          shippingCost: 150,
        },
        orders: {
          refreshInterval: 3,
          enableNotifications: true,
        },
      };
      return cachedConfig;
    }
  })();

  return configPromise;
};

// Hook para usar el tema en componentes (ahora asíncrono)
export const useTheme = (): ThemeConfig | null => {
  const [theme, setTheme] = React.useState<ThemeConfig | null>(cachedConfig);

  React.useEffect(() => {
    loadConfig(true).then(setTheme); // Forzar reload en desarrollo
  }, []);

  return theme;
};

// Exportar para mantener compatibilidad (pero ahora requiere carga asíncrona)
export const getCurrentTheme = async (): Promise<ThemeConfig> => {
  return loadConfig();
};
