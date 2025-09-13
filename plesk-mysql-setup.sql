-- 🗄️ Script de configuración de MySQL para Plesk
-- Ejecutar en phpMyAdmin o MySQL Workbench

-- ==============================================
-- CONFIGURACIÓN DE BASE DE DATOS
-- ==============================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS `AppDb` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE `AppDb`;

-- ==============================================
-- CONFIGURACIÓN DE USUARIO
-- ==============================================

-- Crear usuario si no existe (reemplazar 'tu_password' con tu contraseña real)
CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY 'tu_password_aqui';

-- Otorgar permisos completos sobre la base de datos
GRANT ALL PRIVILEGES ON `AppDb`.* TO 'app_user'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- ==============================================
-- VERIFICACIÓN
-- ==============================================

-- Verificar que la base de datos existe
SHOW DATABASES LIKE 'AppDb';

-- Verificar que el usuario existe
SELECT User, Host FROM mysql.user WHERE User = 'app_user';

-- Verificar permisos del usuario
SHOW GRANTS FOR 'app_user'@'localhost';

-- ==============================================
-- NOTAS IMPORTANTES
-- ==============================================

/*
IMPORTANTE: 
1. Reemplaza 'tu_password_aqui' con una contraseña segura
2. Las tablas se crearán automáticamente cuando ejecutes la aplicación
3. Entity Framework Core creará las tablas basándose en los modelos
4. Si necesitas datos iniciales, ejecuta el script de seed después

PASOS SIGUIENTES:
1. Ejecutar este script en phpMyAdmin
2. Actualizar la connection string en appsettings.Plesk.json
3. Ejecutar la aplicación para que Entity Framework cree las tablas
4. Opcional: Ejecutar script de seed para datos iniciales
*/
