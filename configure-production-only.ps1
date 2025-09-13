# Configurar aplicación para solo producción (sin MySQL local)

Write-Host "🔧 Configurando aplicación para solo producción..." -ForegroundColor Green

# Cambiar a SQLite para desarrollo local
$devConfig = @"
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "ConnectionStrings": {
    "Default": "Data Source=app.db"
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

$devConfig | Out-File -FilePath "server/appsettings.Development.json" -Encoding UTF8

Write-Host "✅ Configuración actualizada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Ahora puedes:" -ForegroundColor Magenta
Write-Host "1. Ejecutar la aplicación localmente con SQLite" -ForegroundColor White
Write-Host "2. Usar DBeaver para conectarte al servidor de producción" -ForegroundColor White
Write-Host "3. Configurar conexión en DBeaver con datos del servidor" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Para conectar DBeaver al servidor:" -ForegroundColor Yellow
Write-Host "- Host: [IP_DEL_SERVIDOR]" -ForegroundColor Cyan
Write-Host "- Port: 3306" -ForegroundColor Cyan
Write-Host "- Database: AppDb" -ForegroundColor Cyan
Write-Host "- Username: [USUARIO_DEL_SERVIDOR]" -ForegroundColor Cyan
Write-Host "- Password: [PASSWORD_DEL_SERVIDOR]" -ForegroundColor Cyan
