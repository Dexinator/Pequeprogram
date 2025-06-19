-- Migración 004: Agregar modalidad "Crédito en tienda"
-- Fecha: Junio 18, 2025

-- Agregar campo store_credit_price a valuation_items
ALTER TABLE valuation_items 
ADD COLUMN IF NOT EXISTS store_credit_price DECIMAL(10,2);

-- Agregar campo total_store_credit_amount a valuations
ALTER TABLE valuations 
ADD COLUMN IF NOT EXISTS total_store_credit_amount DECIMAL(10,2);

-- Comentarios para documentar los nuevos campos
COMMENT ON COLUMN valuation_items.store_credit_price IS 'Precio para modalidad crédito en tienda (10% más que compra directa)';
COMMENT ON COLUMN valuations.total_store_credit_amount IS 'Total acumulado de productos valuados en modalidad crédito en tienda';

-- Actualizar registros existentes con precio de crédito en tienda calculado
UPDATE valuation_items 
SET store_credit_price = ROUND(suggested_purchase_price * 1.1, 2) 
WHERE store_credit_price IS NULL AND suggested_purchase_price IS NOT NULL;