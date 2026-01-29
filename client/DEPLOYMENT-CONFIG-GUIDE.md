# Guía de Configuración JSON en Producción

## Configuración Dinámica con config.json

A partir de ahora, la configuración del sitio se carga desde un archivo `config.json` que puede ser modificado después del deployment sin necesidad de recompilar.

## Archivos de Configuración

### Ubicación
El archivo `config.json` debe estar en la raíz del sitio web desplegado (junto con index.html).

### Archivos de Ejemplo

En la carpeta `public/` encontrarás:
- `config.json` - Configuración por defecto (MasHogar)
- `config.storehilos.json` - Configuración para StoreHilos
- `config.mashogar.json` - Configuración para MásHogar

## Estructura del config.json

```json
{
  "siteId": "mashogar",
  "companyName": "Más Hogar",
  "description": "Descripción de la empresa",
  "apiUrl": "https://api.tudominio.com",
  "logo": "/src/images/logo_full_fondo_blanco.svg",
  "logoAlt": "/src/images/logo_noletras_blanco.svg",
  "colors": {
    "primary": "#2563EB",
    "secondary": "#0EA5E9",
    "accent": "#10B981",
    "background": "#f9fafb",
    "text": "#1f2937"
  },
  "contact": {
    "email": "contacto@tudominio.com",
    "phone": "+598 XX XXX XXX",
    "whatsapp": "+598XXXXXXXXX",
    "whatsappMessage": "Hola, quiero hacer una consulta"
  },
  "social": {
    "facebook": "https://facebook.com/tupagina",
    "instagram": "https://instagram.com/tupagina"
  },
  "shipping": {
    "enableFreeShipping": true,
    "freeShippingThreshold": 2000,
    "shippingCost": 150
  },
  "orders": {
    "refreshInterval": 3,
    "enableNotifications": true
  }
}
```

## Deployment en Producción

### 1. Build del Proyecto

```bash
# Para StoreHilos
npm run build:storehilos

# Para MasHogar
npm run build:mashogar
```

Esto generará las carpetas:
- `dist-storehilos/`
- `dist-mashogar/`

### 2. Configurar el Sitio

**Opción A: Usar config específico durante el build**

Durante el build, el archivo `public/config.json` se copiará a la carpeta dist. Puedes reemplazarlo antes del build:

```bash
# Windows
copy public\config.storehilos.json public\config.json
npm run build:storehilos

# Linux/Mac
cp public/config.storehilos.json public/config.json
npm run build:storehilos
```

**Opción B: Reemplazar después del build**

Después del build, simplemente reemplaza el archivo `config.json` en la carpeta dist:

```bash
# Windows
copy public\config.storehilos.json dist-storehilos\config.json

# Linux/Mac
cp public/config.storehilos.json dist-storehilos/config.json
```

**Opción C: Modificar directamente en el servidor**

Una vez desplegado, puedes editar el archivo `config.json` directamente en el servidor sin necesidad de reconstruir:

1. Accede al servidor (FTP, SSH, panel de control)
2. Edita el archivo `config.json` en la raíz del sitio
3. Guarda los cambios
4. Los usuarios verán los cambios al recargar la página

### 3. Subir al Servidor

Sube todo el contenido de la carpeta `dist-*` a tu servidor web:

```
tu-dominio.com/
├── index.html
├── config.json          ← ARCHIVO CONFIGURABLE
├── assets/
│   ├── index-xxx.js
│   ├── index-xxx.css
│   └── logo-xxx.svg
└── ...
```

## Cambiar Configuración sin Rebuild

### Ejemplo: Cambiar el nombre de la empresa

1. Edita `config.json` en el servidor:
```json
{
  "companyName": "Nuevo Nombre"
}
```

2. Guarda el archivo

3. Los usuarios verán el cambio al recargar la página (no requiere rebuild)

### Ejemplo: Cambiar colores del tema

```json
{
  "colors": {
    "primary": "#FF0000",
    "secondary": "#00FF00",
    "accent": "#0000FF"
  }
}
```

### Ejemplo: Cambiar API URL

```json
{
  "apiUrl": "https://nueva-api.tudominio.com"
}
```

## Ventajas de este Enfoque

1. **Sin Rebuild**: Cambia la configuración sin recompilar
2. **Multi-sitio**: Un mismo build puede servir múltiples configuraciones
3. **Fácil Mantenimiento**: Edita un archivo JSON simple
4. **Actualización Instantánea**: Los cambios se ven al recargar
5. **Versionamiento**: Puedes tener múltiples config.json para diferentes entornos

## Logos

Los logos se configuran en el archivo `config.json` mediante las propiedades `logo` y `logoAlt`:

```json
{
  "logo": "/src/images/logo_full_fondo_blanco.svg",
  "logoAlt": "/src/images/logo_noletras_blanco.svg"
}
```

### Cambiar logos sin rebuild

**Opción 1: Usar logos existentes**

Cambia las rutas en `config.json` para usar otros logos que ya estén en el directorio `assets/`:

```json
{
  "logo": "/assets/logo-nuevo.svg",
  "logoAlt": "/assets/logo-alt-nuevo.svg"
}
```

**Opción 2: Subir nuevos logos**

1. Sube tus nuevos archivos de logo al directorio `assets/` del servidor
2. Actualiza las rutas en `config.json`
3. Los cambios se verán al recargar la página

**Nota importante**: Las rutas `/src/images/` son especiales de Vite durante el desarrollo. En producción, estos archivos estarán en `/assets/` después del build. Si quieres cambiar logos después del deployment, debes:

1. Usar rutas absolutas como `/assets/mi-logo.svg`
2. O colocar los logos en la raíz del sitio y usar `/mi-logo.svg`

## Troubleshooting

### El sitio no carga la configuración

- Verifica que `config.json` esté en la raíz del sitio
- Verifica que el JSON sea válido (sin comas extras, comillas correctas)
- Revisa la consola del navegador para errores

### Los cambios no se reflejan

- Limpia el caché del navegador (Ctrl+F5)
- Verifica que editaste el archivo correcto en el servidor
- Verifica que el archivo se guardó correctamente

### Error de CORS

Si la API está en un dominio diferente, asegúrate de configurar CORS correctamente en el backend.

## Scripts Útiles

### Script para cambiar configuración antes del build (build-with-config.ps1)

```powershell
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('storehilos', 'mashogar')]
    [string]$Site
)

Copy-Item "public\config.$Site.json" "public\config.json" -Force
npm run "build:$Site"
Write-Host "Build completado para $Site con su configuración específica"
```

Uso:
```bash
.\build-with-config.ps1 storehilos
```
