-- Migration 008: Add location column to valuation_items and create inventario table
-- Executed at: Manual execution required

-- Add location column to valuation_items
ALTER TABLE valuation_items 
ADD COLUMN location VARCHAR(100) NOT NULL DEFAULT 'Polanco';

-- Create inventario table
CREATE TABLE inventario (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    quantity INTEGER NOT NULL DEFAULT 1,
    location VARCHAR(100) NOT NULL DEFAULT 'Polanco',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX idx_inventario_location ON inventario USING btree (location);

-- Add comment for documentation
COMMENT ON TABLE inventario IS 'Tabla de inventario para seguimiento de cantidades de productos por ubicación';
COMMENT ON COLUMN inventario.id IS 'ID calculado como SKU de subcategoría + número secuencial de producto';
COMMENT ON COLUMN inventario.quantity IS 'Cantidad disponible del producto en inventario';
COMMENT ON COLUMN inventario.location IS 'Ubicación física del producto (ej: Polanco)';