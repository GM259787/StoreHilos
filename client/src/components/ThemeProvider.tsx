import React, { useEffect } from 'react';
import { useTheme } from '../config/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Helper para convertir hex a RGB
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

// Helper para oscurecer un color hex
const darkenColor = (hex: string, percent: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  
  const r = Math.max(0, parseInt(result[1], 16) * (1 - percent / 100));
  const g = Math.max(0, parseInt(result[2], 16) * (1 - percent / 100));
  const b = Math.max(0, parseInt(result[3], 16) * (1 - percent / 100));
  
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
};

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = useTheme();

  useEffect(() => {
    if (theme) {
      // Inyectar colores como CSS variables
      const root = document.documentElement;
      root.style.setProperty('--color-primary', theme.colors.primary);
      root.style.setProperty('--color-primary-rgb', hexToRgb(theme.colors.primary));
      root.style.setProperty('--color-primary-dark', darkenColor(theme.colors.primary, 15));
      root.style.setProperty('--color-primary-darker', darkenColor(theme.colors.primary, 25));
      root.style.setProperty('--color-primary-darkest', darkenColor(theme.colors.primary, 35));
      
      root.style.setProperty('--color-secondary', theme.colors.secondary);
      root.style.setProperty('--color-secondary-dark', darkenColor(theme.colors.secondary, 15));
      
      root.style.setProperty('--color-accent', theme.colors.accent);
      root.style.setProperty('--color-background', theme.colors.background);
      root.style.setProperty('--color-text', theme.colors.text);
    }
  }, [theme]);

  if (!theme) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return <>{children}</>;
};

export default ThemeProvider;
