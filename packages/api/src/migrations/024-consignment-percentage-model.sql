-- Migration: 024-consignment-percentage-model.sql
-- Description: Update consignment model to use percentage of sale price instead of fixed price
-- Date: 2025-01-15

-- Add new fields to valuation_items for the percentage-based consignment model
ALTER TABLE valuation_items 
ADD COLUMN IF NOT EXISTS consignment_percentage NUMERIC(5,2) DEFAULT 50.00;

-- Add column to track the actual sale price from sale_items (for reference)
ALTER TABLE valuation_items 
ADD COLUMN IF NOT EXISTS actual_sale_price NUMERIC(10,2);

-- Add column to track calculated consignment amount (50% of actual sale price)
ALTER TABLE valuation_items 
ADD COLUMN IF NOT EXISTS calculated_consignment_amount NUMERIC(10,2);

-- Add comment to explain the new model
COMMENT ON COLUMN valuation_items.consignment_percentage IS 'Percentage of sale price that goes to the consignor (default 50%)';
COMMENT ON COLUMN valuation_items.actual_sale_price IS 'Actual sale price from sale_items when product is sold';
COMMENT ON COLUMN valuation_items.calculated_consignment_amount IS 'Calculated amount to pay consignor (percentage of actual sale price)';
COMMENT ON COLUMN valuation_items.consignment_price IS 'DEPRECATED: Old fixed consignment price. Now used as suggested sale price only';

-- Update existing sold consignment items to populate the new fields
-- This will calculate the 50% based on actual sale prices
UPDATE valuation_items vi
SET 
    actual_sale_price = si.unit_price,
    calculated_consignment_amount = si.unit_price * 0.50,
    consignment_percentage = 50.00
FROM inventario inv
JOIN sale_items si ON si.inventario_id = inv.id
WHERE 
    inv.valuation_item_id = vi.id 
    AND vi.modality = 'consignación'
    AND si.id IS NOT NULL;

-- Update paid consignments to reflect the new calculation
-- Only update if the paid amount was the old consignment_price
UPDATE valuation_items vi
SET 
    consignment_paid_amount = calculated_consignment_amount
WHERE 
    vi.modality = 'consignación'
    AND vi.consignment_paid = TRUE
    AND vi.calculated_consignment_amount IS NOT NULL
    AND vi.consignment_paid_amount = vi.consignment_price;

-- Create or replace function to automatically calculate consignment amount when a sale is made
CREATE OR REPLACE FUNCTION update_consignment_sale_price()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the valuation_item with actual sale price and calculated amount
    UPDATE valuation_items vi
    SET 
        actual_sale_price = NEW.unit_price,
        calculated_consignment_amount = NEW.unit_price * (COALESCE(vi.consignment_percentage, 50.00) / 100)
    FROM inventario inv
    WHERE 
        inv.id = NEW.inventario_id
        AND inv.valuation_item_id = vi.id
        AND vi.modality = 'consignación';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_update_consignment_sale ON sale_items;
CREATE TRIGGER trigger_update_consignment_sale
AFTER INSERT ON sale_items
FOR EACH ROW
EXECUTE FUNCTION update_consignment_sale_price();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_valuation_items_consignment_percentage 
ON valuation_items(consignment_percentage) 
WHERE modality = 'consignación';

-- Migration completed successfully
-- Note: The consignment_price field is kept for backward compatibility but marked as deprecated