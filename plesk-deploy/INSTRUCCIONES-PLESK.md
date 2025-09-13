# 📋 Instrucciones de Deployment en Plesk

## 1. Configurar Base de Datos
1. Acceder a Plesk Panel
2. Ir a "Bases de Datos" > "Agregar Base de Datos"
3. Crear base de datos MySQL:
   - Nombre: AppDb
   - Usuario: app_user
   - Contraseña: [La que especificaste en el script]

## 2. Ejecutar Migración
1. Ir a "Bases de Datos" > "phpMyAdmin"
2. Seleccionar la base de datos AppDb
3. Ejecutar el archivo database-setup.sql

## 3. Subir Archivos
1. Comprimir la carpeta 'plesk-deploy'
2. Subir al servidor via FTP o Plesk File Manager
3. Extraer en la carpeta del dominio (ej: /httpdocs/)

## 4. Configurar Aplicación
1. En Plesk, ir a "Sitios Web y Dominios"
2. Seleccionar tu dominio: storehilos.uy
3. Ir a "Aplicaciones" > "Agregar Aplicación"
4. Configurar:
   - Tipo: .NET Core
   - Versión: .NET Core 8
   - Archivo de inicio: Server.dll
   - Ruta: /

## 5. Configurar Variables de Entorno
En Plesk, agregar estas variables de entorno:
- ASPNETCORE_ENVIRONMENT=Plesk
- ASPNETCORE_URLS=http://+:80

## 6. Configurar SSL
1. Activar SSL en Plesk
2. Configurar redirección HTTPS
3. Verificar que las URLs en appsettings.Plesk.json usen HTTPS

## 7. Verificar Deployment
1. Acceder a https://storehilos.uy
2. Verificar que carga la aplicación
3. Probar login/registro
4. Probar flujo de compra con MercadoPago

## 🛠️ Troubleshooting
- Si hay errores 500, revisar logs en Plesk
- Verificar que la base de datos esté configurada correctamente
- Verificar que las variables de entorno estén configuradas
- Verificar que el certificado SSL esté activo

## 📞 Soporte
- Logs de la aplicación: Plesk > Logs
- Logs de la base de datos: phpMyAdmin > Logs
- Configuración: Plesk > Configuración del Sitio
