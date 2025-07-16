-- Migration 018: Add online store fields to valuation_items
-- Adds weight and online store price fields (uses existing images column)

-- Add weight column (in grams)
ALTER TABLE valuation_items 
ADD COLUMN weight_grams INTEGER;

-- Add online store price column
ALTER TABLE valuation_items 
ADD COLUMN online_price NUMERIC(10,2);

-- Add prepared by user tracking
ALTER TABLE valuation_items 
ADD COLUMN online_prepared_by INTEGER;

-- Add prepared date tracking
ALTER TABLE valuation_items 
ADD COLUMN online_prepared_at TIMESTAMP WITHOUT TIME ZONE;

-- Add foreign key constraint for prepared_by
ALTER TABLE valuation_items
ADD CONSTRAINT fk_online_prepared_by
FOREIGN KEY (online_prepared_by) REFERENCES users(id)
ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_valuation_items_online_store_ready 
ON valuation_items(online_store_ready) 
WHERE online_store_ready = true;

-- Create index for unprepared items
CREATE INDEX idx_valuation_items_not_ready 
ON valuation_items(online_store_ready, id) 
WHERE online_store_ready = false;

-- Add helpful comments
COMMENT ON COLUMN valuation_items.weight_grams IS 'Peso del producto en gramos para cálculo de envío';
COMMENT ON COLUMN valuation_items.online_price IS 'Precio de venta en la tienda en línea (puede diferir del precio sugerido)';
COMMENT ON COLUMN valuation_items.online_prepared_by IS 'Usuario que preparó el producto para la tienda en línea';
COMMENT ON COLUMN valuation_items.online_prepared_at IS 'Fecha y hora en que se preparó el producto para la tienda';