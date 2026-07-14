-- Migration: 038-hide-ajugar-wheeled-duplicates.sql
-- Description: En producción existen subcategorías DUPLICADAS: "Sobre ruedas" y
--   "Triciclos y bicicletas" aparecen tanto en "A pasear" (category_id=1) como en
--   "A jugar" (category_id=6). Pablo pidió quitarlas de "Juguetes" (A jugar) dejándolas
--   solo en "A pasear". Se ocultan (is_active=FALSE, NO se borran) las versiones que
--   cuelgan de "A jugar", identificándolas por nombre + categoría. Es no-op en entornos
--   donde no existen esos duplicados (p. ej. staging).
-- Date: 2026-07-13

UPDATE subcategories SET is_active = FALSE
WHERE category_id = 6
  AND lower(name) IN ('sobre ruedas', 'triciclos y bicicletas');

-- Migration record
INSERT INTO migrations (name, executed_at) VALUES ('038-hide-ajugar-wheeled-duplicates.sql', NOW());
