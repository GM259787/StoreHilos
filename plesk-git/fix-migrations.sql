CREATE TABLE IF NOT EXISTS __EFMigrationsHistory (
    MigrationId varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    ProductVersion varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT PK___EFMigrationsHistory PRIMARY KEY (MigrationId)
) CHARACTER SET=utf8mb4;

-- Insertar la migración que ya está aplicada
INSERT IGNORE INTO __EFMigrationsHistory (MigrationId, ProductVersion) 
VALUES ('20250913045827_InitialCreate', '8.0.4');
