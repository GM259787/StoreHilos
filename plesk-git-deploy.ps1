# 🚀 Script para preparar deployment con Git en Plesk
# Este script crea una estructura optimizada para Git deployment

param(
    [string]$GitRepoUrl = "",
    [string]$Branch = "main"
)

Write-Host "🚀 Preparando proyecto para Git deployment en Plesk..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan

if ([string]::IsNullOrEmpty($GitRepoUrl)) {
    Write-Host "❌ Error: Debes especificar la URL del repositorio Git" -ForegroundColor Red
    Write-Host "Ejemplo: .\plesk-git-deploy.ps1 -GitRepoUrl 'https://github.com/tu-usuario/tu-repo.git'" -ForegroundColor Yellow
    exit 1
}

# 1. Crear directorio para Git deployment
Write-Host "📁 Creando estructura para Git deployment..." -ForegroundColor Yellow
if (Test-Path "plesk-git") { Remove-Item -Path "plesk-git" -Recurse -Force }
New-Item -Path "plesk-git" -ItemType Directory -Force

# 2. Compilar el cliente
Write-Host "📦 Compilando cliente React..." -ForegroundColor Yellow
Set-Location "client"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error compilando cliente" -ForegroundColor Red
    Set-Location ".."
    exit 1
}
Set-Location ".."

# 3. Copiar archivos del cliente al servidor
Write-Host "📁 Copiando archivos del cliente..." -ForegroundColor Yellow
Copy-Item -Path "client/dist/*" -Destination "server/wwwroot" -Recurse -Force

# 4. Crear estructura para Plesk
Write-Host "🔧 Creando estructura para Plesk..." -ForegroundColor Yellow

# Copiar archivos del servidor
Copy-Item -Path "server/*" -Destination "plesk-git" -Recurse -Force

# 5. Crear archivos específicos para Git deployment
Write-Host "📄 Creando archivos de configuración..." -ForegroundColor Yellow

# Crear .gitignore
$gitignore = @"
# Archivos de build
bin/
obj/
*.user
*.suo
*.cache

# Logs
logs/
*.log

# Base de datos local
*.db
*.db-shm
*.db-wal

# Archivos temporales
*.tmp
*.temp

# Archivos de configuración local
appsettings.Development.json
appsettings.Local.json

# Node modules (si se incluyen)
node_modules/

# Archivos de Plesk
plesk-deploy/
plesk-git/
"@

$gitignore | Out-File -FilePath "plesk-git/.gitignore" -Encoding UTF8

# Crear archivo de configuración para Plesk
$pleskConfig = @"
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "Default": "Server=localhost;Database=AppDb;Uid=app_user;Pwd=St0r3H1l0s!!;"
  },
  "Jwt": {
    "Key": "cZIw9eEW_PZ9Ue2N1Yz0Hk3Q1Xqj8T8g5d7u0f6_6r6v8JgCk6g1v0uWk0gPIl9m4D6Q1e0cA8uGmF0p2w8mC7k0R2m4Xx0Vt6sQ",
    "Issuer": "https://storehilos.uy",
    "Audience": "https://storehilos.uy"
  },
  "MercadoPago": {
    "AccessToken": "APP_USR-TEST-1234567890abcdef1234567890abcdef-12345678",
    "PublicKey": "APP_USR-TEST-12345678-1234-1234-1234-123456789012",
    "WebhookSecret": "test_webhook_secret_placeholder"
  },
  "FrontendUrl": "https://storehilos.uy",
  "BackendUrl": "https://storehilos.uy",
  "AllowedHosts": "*"
}
"@

$pleskConfig | Out-File -FilePath "plesk-git/appsettings.Production.json" -Encoding UTF8

# Crear web.config
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
          <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Production" />
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

$webConfig | Out-File -FilePath "plesk-git/web.config" -Encoding UTF8

# Crear script de deployment
$deployScript = @"
#!/bin/bash
# Script de deployment automático para Plesk

echo "🚀 Iniciando deployment..."

# Restaurar paquetes
dotnet restore

# Compilar aplicación
dotnet publish -c Release -o . --self-contained false

echo "✅ Deployment completado!"
"@

$deployScript | Out-File -FilePath "plesk-git/deploy.sh" -Encoding UTF8

# Crear README para Git deployment
$readme = @"
# 🚀 Store Hilos - E-commerce

## 📋 Deployment en Plesk

### Configuración Git en Plesk:

1. **Ir a "Sitios Web y Dominios"**
2. **Seleccionar tu dominio**
3. **Ir a "Git"**
4. **Hacer clic en "Agregar Repositorio"**
5. **Configurar:**
   - **URL del repositorio**: $GitRepoUrl
   - **Rama**: $Branch
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

\`\`\`bash
# Compilar localmente
dotnet build

# Ejecutar localmente
dotnet run

# Publicar para producción
dotnet publish -c Release
\`\`\`
"@

$readme | Out-File -FilePath "plesk-git/README.md" -Encoding UTF8

Write-Host ""
Write-Host "✅ ¡Estructura para Git deployment creada!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "📂 Archivos listos en: ./plesk-git/" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Magenta
Write-Host "1. Inicializar repositorio Git en la carpeta plesk-git" -ForegroundColor White
Write-Host "2. Hacer commit y push al repositorio" -ForegroundColor White
Write-Host "3. Configurar Git deployment en Plesk" -ForegroundColor White
Write-Host "4. Configurar variables de entorno en Plesk" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Repositorio configurado para: $GitRepoUrl" -ForegroundColor Cyan
Write-Host "🌿 Rama: $Branch" -ForegroundColor Cyan
