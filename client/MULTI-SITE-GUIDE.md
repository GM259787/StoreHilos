# Guía de Configuración Multi-Sitio

Este proyecto soporta múltiples configuraciones de sitio (storehilos y mashogar) con temas separados.

## Estructura de Temas

La configuración de temas se encuentra en `src/config/theme.ts` y permite:

- Personalizar nombre de la empresa
- Configurar colores (primary, secondary, accent)
- Definir información de contacto (email, teléfono, WhatsApp)
- Establecer logo específico
- Agregar redes sociales

## Variables de Entorno

Cada sitio tiene su propio archivo de variables de entorno:

- `.env.storehilos` - Configuración para Store Hilos
- `.env.mashogar` - Configuración para Más Hogar

### Variables Importantes

```bash
VITE_SITE_ID=storehilos  # o mashogar
VITE_API_URL=http://localhost:5175
VITE_COMPANY_NAME="Store Hilos"
VITE_COMPANY_EMAIL="contacto@storehilos.uy"
VITE_COMPANY_PHONE="+598 94 288 006"
VITE_WHATSAPP_NUMBER="+59894288006"
```

## Scripts de Desarrollo

### Desarrollo con Store Hilos
```bash
npm run dev:storehilos
```

### Desarrollo con Más Hogar
```bash
npm run dev:mashogar
```

### Desarrollo por defecto (Más Hogar)
```bash
npm run dev
```

## Scripts de Build

### Build para Store Hilos
```bash
npm run build:storehilos
```
Genera la build en: `dist-storehilos/`

### Build para Más Hogar
```bash
npm run build:mashogar
```
Genera la build en: `dist-mashogar/`

### Build por defecto (Más Hogar)
```bash
npm run build
```

## Scripts de Preview

### Preview de Store Hilos
```bash
npm run preview:storehilos
```

### Preview de Más Hogar
```bash
npm run preview:mashogar
```

## Agregar un Nuevo Sitio

1. **Crear configuración de tema** en `src/config/theme.ts`:
```typescript
// Importar el logo del nuevo sitio
import logoNuevoSitio from '../images/logo_nuevositio.svg';

const nuevoSitioTheme: ThemeConfig = {
  siteId: 'nuevositio',
  companyName: 'Nuevo Sitio',
  description: 'Descripción del sitio',
  logo: logoNuevoSitio, // Usar el import, no una ruta string
  colors: {
    primary: '#4F46E5',
    secondary: '#7C3AED',
    accent: '#EC4899',
    background: '#f9fafb',
    text: '#1f2937',
  },
  contact: {
    email: 'contacto@nuevositio.com',
    phone: '+598 XX XXX XXX',
    whatsapp: '+598XXXXXXXXX',
  }
};

// Agregar al mapa de temas
const themes: Record<SiteId, ThemeConfig> = {
  storehilos: storeHilosTheme,
  mashogar: masHogarTheme,
  nuevositio: nuevoSitioTheme, // <-- Agregar aquí
};
```

2. **Crear archivo de entorno** `.env.nuevositio`:
```bash
VITE_SITE_ID=nuevositio
VITE_API_URL=http://localhost:5175
VITE_COMPANY_NAME="Nuevo Sitio"
# ... resto de variables
```

3. **Agregar scripts** en `package.json`:
```json
"scripts": {
  "dev:nuevositio": "cross-env VITE_SITE_ID=nuevositio vite --port 5173",
  "build:nuevositio": "cross-env VITE_SITE_ID=nuevositio tsc && vite build --mode nuevositio",
  "preview:nuevositio": "cross-env VITE_SITE_ID=nuevositio vite preview"
}
```

4. **Agregar logo** en `src/images/logo_nuevositio.svg`

## Componentes que Usan el Tema

Los siguientes componentes están configurados para usar el tema:

- **Header**: Logo y nombre de la empresa
- **Footer**: Información de contacto y descripción
- **WhatsAppButton**: Número de WhatsApp

### Ejemplo de Uso

```tsx
import { useTheme } from '../config/theme';

const MiComponente = () => {
  const theme = useTheme();
  
  return (
    <div>
      <h1>{theme.companyName}</h1>
      <p>{theme.description}</p>
      <a href={`mailto:${theme.contact.email}`}>
        {theme.contact.email}
      </a>
    </div>
  );
};
```

## Despliegue

Para desplegar cada sitio en producción:

1. **Build del sitio específico:**
```bash
npm run build:storehilos
# o
npm run build:mashogar
```

2. **Los archivos compilados estarán en:**
   - `dist-storehilos/` para Store Hilos
   - `dist-mashogar/` para Más Hogar

3. **Configurar el servidor** para servir la carpeta dist correspondiente

## Notas Importantes

- Cada sitio genera su build en una carpeta separada
- Los temas se cambian automáticamente según `VITE_SITE_ID`
- El sitio por defecto es "mashogar" si no se especifica `VITE_SITE_ID`
- Todos los componentes deben usar `useTheme()` para acceder a la configuración
- No usar variables de entorno directamente en componentes, usar el hook `useTheme()`
