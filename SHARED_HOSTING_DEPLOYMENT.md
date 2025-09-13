# 🚀 Deployment en Servidor Compartido

## 📋 Requisitos del Servidor
- ✅ .NET Core 8 & 9
- ✅ SQL Server
- ✅ Panel Plesk
- ✅ Certificados SSL
- ✅ 100 GB SSD

## 🔧 Pasos de Deployment

### 1. Preparar la Aplicación
```powershell
# Ejecutar desde la raíz del proyecto
.\deploy-to-shared-hosting.ps1
```

### 2. Configurar Base de Datos en Plesk
1. **Acceder a Plesk**
2. **Ir a "Bases de Datos"**
3. **Crear nueva base de datos MySQL:**
   - Nombre: `AppDb`
   - Usuario: `app_user`
   - Contraseña: `[generar_contraseña_segura]`

### 3. Actualizar Connection String
En el archivo `appsettings.Production.json`:
```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Database=AppDb;Uid=app_user;Pwd=TU_PASSWORD;"
  }
}
```

### 4. Subir Archivos
1. **Comprimir** la carpeta `publish/`
2. **Subir via FTP** o **Plesk File Manager**
3. **Extraer** en la carpeta del dominio

### 5. Configurar Aplicación en Plesk
1. **Ir a "Sitios Web y Dominios"**
2. **Seleccionar tu dominio**
3. **Ir a "Aplicaciones"**
4. **Agregar aplicación .NET Core:**
   - Ruta: `/`
   - Versión: .NET Core 8
   - Archivo de inicio: `Server.dll`

### 6. Configurar Variables de Entorno
En Plesk, agregar estas variables:
```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80
```

### 7. Configurar SSL
1. **Activar SSL** en Plesk
2. **Configurar redirección HTTPS**
3. **Actualizar URLs** en configuración

## 🔍 Verificación
1. **Acceder al dominio**
2. **Verificar que carga la aplicación**
3. **Probar login/registro**
4. **Verificar base de datos**

## 🛠️ Troubleshooting

### Error de Conexión a BD
- Verificar connection string
- Verificar que la BD existe
- Verificar credenciales

### Error 500
- Revisar logs en Plesk
- Verificar variables de entorno
- Verificar permisos de archivos

### Frontend no carga
- Verificar que los archivos están en `wwwroot/`
- Verificar configuración de archivos estáticos

## 📞 Soporte
- **Plesk Support**: Disponible 24/7
- **Logs**: Accesibles desde Plesk
- **Backup**: Automático en Plesk
