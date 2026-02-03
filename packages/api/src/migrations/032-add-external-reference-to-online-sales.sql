-- Migración 032: Agregar external_reference a online_sales para conciliación con MercadoPago
-- Este campo es OBLIGATORIO según los requisitos de integración de MercadoPago

-- Agregar columna external_reference
ALTER TABLE online_sales
ADD COLUMN IF NOT EXISTS external_reference VARCHAR(100);

-- Crear índice para búsquedas rápidas por referencia externa
CREATE INDEX IF NOT EXISTS idx_online_sales_external_reference
ON online_sales(external_reference);

-- Comentario de documentación
COMMENT ON COLUMN online_sales.external_reference IS 'Referencia externa única para correlacionar con MercadoPago (formato: EP-timestamp-random)';
