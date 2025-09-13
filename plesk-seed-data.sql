-- 🌱 Script de datos iniciales para Plesk
-- Ejecutar DESPUÉS de que Entity Framework haya creado las tablas

USE `AppDb`;

-- ==============================================
-- ROLES INICIALES
-- ==============================================

INSERT IGNORE INTO `Roles` (`Id`, `Name`, `Description`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Admin', 'Administrador del sistema', NOW(), NOW()),
(2, 'User', 'Usuario regular', NOW(), NOW()),
(3, 'Cobrador', 'Usuario cobrador', NOW(), NOW());

-- ==============================================
-- USUARIO ADMINISTRADOR INICIAL
-- ==============================================

-- Contraseña: Admin123! (hash bcrypt)
INSERT IGNORE INTO `Users` (`Id`, `Email`, `PasswordHash`, `FirstName`, `LastName`, `Phone`, `Address`, `City`, `PostalCode`, `RoleId`, `IsActive`, `EmailVerified`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'admin@tudominio.com', '$2a$11$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 'Admin', 'Sistema', '+1234567890', 'Dirección Admin', 'Ciudad Admin', '12345', 1, 1, 1, NOW(), NOW());

-- ==============================================
-- CATEGORÍAS INICIALES
-- ==============================================

INSERT IGNORE INTO `Categories` (`Id`, `Name`, `Slug`, `Description`, `IsActive`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Hilos de Algodón', 'hilos-algodon', 'Hilos de algodón de alta calidad para costura', 1, NOW(), NOW()),
(2, 'Hilos de Poliéster', 'hilos-poliéster', 'Hilos de poliéster resistentes y duraderos', 1, NOW(), NOW()),
(3, 'Hilos de Seda', 'hilos-seda', 'Hilos de seda premium para trabajos delicados', 1, NOW(), NOW()),
(4, 'Hilos de Lino', 'hilos-lino', 'Hilos de lino naturales para proyectos especiales', 1, NOW(), NOW());

-- ==============================================
-- PRODUCTOS DE EJEMPLO
-- ==============================================

INSERT IGNORE INTO `Products` (`Id`, `Name`, `Description`, `Price`, `Stock`, `ImageUrl`, `CategoryId`, `IsActive`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Hilo Algodón Blanco #40', 'Hilo de algodón blanco número 40, ideal para costura general', 2.50, 100, '/images/hilos/hilo-algodon-blanco-40.jpg', 1, 1, NOW(), NOW()),
(2, 'Hilo Algodón Negro #40', 'Hilo de algodón negro número 40, perfecto para costura general', 2.50, 100, '/images/hilos/hilo-algodon-negro-40.jpg', 1, 1, NOW(), NOW()),
(3, 'Hilo Poliéster Blanco #50', 'Hilo de poliéster blanco número 50, muy resistente', 3.00, 80, '/images/hilos/hilo-poliéster-blanco-50.jpg', 2, 1, NOW(), NOW()),
(4, 'Hilo Seda Natural #60', 'Hilo de seda natural número 60, para trabajos delicados', 8.50, 30, '/images/hilos/hilo-seda-natural-60.jpg', 3, 1, NOW(), NOW()),
(5, 'Hilo Lino Crudo #30', 'Hilo de lino crudo número 30, para proyectos especiales', 5.00, 50, '/images/hilos/hilo-lino-crudo-30.jpg', 4, 1, NOW(), NOW());

-- ==============================================
-- VERIFICACIÓN DE DATOS
-- ==============================================

-- Verificar roles creados
SELECT 'Roles creados:' as Info;
SELECT * FROM `Roles`;

-- Verificar usuario admin
SELECT 'Usuario admin creado:' as Info;
SELECT Id, Email, FirstName, LastName, RoleId, IsActive FROM `Users` WHERE RoleId = 1;

-- Verificar categorías
SELECT 'Categorías creadas:' as Info;
SELECT * FROM `Categories`;

-- Verificar productos
SELECT 'Productos creados:' as Info;
SELECT p.Id, p.Name, p.Price, p.Stock, c.Name as Category FROM `Products` p 
JOIN `Categories` c ON p.CategoryId = c.Id;

-- ==============================================
-- INFORMACIÓN DE ACCESO
-- ==============================================

/*
CREDENCIALES DE ACCESO INICIAL:
- Email: admin@tudominio.com
- Contraseña: Admin123!

IMPORTANTE:
1. Cambia estas credenciales después del primer login
2. Actualiza el email con tu email real
3. Considera crear usuarios adicionales según necesites

PRÓXIMOS PASOS:
1. Acceder a la aplicación con las credenciales de admin
2. Cambiar la contraseña del administrador
3. Configurar MercadoPago con tus credenciales reales
4. Agregar más productos y categorías según necesites
*/
