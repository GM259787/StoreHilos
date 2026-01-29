-- Migration: AddPlaceToPayFields
-- Agregar campos para integración de PlaceToPay en la tabla Orders

USE AppDb;

-- Agregar columnas para información de pago
ALTER TABLE Orders 
ADD COLUMN PaymentMethod VARCHAR(50) NULL COMMENT 'Método de pago: PlaceToPay, MercadoPago, Transferencia',
ADD COLUMN PaymentReference VARCHAR(100) NULL COMMENT 'Referencia externa del pago',
ADD COLUMN PlaceToPayRequestId INT NULL COMMENT 'ID de sesión de PlaceToPay',
ADD COLUMN PaymentStatus VARCHAR(50) NULL COMMENT 'Estado del pago en el gateway',
ADD COLUMN PaymentDate DATETIME NULL COMMENT 'Fecha de pago efectivo';

-- Crear índice para búsqueda por PlaceToPayRequestId
CREATE INDEX IX_Orders_PlaceToPayRequestId ON Orders(PlaceToPayRequestId);

-- Crear índice para búsqueda por PaymentReference
CREATE INDEX IX_Orders_PaymentReference ON Orders(PaymentReference);
