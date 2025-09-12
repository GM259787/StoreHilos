# Script para cambiar a desarrollo local con SQLite
Write-Host "Cambiando a configuración local (SQLite)..." -ForegroundColor Green

# Copiar configuración local
Copy-Item "appsettings.Local.json" "appsettings.Development.json" -Force

Write-Host "Configuración cambiada a SQLite para desarrollo local" -ForegroundColor Green
Write-Host "Ahora puedes ejecutar: dotnet run" -ForegroundColor Yellow

