# Script para resetear productos y crear 10 nuevos productos de hilos
# Ejecutar desde la carpeta server

Write-Host "🔄 Reseteando productos de la base de datos..." -ForegroundColor Yellow

# Detener el servidor si está ejecutándose
$serverProcess = Get-Process -Name "Server" -ErrorAction SilentlyContinue
if ($serverProcess) {
    Write-Host "🛑 Deteniendo servidor..." -ForegroundColor Red
    Stop-Process -Name "Server" -Force
    Start-Sleep -Seconds 2
}

# Crear archivo de base de datos limpio
Write-Host "🗑️ Eliminando base de datos existente..." -ForegroundColor Red
if (Test-Path "app.db") {
    Remove-Item "app.db" -Force
}
if (Test-Path "app.db-shm") {
    Remove-Item "app.db-shm" -Force
}
if (Test-Path "app.db-wal") {
    Remove-Item "app.db-wal" -Force
}

Write-Host "✅ Base de datos eliminada. Ejecuta 'dotnet run' para recrear con nuevos productos." -ForegroundColor Green
