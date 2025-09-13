# Script para instalar XAMPP (incluye MySQL + phpMyAdmin)
# Ejecutar como Administrador

Write-Host "🚀 Instalando XAMPP para MySQL..." -ForegroundColor Green

# Descargar XAMPP
$url = "https://sourceforge.net/projects/xampp/files/XAMPP%20Windows/8.2.12/xampp-windows-x64-8.2.12-0-VS16-installer.exe/download"
$output = "$env:TEMP\xampp-installer.exe"

Write-Host "📥 Descargando XAMPP..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $url -OutFile $output

Write-Host "🔧 Ejecutando instalador..." -ForegroundColor Yellow
Start-Process -FilePath $output -Wait

Write-Host "✅ XAMPP instalado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Magenta
Write-Host "1. Abrir XAMPP Control Panel" -ForegroundColor White
Write-Host "2. Iniciar MySQL (botón Start)" -ForegroundColor White
Write-Host "3. Abrir phpMyAdmin en: http://localhost/phpmyadmin" -ForegroundColor White
Write-Host "4. Crear base de datos 'AppDb'" -ForegroundColor White
Write-Host "5. Conectar DBeaver con:" -ForegroundColor White
Write-Host "   - Host: localhost" -ForegroundColor Cyan
Write-Host "   - Port: 3306" -ForegroundColor Cyan
Write-Host "   - User: root" -ForegroundColor Cyan
Write-Host "   - Password: (vacío)" -ForegroundColor Cyan
