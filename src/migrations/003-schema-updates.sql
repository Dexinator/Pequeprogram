-- Migración 003: Actualizaciones al Esquema para Valuación
-- Fecha: Junio 2, 2025

-- Añadir columna mandatory a feature_definitions
ALTER TABLE feature_definitions 
ADD COLUMN mandatory BOOLEAN DEFAULT FALSE;

-- Añadir columna para tracking de preparación para tienda en línea
ALTER TABLE valuation_items 
ADD COLUMN online_store_ready BOOLEAN DEFAULT FALSE;

-- Comentarios explicativos
COMMENT ON COLUMN feature_definitions.mandatory IS 'Indica si esta característica es obligatoria (true) u opcional (false)';
COMMENT ON COLUMN valuation_items.online_store_ready IS 'Indica si el producto ya ha sido preparado para su publicación en la tienda en línea (fotos, peso, etc.)';

-- Actualizar las características existentes para definir cuáles son obligatorias
-- Ejemplo: Suponiendo que talla, color y temporada son obligatorios para la subcategoría 1 (ropa 0-6 meses)
UPDATE feature_definitions
SET mandatory = TRUE
WHERE subcategory_id = 1 
AND name IN ('size', 'color', 'season');

-- Ejemplo: Suponiendo que edad recomendada y si está completo son obligatorios para subcategoría 5 (juguetes)
UPDATE feature_definitions
SET mandatory = TRUE
WHERE subcategory_id = 5
AND name IN ('age_range', 'complete'); 