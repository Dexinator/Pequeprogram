-- Migration: Add online_notes column to valuation_items
-- Date: 2025-01-16
-- Description: Add column for public notes displayed in the online store (separate from internal notes)

-- Add online_notes column for public display
ALTER TABLE valuation_items
ADD COLUMN IF NOT EXISTS online_notes TEXT;

-- Comment on the new column
COMMENT ON COLUMN valuation_items.online_notes IS 'Public notes displayed to customers in the online store (e.g., product details, included accessories, minor defects)';

-- Update migration record
INSERT INTO migrations (name, executed_at) VALUES ('030-add-online-notes.sql', NOW());
