-- Migración 023: Agregar campo weight_kg para facilitar manejo de pesos

-- Agregar columna weight_kg a valuation_items
ALTER TABLE valuation_items 
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(10, 3);

-- Crear una columna calculada virtual o actualizar los valores existentes
-- Actualizar registros existentes con peso en gramos a kilogramos
UPDATE valuation_items 
SET weight_kg = ROUND(weight_grams::numeric / 1000, 3)
WHERE weight_grams IS NOT NULL AND weight_grams > 0;

-- Agregar comentario explicativo
COMMENT ON COLUMN valuation_items.weight_kg IS 'Peso del producto en kilogramos (calculado desde weight_grams)';
COMMENT ON COLUMN valuation_items.weight_grams IS 'Peso del producto en gramos (campo original, se mantiene por compatibilidad)';

-- Crear función para sincronizar automáticamente weight_kg cuando se actualiza weight_grams
CREATE OR REPLACE FUNCTION sync_weight_kg()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.weight_grams IS NOT NULL THEN
        NEW.weight_kg = ROUND(NEW.weight_grams::numeric / 1000, 3);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para sincronizar weight_kg automáticamente
DROP TRIGGER IF EXISTS sync_weight_kg_trigger ON valuation_items;
CREATE TRIGGER sync_weight_kg_trigger
BEFORE INSERT OR UPDATE OF weight_grams ON valuation_items
FOR EACH ROW
EXECUTE FUNCTION sync_weight_kg();

-- Crear función inversa para sincronizar weight_grams cuando se actualiza weight_kg
CREATE OR REPLACE FUNCTION sync_weight_grams()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.weight_kg IS NOT NULL AND (OLD.weight_kg IS NULL OR NEW.weight_kg != OLD.weight_kg) THEN
        NEW.weight_grams = ROUND(NEW.weight_kg * 1000);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para sincronizar weight_grams cuando se actualiza weight_kg
DROP TRIGGER IF EXISTS sync_weight_grams_trigger ON valuation_items;
CREATE TRIGGER sync_weight_grams_trigger
BEFORE INSERT OR UPDATE OF weight_kg ON valuation_items
FOR EACH ROW
EXECUTE FUNCTION sync_weight_grams();

-- Índice para consultas por peso
CREATE INDEX IF NOT EXISTS idx_valuation_items_weight_kg ON valuation_items(weight_kg) 
WHERE weight_kg IS NOT NULL;