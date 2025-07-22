-- Migration to fix UTF-8 encoding issues in database
-- This migration corrects character encoding problems that occurred during data import

-- Fix subcategories table
UPDATE subcategories 
SET name = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    name,
    '√©', 'é'),
    '√±', 'ñ'),
    '√≥', 'ó'),
    '√°', 'á'),
    '√∫', 'ú')
WHERE name LIKE '%√%';

-- Fix brands table
UPDATE brands 
SET name = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    name,
    '√©', 'é'),
    '√±', 'ñ'),
    '√≥', 'ó'),
    '√°', 'á'),
    '√∫', 'ú')
WHERE name LIKE '%√%';

-- Fix feature_definitions display_name
UPDATE feature_definitions 
SET display_name = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    display_name,
    'ó', 'ó'),
    'í', 'í'),
    'ñ', 'ñ'),
    'á', 'á'),
    'é', 'é'),
    'ú', 'ú')
WHERE display_name ~ '[^[:ascii:]]';

-- Log the migration completion
INSERT INTO migrations (version, description, executed_at)
VALUES ('017', 'Fix UTF-8 encoding issues in categories, subcategories, brands, and feature definitions', CURRENT_TIMESTAMP);