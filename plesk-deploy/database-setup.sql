-- Script de migración para MySQL en Plesk
-- Ejecutar en phpMyAdmin o MySQL Workbench

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS $DatabaseName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE $DatabaseName;

-- Crear usuario si no existe
CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY 'St0r3H1l0s!!';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON $DatabaseName.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;

-- Tablas principales (se crearán automáticamente por Entity Framework)
-- Este script solo configura la base de datos y usuario
