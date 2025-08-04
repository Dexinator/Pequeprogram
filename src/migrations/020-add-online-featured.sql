-- Migration: Add online_featured column to valuation_items table
-- Date: 2025-07-30
-- Description: Add boolean column to mark products as featured in the online store

-- Add online_featured column to valuation_items table
ALTER TABLE valuation_items 
ADD COLUMN IF NOT EXISTS online_featured BOOLEAN DEFAULT FALSE;

-- Add index for faster queries on featured products
CREATE INDEX IF NOT EXISTS idx_valuation_items_online_featured 
ON valuation_items(online_featured) 
WHERE online_featured = TRUE AND online_store_ready = TRUE;

-- Comment on the new column
COMMENT ON COLUMN valuation_items.online_featured IS 'Indicates if the product should be featured on the online store homepage';

-- Update migration record
INSERT INTO migrations (name, executed_at) VALUES ('020-add-online-featured.sql', NOW());