-- Migration: 035-add-sale-discount.sql
-- Description: Add discount support to physical POS sales (discount over the sale total)
-- Date: 2026-07-04

-- discount_type: 'percentage' | 'fixed_amount' | NULL (no discount)
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20);
-- discount_value: the raw input entered by the cashier (e.g. 10 = 10% or 50 = $50)
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10,2) DEFAULT 0;
-- discount_amount: the resolved discount in pesos applied to the subtotal
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;

COMMENT ON COLUMN sales.discount_type IS 'Tipo de descuento aplicado a la venta: percentage, fixed_amount o NULL (sin descuento)';
COMMENT ON COLUMN sales.discount_value IS 'Valor capturado del descuento (porcentaje o importe segun discount_type)';
COMMENT ON COLUMN sales.discount_amount IS 'Descuento resuelto en pesos aplicado al subtotal. total_amount = subtotal - discount_amount';

-- Migration record
INSERT INTO migrations (name, executed_at) VALUES ('035-add-sale-discount.sql', NOW());
