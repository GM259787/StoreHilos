# Script para insertar las migraciones ya aplicadas
Write-Host "🔧 Insertando migraciones ya aplicadas en la tabla __EFMigrationsHistory..." -ForegroundColor Yellow

# SQL para crear la tabla de migraciones e insertar las migraciones existentes
$sql = @"
-- Crear la tabla de migraciones si no existe
CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

-- Insertar todas las migraciones que ya están aplicadas
INSERT IGNORE INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`) VALUES 
('20250913045827_InitialCreate', '8.0.4');

-- Verificar que se insertaron correctamente
SELECT 'Migraciones insertadas:' as Status;
SELECT MigrationId, ProductVersion FROM `__EFMigrationsHistory` ORDER BY MigrationId;
"@

# Guardar el SQL
$sql | Out-File -FilePath "insert-migrations.sql" -Encoding UTF8

Write-Host "📝 SQL creado en insert-migrations.sql" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Ejecuta este SQL en phpMyAdmin (http://localhost/phpmyadmin):" -ForegroundColor Yellow
Write-Host ""
Write-Host $sql -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Después de ejecutar el SQL:" -ForegroundColor Green
Write-Host "   1. La aplicación no intentará aplicar migraciones existentes" -ForegroundColor White
Write-Host "   2. Solo aplicará nuevas migraciones si las hay" -ForegroundColor White
Write-Host "   3. El inicio será mucho más rápido" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Luego ejecuta: dotnet run" -ForegroundColor Green
