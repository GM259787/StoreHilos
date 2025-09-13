# 🚀 Store Hilos - E-commerce

## 📋 Deployment en Plesk

### Configuración Git en Plesk:

1. **Ir a "Sitios Web y Dominios"**
2. **Seleccionar tu dominio**
3. **Ir a "Git"**
4. **Hacer clic en "Agregar Repositorio"**
5. **Configurar:**
   - **URL del repositorio**: https://github.com/GM259787/StoreHilos.git
   - **Rama**: main
   - **Directorio de deployment**: /httpdocs
   - **Script de deployment**: deploy.sh

### Variables de Entorno en Plesk:
- ASPNETCORE_ENVIRONMENT=Production
- ASPNETCORE_URLS=http://+:80

### Base de Datos:
- Ejecutar el script database-setup.sql en phpMyAdmin
- Configurar connection string en appsettings.Production.json

### Configuración MercadoPago:
- Actualizar credenciales en appsettings.Production.json
- Configurar webhooks en MercadoPago

## 🔧 Comandos Útiles:

\\\ash
# Compilar localmente
dotnet build

# Ejecutar localmente
dotnet run

# Publicar para producción
dotnet publish -c Release
\\\
