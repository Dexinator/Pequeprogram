-- Esquema de Base de Datos Consolidado para Entrepeques
-- Fecha: Generado automáticamente

-- Extensión para generar UUIDs (si el proveedor es PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================================================
-- TABLAS PRINCIPALES
-- ==================================================================================

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE categories IS 'Categorías principales sin estructura jerárquica interna';

-- Tabla de Subcategorías
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

-- Tabla de Productos Base (información general de productos)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  brand VARCHAR(50),
  model VARCHAR(50),
  age_group VARCHAR(50), -- Grupo de edad recomendado (0-3m, 3-6m, etc.)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================================================
-- TABLAS PARA SISTEMA DE VALUACIÓN
-- ==================================================================================

-- Tabla de definición de características por subcategoría
CREATE TABLE IF NOT EXISTS feature_definitions (
  id SERIAL PRIMARY KEY,
  subcategory_id INTEGER NOT NULL REFERENCES subcategories(id),
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- texto, numero, seleccion
  order_index INTEGER NOT NULL, -- orden de visualización
  options JSONB, -- opciones para tipo seleccion
  mandatory BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON COLUMN feature_definitions.mandatory IS 'Indica si esta característica es obligatoria (true) u opcional (false)';

-- Tabla de factores de valuación
CREATE TABLE IF NOT EXISTS valuation_factors (
  id SERIAL PRIMARY KEY,
  subcategory_id INTEGER NOT NULL REFERENCES subcategories(id),
  factor_type VARCHAR(50) NOT NULL, -- estado, demanda, limpieza
  factor_value VARCHAR(50) NOT NULL, -- valor (ej. "Bueno", "Alta", etc.)
  score INTEGER NOT NULL, -- puntaje asociado
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de marcas con renombre
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  subcategory_id INTEGER REFERENCES subcategories(id),
  renown VARCHAR(20) NOT NULL, -- Sencilla, Normal, Alta, Premium
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de clientes
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

-- Tabla de valuaciones
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

-- Tabla de items de valuación
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
  online_store_ready BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON COLUMN valuation_items.online_store_ready IS 'Indica si el producto ya ha sido preparado para su publicación en la tienda en línea (fotos, peso, etc.)';

-- ==================================================================================
-- ÍNDICES
-- ==================================================================================

-- Índices para subcategorías
CREATE INDEX IF NOT EXISTS idx_subcategories_category 
ON subcategories(category_id);

-- Índices para definiciones de características
CREATE INDEX IF NOT EXISTS idx_feature_definitions_subcategory
ON feature_definitions(subcategory_id);

-- Índices para factores de valuación
CREATE INDEX IF NOT EXISTS idx_valuation_factors 
ON valuation_factors(subcategory_id, factor_type, factor_value);

-- Índices para marcas
CREATE INDEX IF NOT EXISTS idx_brands_subcategory
ON brands(subcategory_id);

-- Índices para valuaciones
CREATE INDEX IF NOT EXISTS idx_valuations_client
ON valuations(client_id);

CREATE INDEX IF NOT EXISTS idx_valuations_user
ON valuations(user_id);

CREATE INDEX IF NOT EXISTS idx_valuations_date
ON valuations(valuation_date);

CREATE INDEX IF NOT EXISTS idx_valuations_status
ON valuations(status);

-- Índices para items de valuación
CREATE INDEX IF NOT EXISTS idx_valuation_items_valuation
ON valuation_items(valuation_id);

CREATE INDEX IF NOT EXISTS idx_valuation_items_category
ON valuation_items(category_id);

CREATE INDEX IF NOT EXISTS idx_valuation_items_subcategory
ON valuation_items(subcategory_id);

-- ==================================================================================
-- DATOS INICIALES
-- ==================================================================================

-- Insertar roles básicos
INSERT INTO roles (name, description) 
VALUES 
  ('admin', 'Administrador con acceso completo al sistema'),
  ('manager', 'Gerente con acceso a la mayoría de las funciones'),
  ('valuator', 'Usuario que puede valorar artículos'),
  ('sales', 'Usuario de ventas')
ON CONFLICT (name) DO NOTHING;

-- Insertar usuario administrador por defecto (password: admin123)
-- En producción, cambiar esta contraseña inmediatamente
INSERT INTO users (role_id, username, email, password_hash, first_name, last_name)
VALUES (
  (SELECT id FROM roles WHERE name = 'admin'),
  'admin',
  'admin@entrepeques.com',
  '$2b$10$X/QX5KNLsBGP.JFRJxR7aO8FtNB2jBjzTOWKvM7MR66fABlcEbYhy', -- hash de 'admin123'
  'Admin',
  'User'
) ON CONFLICT (username) DO NOTHING;

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
  (3, 'Parques', 'MPA', 0.25, 0.45, 0.40, 0.55)
ON CONFLICT DO NOTHING;

-- Datos de ejemplo para factores de valuación
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
  (5, 'limpieza', 'Mala', -8)
ON CONFLICT DO NOTHING;

-- Datos de ejemplo para marcas
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('Carter\'s', 1, 'Alta'),
  ('GAP', 1, 'Alta'),
  ('H&M', 1, 'Normal'),
  ('Zara', 1, 'Alta'),
  ('Genérica', 1, 'Sencilla'),
  ('Fisher-Price', 5, 'Premium'),
  ('Chicco', 5, 'Premium'),
  ('Playskool', 5, 'Alta'),
  ('Mattel', 5, 'Alta'),
  ('Genérica', 5, 'Sencilla'),
  ('Ikea', 9, 'Normal'),
  ('Micuna', 9, 'Premium'),
  ('Alondra', 9, 'Alta'),
  ('Genérica', 9, 'Sencilla')
ON CONFLICT DO NOTHING;

-- Datos de ejemplo para feature_definitions
INSERT INTO feature_definitions (subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
  -- Features para Ropa (0-6 meses)
  (1, 'size', 'Talla', 'seleccion', 1, '["Prematuro", "Recién nacido", "0-3 meses", "3-6 meses"]', TRUE),
  (1, 'color', 'Color', 'texto', 2, null, TRUE),
  (1, 'season', 'Temporada', 'seleccion', 3, '["Invierno", "Verano", "Media estación"]', TRUE),
  (1, 'material', 'Material', 'texto', 4, null, FALSE),
  
  -- Features para Juguetes didácticos
  (5, 'age_range', 'Edad recomendada', 'seleccion', 1, '["0-12 meses", "1-3 años", "3-5 años", "5+ años"]', TRUE),
  (5, 'material', 'Material', 'seleccion', 2, '["Plástico", "Madera", "Tela", "Mixto"]', FALSE),
  (5, 'batteries', '¿Usa pilas?', 'seleccion', 3, '["Sí", "No"]', FALSE),
  (5, 'complete', '¿Completo?', 'seleccion', 4, '["Completo", "Faltan piezas"]', TRUE)
ON CONFLICT DO NOTHING; 