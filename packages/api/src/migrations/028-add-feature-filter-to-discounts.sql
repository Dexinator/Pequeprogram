-- Migration 028: Add feature_filter column to active_discounts
-- Created: 2025-12-05
-- Purpose: Allow discounts to filter by product features (JSONB)

-- Add feature_filter column
ALTER TABLE active_discounts
ADD COLUMN IF NOT EXISTS feature_filter JSONB DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN active_discounts.feature_filter IS 'Optional JSONB filter to match product features. Example: {"modelo": "Eléctrico"} will only apply discount to products where features->>modelo = Eléctrico';

-- Update constraint to allow feature_filter as additional filter
-- (category_id or subcategory_id can now be combined with feature_filter)

-- Create index for feature_filter queries
CREATE INDEX IF NOT EXISTS idx_active_discounts_feature_filter
ON active_discounts USING GIN (feature_filter)
WHERE feature_filter IS NOT NULL AND is_active = true;
