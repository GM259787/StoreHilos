# Script para arreglar el problema de migraciones
Write-Host "🔧 Arreglando problema de migraciones..." -ForegroundColor Yellow

# Crear la tabla de migraciones manualmente
$sql = @"
CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

-- Insertar la migración que ya está aplicada
INSERT IGNORE INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`) 
VALUES ('20250913045827_InitialCreate', '8.0.4');
"@

# Guardar el SQL en un archivo temporal
$sql | Out-File -FilePath "fix-migrations.sql" -Encoding UTF8

Write-Host "📝 SQL creado en fix-migrations.sql" -ForegroundColor Green
Write-Host "💡 Ejecuta este SQL en phpMyAdmin o DBeaver:" -ForegroundColor Yellow
Write-Host ""
Write-Host $sql -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Después de ejecutar el SQL, la aplicación debería funcionar correctamente." -ForegroundColor Green
