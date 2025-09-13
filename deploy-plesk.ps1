# 🚀 Script de Deployment para Plesk
# Ejecutar desde la raíz del proyecto

param(
    [string]$Domain = "",
    [string]$DatabaseName = "AppDb",
    [string]$DatabaseUser = "app_user",
    [string]$DatabasePassword = "",
    [string]$JwtKey = "",
    [string]$MercadoPagoAccessToken = "",
    [string]$MercadoPagoPublicKey = "",
    [string]$MercadoPagoWebhookSecret = ""
)

Write-Host "🚀 Preparando aplicación para Plesk..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan

# Validar parámetros requeridos
if ([string]::IsNullOrEmpty($Domain)) {
    Write-Host "❌ Error: Debes especificar el dominio con -Domain" -ForegroundColor Red
    Write-Host "Ejemplo: .\deploy-plesk.ps1 -Domain 'tudominio.com'" -ForegroundColor Yellow
    exit 1
}

if ([string]::IsNullOrEmpty($DatabasePassword)) {
    Write-Host "❌ Error: Debes especificar la contraseña de la base de datos con -DatabasePassword" -ForegroundColor Red
    exit 1
}

if ([string]::IsNullOrEmpty($JwtKey)) {
    Write-Host "❌ Error: Debes especificar la clave JWT con -JwtKey" -ForegroundColor Red
    exit 1
}

if ([string]::IsNullOrEmpty($MercadoPagoAccessToken)) {
    Write-Host "❌ Error: Debes especificar el Access Token de MercadoPago con -MercadoPagoAccessToken" -ForegroundColor Red
    exit 1
}

if ([string]::IsNullOrEmpty($MercadoPagoPublicKey)) {
    Write-Host "❌ Error: Debes especificar la Public Key de MercadoPago con -MercadoPagoPublicKey" -ForegroundColor Red
    exit 1
}

if ([string]::IsNullOrEmpty($MercadoPagoWebhookSecret)) {
    Write-Host "❌ Error: Debes especificar el Webhook Secret de MercadoPago con -MercadoPagoWebhookSecret" -ForegroundColor Red
    exit 1
}

# 1. Limpiar directorios anteriores
Write-Host "🧹 Limpiando directorios anteriores..." -ForegroundColor Yellow
if (Test-Path "publish") { Remove-Item -Path "publish" -Recurse -Force }
if (Test-Path "plesk-deploy") { Remove-Item -Path "plesk-deploy" -Recurse -Force }

# 2. Compilar el cliente
Write-Host "📦 Compilando cliente React..." -ForegroundColor Yellow
Set-Location "client"

# Instalar dependencias si es necesario
if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Instalando dependencias del cliente..." -ForegroundColor Yellow
    npm install
}

# Compilar para producción
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error compilando cliente" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

# 3. Copiar archivos del cliente al servidor
Write-Host "📁 Copiando archivos del cliente al servidor..." -ForegroundColor Yellow
Set-Location ".."

# Crear directorio wwwroot si no existe
if (-not (Test-Path "server/wwwroot")) {
    New-Item -Path "server/wwwroot" -ItemType Directory -Force
}

# Copiar archivos compilados
Copy-Item -Path "client/dist/*" -Destination "server/wwwroot" -Recurse -Force

# 4. Crear configuración de producción para Plesk
Write-Host "⚙️ Creando configuración de producción..." -ForegroundColor Yellow

$productionConfig = @{
    "Logging" = @{
        "LogLevel" = @{
            "Default" = "Warning"
            "Microsoft.AspNetCore" = "Warning"
            "Microsoft.EntityFrameworkCore" = "Warning"
        }
    }
    "ConnectionStrings" = @{
        "Default" = "Server=localhost;Database=$DatabaseName;Uid=$DatabaseUser;Pwd=$DatabasePassword;"
    }
    "Jwt" = @{
        "Key" = $JwtKey
        "Issuer" = "https://$Domain"
        "Audience" = "https://$Domain"
    }
    "MercadoPago" = @{
        "AccessToken" = $MercadoPagoAccessToken
        "PublicKey" = $MercadoPagoPublicKey
        "WebhookSecret" = $MercadoPagoWebhookSecret
    }
    "FrontendUrl" = "https://$Domain"
    "BackendUrl" = "https://$Domain"
    "AllowedHosts" = "*"
} | ConvertTo-Json -Depth 10

$productionConfig | Out-File -FilePath "server/appsettings.Plesk.json" -Encoding UTF8

# 5. Compilar el servidor
Write-Host "🔨 Compilando servidor .NET..." -ForegroundColor Yellow
Set-Location "server"

# Restaurar paquetes
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error restaurando paquetes del servidor" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

# Compilar para producción
dotnet publish -c Release -o ../plesk-deploy --self-contained false --runtime win-x64
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error compilando servidor" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

Set-Location ".."

# 6. Crear archivos adicionales para Plesk
Write-Host "📄 Creando archivos de configuración para Plesk..." -ForegroundColor Yellow

# Crear web.config para IIS
$webConfig = @"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
      </handlers>
      <aspNetCore processPath="dotnet" arguments=".\Server.dll" stdoutLogEnabled="false" stdoutLogFile=".\logs\stdout" hostingModel="inprocess">
        <environmentVariables>
          <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Plesk" />
        </environmentVariables>
      </aspNetCore>
      <defaultDocument>
        <files>
          <clear />
          <add value="index.html" />
        </files>
      </defaultDocument>
      <staticContent>
        <mimeMap fileExtension=".json" mimeType="application/json" />
        <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
        <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
      </staticContent>
    </system.webServer>
  </location>
</configuration>
"@

$webConfig | Out-File -FilePath "plesk-deploy/web.config" -Encoding UTF8

# Crear archivo de migración SQL
$migrationSql = @"
-- Script de migración para MySQL en Plesk
-- Ejecutar en phpMyAdmin o MySQL Workbench

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS `$DatabaseName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE `$DatabaseName`;

-- Crear usuario si no existe
CREATE USER IF NOT EXISTS '$DatabaseUser'@'localhost' IDENTIFIED BY '$DatabasePassword';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON `$DatabaseName`.* TO '$DatabaseUser'@'localhost';
FLUSH PRIVILEGES;

-- Tablas principales (se crearán automáticamente por Entity Framework)
-- Este script solo configura la base de datos y usuario
"@

$migrationSql | Out-File -FilePath "plesk-deploy/database-setup.sql" -Encoding UTF8

# Crear archivo de instrucciones
$instructions = @"
# 📋 Instrucciones de Deployment en Plesk

## 1. Configurar Base de Datos
1. Acceder a Plesk Panel
2. Ir a "Bases de Datos" > "Agregar Base de Datos"
3. Crear base de datos MySQL:
   - Nombre: $DatabaseName
   - Usuario: $DatabaseUser
   - Contraseña: [La que especificaste en el script]

## 2. Ejecutar Migración
1. Ir a "Bases de Datos" > "phpMyAdmin"
2. Seleccionar la base de datos $DatabaseName
3. Ejecutar el archivo database-setup.sql

## 3. Subir Archivos
1. Comprimir la carpeta 'plesk-deploy'
2. Subir al servidor via FTP o Plesk File Manager
3. Extraer en la carpeta del dominio (ej: /httpdocs/)

## 4. Configurar Aplicación
1. En Plesk, ir a "Sitios Web y Dominios"
2. Seleccionar tu dominio: $Domain
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
1. Acceder a https://$Domain
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
"@

$instructions | Out-File -FilePath "plesk-deploy/INSTRUCCIONES-PLESK.md" -Encoding UTF8

# 7. Crear archivo de configuración de entorno
$envConfig = @"
# Variables de entorno para Plesk
# Configurar en Plesk Panel > Variables de Entorno

ASPNETCORE_ENVIRONMENT=Plesk
ASPNETCORE_URLS=http://+:80

# Base de datos (ya configurada en appsettings.Plesk.json)
# MYSQL_USER=$DatabaseUser
# MYSQL_PASSWORD=$DatabasePassword

# JWT (ya configurado en appsettings.Plesk.json)
# JWT_KEY=$JwtKey
# JWT_ISSUER=https://$Domain
# JWT_AUDIENCE=https://$Domain

# MercadoPago (ya configurado en appsettings.Plesk.json)
# MERCADOPAGO_ACCESS_TOKEN=$MercadoPagoAccessToken
# MERCADOPAGO_PUBLIC_KEY=$MercadoPagoPublicKey
# MERCADOPAGO_WEBHOOK_SECRET=$MercadoPagoWebhookSecret

# URLs (ya configuradas en appsettings.Plesk.json)
# FRONTEND_URL=https://$Domain
# BACKEND_URL=https://$Domain
"@

$envConfig | Out-File -FilePath "plesk-deploy/variables-entorno.txt" -Encoding UTF8

Write-Host ""
Write-Host "✅ ¡Deployment para Plesk completado!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "📂 Archivos listos en: ./plesk-deploy/" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Magenta
Write-Host "1. Revisar el archivo INSTRUCCIONES-PLESK.md" -ForegroundColor White
Write-Host "2. Comprimir la carpeta 'plesk-deploy'" -ForegroundColor White
Write-Host "3. Subir al servidor Plesk" -ForegroundColor White
Write-Host "4. Seguir las instrucciones paso a paso" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Dominio configurado: $Domain" -ForegroundColor Cyan
Write-Host "🗄️ Base de datos: $DatabaseName" -ForegroundColor Cyan
Write-Host "👤 Usuario BD: $DatabaseUser" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Guarda las credenciales de MercadoPago de forma segura" -ForegroundColor Red
