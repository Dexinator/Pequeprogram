-- Migración 026: Agregar columna delivery_method a online_sales

-- Agregar columna delivery_method para distinguir entre envío y recoger en tienda
ALTER TABLE online_sales
ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(20) DEFAULT 'shipping' CHECK (delivery_method IN ('shipping', 'pickup'));

-- Agregar índice para facilitar consultas por método de entrega
CREATE INDEX IF NOT EXISTS idx_online_sales_delivery_method ON online_sales(delivery_method);

-- Comentarios de documentación
COMMENT ON COLUMN online_sales.delivery_method IS 'Método de entrega: shipping (envío a domicilio) o pickup (recoger en tienda)';

-- Migrar datos existentes: si notes contiene "RECOGER EN TIENDA" entonces es pickup
UPDATE online_sales
SET delivery_method = 'pickup'
WHERE notes ILIKE '%RECOGER EN TIENDA%';

-- Actualizar timestamp de modificación
UPDATE online_sales SET updated_at = NOW() WHERE delivery_method = 'pickup';
