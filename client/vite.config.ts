import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs'
import { resolve, join } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '');
  const siteId = env.VITE_SITE_ID || 'mashogar';
  
  return {
    plugins: [
      react(),
      {
        name: 'copy-site-config',
        closeBundle() {
          // Solo copiar en build, no en dev
          if (command !== 'build') return;
          
          // Copiar solo los archivos del sitio específico al build
          const outDir = `dist-${siteId}`;
          const sitePublicDir = resolve(__dirname, `public/${siteId}`);
          const destDir = resolve(__dirname, outDir);
          
          if (existsSync(sitePublicDir)) {
            console.log(`Copiando archivos de ${siteId} a ${outDir}`);
            // Copiar config.json del sitio específico a la raíz del dist
            const configSrc = resolve(sitePublicDir, 'config.json');
            const configDest = resolve(destDir, siteId, 'config.json');
            
            // Crear directorio si no existe
            const siteDestDir = resolve(destDir, siteId);
            if (!existsSync(siteDestDir)) {
              mkdirSync(siteDestDir, { recursive: true });
            }
            
            if (existsSync(configSrc)) {
              copyFileSync(configSrc, configDest);
              console.log(`✓ Copiado: ${siteId}/config.json`);
            }
          }
        }
      }
    ],
    server: {
      port: 5176,
      host: true,
      strictPort: false
    },
    define: {
      // Exponer VITE_SITE_ID a la aplicación
      'import.meta.env.VITE_SITE_ID': JSON.stringify(siteId)
    },
    build: {
      outDir: `dist-${siteId}`,
      sourcemap: mode !== 'production',
      emptyOutDir: true
    },
    publicDir: 'public' // Mantener activo para desarrollo
  }
})
