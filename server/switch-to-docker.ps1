# Script para cambiar a desarrollo con Docker (PostgreSQL)
Write-Host "Cambiando a configuración Docker (PostgreSQL)..." -ForegroundColor Green

# Restaurar configuración original para Docker
$dockerConfig = @"
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "ConnectionStrings": {
    "Default": "Host=db;Database=app;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Key": "development-key-not-for-production-use-only",
    "Issuer": "your-app-dev",
    "Audience": "your-app-dev"
  },
  "FrontendUrl": "http://localhost:5173",
  "BackendUrl": "http://localhost:5175"
}
"@

$dockerConfig | Out-File -FilePath "appsettings.Development.json" -Encoding UTF8

Write-Host "Configuración cambiada a PostgreSQL para Docker" -ForegroundColor Green
Write-Host "Ahora puedes ejecutar: docker-compose up" -ForegroundColor Yellow

