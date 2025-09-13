# Instrucciones para DBeaver

## 🔧 Insertar Migraciones en DBeaver

### Paso 1: Conectar a MySQL
1. Abrir DBeaver
2. Crear nueva conexión MySQL:
   - Host: `localhost`
   - Port: `3306`
   - Database: `AppDb`
   - Username: `root`
   - Password: (vacío)

### Paso 2: Ejecutar SQL
1. Hacer clic derecho en la conexión
2. Seleccionar "SQL Editor" → "New SQL Script"
3. Copiar y pegar este SQL:

```sql
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
```

4. Ejecutar el script (Ctrl+Enter)

### Paso 3: Verificar
Deberías ver:
```
Status: Migraciones insertadas:
MigrationId: 20250913045827_InitialCreate
ProductVersion: 8.0.4
```

### Paso 4: Probar la aplicación
```bash
dotnet run
```

Deberías ver:
```
Base de datos está actualizada, no se requieren migraciones.
Base de datos ya contiene datos, omitiendo inicialización.
```
