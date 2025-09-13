# Script para instalar MySQL localmente usando Chocolatey
# Ejecutar como Administrador

Write-Host "🍫 Instalando MySQL usando Chocolatey..." -ForegroundColor Green

# Verificar si Chocolatey está instalado
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Instalando Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Instalar MySQL
Write-Host "🗄️ Instalando MySQL Server..." -ForegroundColor Yellow
choco install mysql -y

# Instalar MySQL Workbench (opcional)
Write-Host "🛠️ Instalando MySQL Workbench..." -ForegroundColor Yellow
choco install mysql-workbench -y

Write-Host "✅ MySQL instalado correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Magenta
Write-Host "1. Reiniciar PowerShell como Administrador" -ForegroundColor White
Write-Host "2. Ejecutar: net start mysql" -ForegroundColor White
Write-Host "3. Configurar contraseña root: mysql_secure_installation" -ForegroundColor White
Write-Host "4. Crear base de datos: CREATE DATABASE AppDb;" -ForegroundColor White
