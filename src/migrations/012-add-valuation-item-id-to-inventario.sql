-- Migration 012: Add valuation_item_id column to inventario table
-- This migration establishes a proper foreign key relationship between inventario and valuation_items
-- ALL inventory items should have valuation_item_id for complete traceability

-- Add the new column (nullable initially to allow for data migration)
ALTER TABLE inventario 
ADD COLUMN valuation_item_id INTEGER;

-- Create foreign key constraint to valuation_items
ALTER TABLE inventario
ADD CONSTRAINT fk_inventario_valuation_item
FOREIGN KEY (valuation_item_id) REFERENCES valuation_items(id)
ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_inventario_valuation_item_id ON inventario(valuation_item_id);

-- Migrate existing data where inventario.id matches valuation_items.id
-- This handles products that were created with the old system
UPDATE inventario 
SET valuation_item_id = CAST(id AS INTEGER)
WHERE id ~ '^[0-9]+$' -- Only update numeric IDs that could match valuation_items.id
  AND EXISTS (
    SELECT 1 FROM valuation_items vi 
    WHERE vi.id = CAST(inventario.id AS INTEGER)
  );

-- Add helpful comments
COMMENT ON COLUMN inventario.valuation_item_id IS 'Foreign key to valuation_items.id - ALL inventory items should link to their original valuation';
COMMENT ON CONSTRAINT fk_inventario_valuation_item ON inventario IS 'Links ALL inventory items to their original valuation items for complete traceability';