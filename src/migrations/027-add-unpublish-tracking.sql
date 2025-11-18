-- Migration: Add unpublish tracking and edit history to valuation_items
-- Date: 2025-01-12
-- Description: Add fields to track when products are unpublished and maintain edit history for auditing

-- Add unpublish tracking columns
ALTER TABLE valuation_items
ADD COLUMN IF NOT EXISTS unpublished_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS unpublished_at TIMESTAMP WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS unpublish_reason TEXT;

-- Add edit history column to track all changes
ALTER TABLE valuation_items
ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]'::jsonb;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_valuation_items_unpublished_by
ON valuation_items(unpublished_by)
WHERE unpublished_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_valuation_items_unpublished_at
ON valuation_items(unpublished_at)
WHERE unpublished_at IS NOT NULL;

-- Comments on new columns
COMMENT ON COLUMN valuation_items.unpublished_by IS 'User who unpublished the product from online store';
COMMENT ON COLUMN valuation_items.unpublished_at IS 'Timestamp when the product was unpublished';
COMMENT ON COLUMN valuation_items.unpublish_reason IS 'Reason provided for unpublishing the product';
COMMENT ON COLUMN valuation_items.edit_history IS 'JSONB array tracking all edits to online store fields (price, weight, images, featured)';

-- Update migration record
INSERT INTO migrations (name, executed_at) VALUES ('027-add-unpublish-tracking.sql', NOW());
