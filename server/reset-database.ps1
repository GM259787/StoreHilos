# Script para resetear la base de datos completamente
Write-Host "🔄 Reseteando base de datos..." -ForegroundColor Yellow

Write-Host "⚠️  ADVERTENCIA: Esto eliminará TODOS los datos de la base de datos AppDb" -ForegroundColor Red
Write-Host "¿Estás seguro de que quieres continuar? (S/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -ne "S" -and $response -ne "s") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit 0
}

Write-Host "🗑️  Eliminando todas las tablas..." -ForegroundColor Yellow

# SQL para eliminar todas las tablas
$sql = @"
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `CartItems`;
DROP TABLE IF EXISTS `OrderItems`;
DROP TABLE IF EXISTS `ShoppingCarts`;
DROP TABLE IF EXISTS `Orders`;
DROP TABLE IF EXISTS `Products`;
DROP TABLE IF EXISTS `Users`;
DROP TABLE IF EXISTS `Categories`;
DROP TABLE IF EXISTS `Roles`;
DROP TABLE IF EXISTS `__EFMigrationsHistory`;

SET FOREIGN_KEY_CHECKS = 1;
"@

# Guardar el SQL
$sql | Out-File -FilePath "reset-database.sql" -Encoding UTF8

Write-Host "📝 SQL de reseteo creado en reset-database.sql" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Ejecuta este SQL en phpMyAdmin:" -ForegroundColor Yellow
Write-Host ""
Write-Host $sql -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Después de ejecutar el SQL, ejecuta: dotnet run" -ForegroundColor Green
Write-Host "   La aplicación creará automáticamente todas las tablas y datos." -ForegroundColor Green
