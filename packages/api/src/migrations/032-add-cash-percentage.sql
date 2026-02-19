-- Migration: 032-add-cash-percentage.sql
-- Description: Add cash_percentage column to valuations for mixed purchase support
-- Date: 2026-02-18

-- Add cash_percentage column (100 = fully cash, 0 = fully store credit)
ALTER TABLE valuations ADD COLUMN IF NOT EXISTS cash_percentage NUMERIC(5,2) DEFAULT 100.00;

COMMENT ON COLUMN valuations.cash_percentage IS 'Porcentaje del total de compra pagado en efectivo (0-100). El resto se paga en crédito de tienda con +20%';

-- Migration record
INSERT INTO migrations (name, executed_at) VALUES ('032-add-cash-percentage.sql', NOW());
