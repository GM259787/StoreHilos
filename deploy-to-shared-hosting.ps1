# Script para deployment en servidor compartido
# Ejecutar desde la raíz del proyecto

Write-Host "🚀 Preparando aplicación para servidor compartido..." -ForegroundColor Green

# 1. Compilar el cliente
Write-Host "📦 Compilando cliente..." -ForegroundColor Yellow
Set-Location "client"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error compilando cliente" -ForegroundColor Red
    exit 1
}

# 2. Copiar archivos del cliente al servidor
Write-Host "📁 Copiando archivos del cliente..." -ForegroundColor Yellow
Set-Location ".."
Copy-Item -Path "client/dist/*" -Destination "server/wwwroot" -Recurse -Force

# 3. Compilar el servidor
Write-Host "🔨 Compilando servidor..." -ForegroundColor Yellow
Set-Location "server"
dotnet publish -c Release -o ../publish --self-contained false

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error compilando servidor" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Aplicación lista para deployment!" -ForegroundColor Green
Write-Host "📂 Archivos en: ./publish/" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Pasos para subir al servidor:" -ForegroundColor Magenta
Write-Host "1. Comprimir la carpeta 'publish'" -ForegroundColor White
Write-Host "2. Subir al servidor via FTP/Plesk" -ForegroundColor White
Write-Host "3. Configurar la base de datos MySQL en Plesk" -ForegroundColor White
Write-Host "4. Actualizar connection string con datos reales" -ForegroundColor White
Write-Host "5. Configurar dominio y SSL" -ForegroundColor White
