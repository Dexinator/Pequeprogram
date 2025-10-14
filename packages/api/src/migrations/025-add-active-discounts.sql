-- Migration 025: Add active_discounts table for simple percentage and fixed amount discounts
-- Created: 2025-01-14
-- Purpose: Support simple discounts for categories and subcategories

-- Create active_discounts table
CREATE TABLE IF NOT EXISTS active_discounts (
  id SERIAL PRIMARY KEY,

  -- Identificación del descuento
  name VARCHAR(100) NOT NULL,
  description TEXT,

  -- Alcance del descuento (uno de los dos debe ser NULL)
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE CASCADE,

  -- Tipo y valor del descuento
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage' o 'fixed_amount'
  discount_value NUMERIC(10,2) NOT NULL,

  -- Control de vigencia
  start_date TIMESTAMP WITHOUT TIME ZONE,
  end_date TIMESTAMP WITHOUT TIME ZONE,
  is_active BOOLEAN DEFAULT true,

  -- Prioridad (número más alto = mayor prioridad)
  priority INTEGER DEFAULT 0,

  -- Auditoría
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT check_discount_scope CHECK (
    (category_id IS NOT NULL AND subcategory_id IS NULL) OR
    (category_id IS NULL AND subcategory_id IS NOT NULL)
  ),
  CONSTRAINT check_discount_value CHECK (discount_value > 0),
  CONSTRAINT check_percentage_max CHECK (
    discount_type != 'percentage' OR discount_value <= 100
  ),
  CONSTRAINT check_dates CHECK (
    start_date IS NULL OR end_date IS NULL OR end_date > start_date
  )
);

-- Índices para performance
CREATE INDEX idx_active_discounts_category ON active_discounts(category_id)
WHERE is_active = true;

CREATE INDEX idx_active_discounts_subcategory ON active_discounts(subcategory_id)
WHERE is_active = true;

CREATE INDEX idx_active_discounts_dates ON active_discounts(start_date, end_date)
WHERE is_active = true;

CREATE INDEX idx_active_discounts_active ON active_discounts(is_active, priority DESC);

-- Insertar descuentos iniciales
INSERT INTO active_discounts (
  name,
  description,
  category_id,
  subcategory_id,
  discount_type,
  discount_value,
  start_date,
  end_date,
  is_active,
  priority
) VALUES
-- Descuento 20% en Andaderas
(
  'Promoción Andaderas 20% OFF',
  'Descuento especial del 20% en todas las andaderas por temporada',
  NULL,
  52, -- subcategory_id para Andaderas
  'percentage',
  20.00,
  NOW(),
  NULL, -- Sin fecha de fin (desactivar manualmente)
  true,
  1
),
-- Descuento 15% en categoría A dormir
(
  'Categoría A Dormir 15% OFF',
  'Descuento del 15% en todos los productos para dormir',
  2, -- category_id para A dormir
  NULL,
  'percentage',
  15.00,
  NOW(),
  NULL, -- Sin fecha de fin (desactivar manualmente)
  true,
  1
);

-- Comentarios útiles para administración
COMMENT ON TABLE active_discounts IS 'Tabla para gestión de descuentos simples por categoría o subcategoría';
COMMENT ON COLUMN active_discounts.discount_type IS 'Tipo de descuento: percentage (porcentaje) o fixed_amount (monto fijo)';
COMMENT ON COLUMN active_discounts.discount_value IS 'Valor del descuento: 20 para 20% o 100 para $100 de descuento';
COMMENT ON COLUMN active_discounts.is_active IS 'Control manual para activar/desactivar el descuento';
COMMENT ON COLUMN active_discounts.priority IS 'Prioridad del descuento: mayor número = mayor prioridad cuando hay conflictos';