-- Migración 002: Esquema para Sistema de Valuación
-- Fecha: Mayo 26, 2025

-- Agregar tabla de subcategorías
CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(20) NOT NULL, -- Prefijo SKU utilizado para generar códigos de producto
  gap_new DECIMAL(5,2) NOT NULL, -- GAP para productos nuevos. Se usa para calcular el precio de venta
  gap_used DECIMAL(5,2) NOT NULL, -- GAP para productos usados. Se usa para calcular el precio de venta
  margin_new DECIMAL(5,2) NOT NULL, -- Margen para productos nuevos. Se usa para calcular el precio de compra
  margin_used DECIMAL(5,2) NOT NULL, -- Margen para productos usados. Se usa para calcular el precio de compra
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para búsqueda por categoría
CREATE INDEX IF NOT EXISTS idx_subcategories_category 
ON subcategories(category_id);

-- Agregar tabla de definición de características por subcategoría
CREATE TABLE IF NOT EXISTS feature_definitions (
  id SERIAL PRIMARY KEY,
  subcategory_id INTEGER NOT NULL REFERENCES subcategories(id),
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- texto, numero, seleccion
  order_index INTEGER NOT NULL, -- orden de visualización
  options JSONB, -- opciones para tipo seleccion
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para búsqueda por subcategoría
CREATE INDEX IF NOT EXISTS idx_feature_definitions_subcategory
ON feature_definitions(subcategory_id);

-- Agregar tabla de factores de valuación
CREATE TABLE IF NOT EXISTS valuation_factors (
  id SERIAL PRIMARY KEY,
  subcategory_id INTEGER NOT NULL REFERENCES subcategories(id),
  factor_type VARCHAR(50) NOT NULL, -- estado, demanda, limpieza
  factor_value VARCHAR(50) NOT NULL, -- valor (ej. "Bueno", "Alta", etc.)
  score INTEGER NOT NULL, -- puntaje asociado
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice compuesto para búsqueda eficiente de factores
CREATE INDEX IF NOT EXISTS idx_valuation_factors 
ON valuation_factors(subcategory_id, factor_type, factor_value);

-- Agregar tabla de marcas con renombre
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  subcategory_id INTEGER REFERENCES subcategories(id),
  renown VARCHAR(20) NOT NULL, -- Sencilla, Normal, Alta, Premium
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para búsqueda por categoría
CREATE INDEX IF NOT EXISTS idx_brands_category
ON brands(category_id);

-- Agregar tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  identification VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT uk_clients_phone UNIQUE (phone)
);

-- Agregar tabla de valuaciones
CREATE TABLE IF NOT EXISTS valuations (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  valuation_date TIMESTAMP DEFAULT NOW(),
  total_purchase_amount DECIMAL(10,2),
  total_consignment_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_valuations_client
ON valuations(client_id);

CREATE INDEX IF NOT EXISTS idx_valuations_user
ON valuations(user_id);

CREATE INDEX IF NOT EXISTS idx_valuations_date
ON valuations(valuation_date);

CREATE INDEX IF NOT EXISTS idx_valuations_status
ON valuations(status);

-- Agregar tabla de items de valuación
CREATE TABLE IF NOT EXISTS valuation_items (
  id SERIAL PRIMARY KEY,
  valuation_id INTEGER NOT NULL REFERENCES valuations(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  subcategory_id INTEGER NOT NULL REFERENCES subcategories(id),
  brand_id INTEGER REFERENCES brands(id),
  status VARCHAR(50) NOT NULL, -- Nuevo, Usado como nuevo, etc.
  brand_renown VARCHAR(20) NOT NULL, -- Sencilla, Normal, Alta, Premium
  modality VARCHAR(20) NOT NULL, -- compra directa, consignación
  condition_state VARCHAR(20) NOT NULL, -- excelente, bueno, regular
  demand VARCHAR(20) NOT NULL, -- alta, media, baja
  cleanliness VARCHAR(20) NOT NULL, -- buena, regular, mala
  features JSONB, -- características específicas
  new_price DECIMAL(10,2) NOT NULL, -- precio nuevo de referencia
  purchase_score INTEGER, -- puntaje calculado para compra
  sale_score INTEGER, -- puntaje calculado para venta
  suggested_purchase_price DECIMAL(10,2), -- precio de compra sugerido
  suggested_sale_price DECIMAL(10,2), -- precio de venta sugerido
  final_purchase_price DECIMAL(10,2), -- precio de compra final
  final_sale_price DECIMAL(10,2), -- precio de venta final
  consignment_price DECIMAL(10,2), -- precio en caso de consignación
  images JSONB, -- URLs de imágenes
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_valuation_items_valuation
ON valuation_items(valuation_id);

CREATE INDEX IF NOT EXISTS idx_valuation_items_category
ON valuation_items(category_id);

CREATE INDEX IF NOT EXISTS idx_valuation_items_subcategory
ON valuation_items(subcategory_id);

-- Datos de ejemplo para subcategorías
INSERT INTO subcategories (category_id, name, sku, gap_new, gap_used, margin_new, margin_used)
VALUES 
  (1, 'Ropa (0-6 meses)', 'RB06', 0.15, 0.40, 0.35, 0.50),
  (1, 'Ropa (6-12 meses)', 'RB12', 0.15, 0.40, 0.35, 0.50),
  (1, 'Ropa (1-3 años)', 'RN13', 0.15, 0.45, 0.35, 0.55),
  (1, 'Ropa (3+ años)', 'RN3P', 0.15, 0.45, 0.35, 0.55),
  (2, 'Juguetes didácticos', 'JDI', 0.20, 0.50, 0.40, 0.60),
  (2, 'Muñecas y figuras', 'JMF', 0.20, 0.55, 0.40, 0.65),
  (2, 'Juegos de mesa', 'JME', 0.25, 0.60, 0.45, 0.70),
  (2, 'Vehículos y pistas', 'JVP', 0.25, 0.55, 0.45, 0.65),
  (3, 'Cunas', 'MCU', 0.30, 0.50, 0.45, 0.60),
  (3, 'Moisés', 'MMO', 0.25, 0.45, 0.40, 0.55),
  (3, 'Cómodas', 'MCO', 0.30, 0.50, 0.45, 0.60),
  (3, 'Parques', 'MPA', 0.25, 0.45, 0.40, 0.55);

-- Datos de ejemplo para factores de valuación (para una subcategoría)
INSERT INTO valuation_factors (subcategory_id, factor_type, factor_value, score)
VALUES
  -- Factores para subcategoría 1 (Ropa 0-6 meses)
  (1, 'estado', 'Excelente', 10),
  (1, 'estado', 'Bueno', 5),
  (1, 'estado', 'Regular', 0),
  (1, 'demanda', 'Alta', 10),
  (1, 'demanda', 'Media', 5),
  (1, 'demanda', 'Baja', 0),
  (1, 'limpieza', 'Buena', 5),
  (1, 'limpieza', 'Regular', 0),
  (1, 'limpieza', 'Mala', -5),
  
  -- Factores para subcategoría 5 (Juguetes didácticos)
  (5, 'estado', 'Excelente', 15),
  (5, 'estado', 'Bueno', 8),
  (5, 'estado', 'Regular', 0),
  (5, 'demanda', 'Alta', 12),
  (5, 'demanda', 'Media', 6),
  (5, 'demanda', 'Baja', 0),
  (5, 'limpieza', 'Buena', 8),
  (5, 'limpieza', 'Regular', 0),
  (5, 'limpieza', 'Mala', -8);

-- Datos de ejemplo para marcas
INSERT INTO brands (name, category_id, renown)
VALUES
  ('Carter\'s', 1, 'Alta'),
  ('GAP', 1, 'Alta'),
  ('H&M', 1, 'Normal'),
  ('Zara', 1, 'Alta'),
  ('Genérica', 1, 'Sencilla'),
  ('Fisher-Price', 2, 'Premium'),
  ('Chicco', 2, 'Premium'),
  ('Playskool', 2, 'Alta'),
  ('Mattel', 2, 'Alta'),
  ('Genérica', 2, 'Sencilla'),
  ('Ikea', 3, 'Normal'),
  ('Micuna', 3, 'Premium'),
  ('Alondra', 3, 'Alta'),
  ('Genérica', 3, 'Sencilla');

-- Datos de ejemplo para feature_definitions
INSERT INTO feature_definitions (subcategory_id, name, display_name, type, order_index, options)
VALUES
  -- Features para Ropa (0-6 meses)
  (1, 'size', 'Talla', 'seleccion', 1, '["Prematuro", "Recién nacido", "0-3 meses", "3-6 meses"]'),
  (1, 'color', 'Color', 'texto', 2, null),
  (1, 'season', 'Temporada', 'seleccion', 3, '["Invierno", "Verano", "Media estación"]'),
  (1, 'material', 'Material', 'texto', 4, null),
  
  -- Features para Juguetes didácticos
  (5, 'age_range', 'Edad recomendada', 'seleccion', 1, '["0-12 meses", "1-3 años", "3-5 años", "5+ años"]'),
  (5, 'material', 'Material', 'seleccion', 2, '["Plástico", "Madera", "Tela", "Mixto"]'),
  (5, 'batteries', '¿Usa pilas?', 'seleccion', 3, '["Sí", "No"]'),
  (5, 'complete', '¿Completo?', 'seleccion', 4, '["Completo", "Faltan piezas"]'); 