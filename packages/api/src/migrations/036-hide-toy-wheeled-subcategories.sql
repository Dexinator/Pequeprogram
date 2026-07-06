-- Migration: 036-hide-toy-wheeled-subcategories.sql
-- Description: Ocultar del valuador las subcategorías con ruedas (petición Pablo Junio26):
--   id 8 = "Sobre ruedas", id 6 = "Triciclos y bicicletas".
--   Se ocultan con is_active=FALSE (NO se borran) para no romper valuation_items
--   históricos que las referencian (FK). Los reads del valuador ya filtran is_active=true.
-- Date: 2026-07-06

UPDATE subcategories SET is_active = FALSE WHERE id IN (6, 8);

-- Migration record
INSERT INTO migrations (name, executed_at) VALUES ('036-hide-toy-wheeled-subcategories.sql', NOW());
