-- Migración 021: Crear tablas para zonas de envío y tarifas

-- Tabla de zonas de envío
CREATE TABLE IF NOT EXISTS shipping_zones (
    id SERIAL PRIMARY KEY,
    zone_name VARCHAR(100) NOT NULL UNIQUE,
    zone_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Tabla de códigos postales por zona
CREATE TABLE IF NOT EXISTS shipping_zone_postcodes (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_zone 
        FOREIGN KEY (zone_id) 
        REFERENCES shipping_zones(id) 
        ON DELETE CASCADE,
    CONSTRAINT unique_postal_code UNIQUE (postal_code)
);

-- Tabla de tarifas de envío por zona y rango de peso
CREATE TABLE IF NOT EXISTS shipping_rates (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER NOT NULL,
    weight_from NUMERIC(10, 2) NOT NULL, -- En kg
    weight_to NUMERIC(10, 2), -- NULL para sin límite superior
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_zone_rate 
        FOREIGN KEY (zone_id) 
        REFERENCES shipping_zones(id) 
        ON DELETE CASCADE,
    CONSTRAINT unique_zone_weight_range 
        UNIQUE (zone_id, weight_from, weight_to)
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_zone_postcodes_zone_id ON shipping_zone_postcodes(zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_postcodes_postal_code ON shipping_zone_postcodes(postal_code);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_zone_id ON shipping_rates(zone_id);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_weight ON shipping_rates(weight_from, weight_to);

-- Insertar las zonas de envío
INSERT INTO shipping_zones (zone_name, zone_code, description) VALUES
('CDMX', 'cdmx', 'Ciudad de México'),
('Estado de México 1', 'edomex1', 'Estado de México - Zona cercana'),
('Estado de México 2', 'edomex2', 'Estado de México - Zona lejana'),
('Nacional', 'nacional', 'Resto de la República Mexicana');

-- Insertar tarifas para CDMX
INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price) 
SELECT id, 0, 20, 95 FROM shipping_zones WHERE zone_code = 'cdmx'
UNION ALL
SELECT id, 20.01, 60, 225 FROM shipping_zones WHERE zone_code = 'cdmx'
UNION ALL
SELECT id, 60.01, 80, 495 FROM shipping_zones WHERE zone_code = 'cdmx';

-- Insertar tarifas para Estado de México 1
INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price) 
SELECT id, 0, 20, 95 FROM shipping_zones WHERE zone_code = 'edomex1'
UNION ALL
SELECT id, 20.01, 28, 150 FROM shipping_zones WHERE zone_code = 'edomex1'
UNION ALL
SELECT id, 28.01, 40, 235 FROM shipping_zones WHERE zone_code = 'edomex1'
UNION ALL
SELECT id, 40.01, 50, 235 FROM shipping_zones WHERE zone_code = 'edomex1'
UNION ALL
SELECT id, 50.01, 60, 235 FROM shipping_zones WHERE zone_code = 'edomex1'
UNION ALL
SELECT id, 60.01, 70, 1989 FROM shipping_zones WHERE zone_code = 'edomex1';

-- Insertar tarifas para Estado de México 2
INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price) 
SELECT id, 0, 9, 195 FROM shipping_zones WHERE zone_code = 'edomex2'
UNION ALL
SELECT id, 9.01, 29, 295 FROM shipping_zones WHERE zone_code = 'edomex2'
UNION ALL
SELECT id, 29.01, 40, 445 FROM shipping_zones WHERE zone_code = 'edomex2'
UNION ALL
SELECT id, 40.01, 50, 545 FROM shipping_zones WHERE zone_code = 'edomex2'
UNION ALL
SELECT id, 50.01, 60, 895 FROM shipping_zones WHERE zone_code = 'edomex2'
UNION ALL
SELECT id, 60.01, 70, 1495 FROM shipping_zones WHERE zone_code = 'edomex2';

-- Insertar tarifas Nacionales
INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price) 
SELECT id, 0, 9, 195 FROM shipping_zones WHERE zone_code = 'nacional'
UNION ALL
SELECT id, 9.01, 29, 295 FROM shipping_zones WHERE zone_code = 'nacional'
UNION ALL
SELECT id, 29.01, 40, 445 FROM shipping_zones WHERE zone_code = 'nacional'
UNION ALL
SELECT id, 40.01, 50, 545 FROM shipping_zones WHERE zone_code = 'nacional'
UNION ALL
SELECT id, 50.01, 60, 895 FROM shipping_zones WHERE zone_code = 'nacional'
UNION ALL
SELECT id, 60.01, 70, 1495 FROM shipping_zones WHERE zone_code = 'nacional';

-- Agregar campo de dirección de envío completa a online_sales si no existe
ALTER TABLE online_sales 
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS shipping_zone_id INTEGER,
ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS shipping_street VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS total_weight_grams INTEGER,
ADD CONSTRAINT fk_shipping_zone 
    FOREIGN KEY (shipping_zone_id) 
    REFERENCES shipping_zones(id) 
    ON DELETE SET NULL;

-- Comentarios de documentación
COMMENT ON TABLE shipping_zones IS 'Zonas de envío con diferentes tarifas';
COMMENT ON TABLE shipping_zone_postcodes IS 'Códigos postales asociados a cada zona de envío';
COMMENT ON TABLE shipping_rates IS 'Tarifas de envío por zona y rango de peso';
COMMENT ON COLUMN shipping_rates.weight_from IS 'Peso mínimo en kilogramos (inclusive)';
COMMENT ON COLUMN shipping_rates.weight_to IS 'Peso máximo en kilogramos (inclusive). NULL para sin límite';
COMMENT ON COLUMN online_sales.shipping_cost IS 'Costo de envío calculado para esta venta';
COMMENT ON COLUMN online_sales.total_weight_grams IS 'Peso total del pedido en gramos';