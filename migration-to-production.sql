-- Script de migración para sincronizar producción con el esquema local
-- Fecha: 2025-01-17

-- ====================================================================
-- MIGRACIÓN 025: Crear tablas para ventas online con MercadoPago
-- ====================================================================

-- Crear tabla de ventas online
CREATE TABLE IF NOT EXISTS online_sales (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(50) UNIQUE NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    shipping_address JSONB,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    -- Campos adicionales para envío
    shipping_cost NUMERIC(10,2),
    shipping_zone_id INTEGER,
    shipping_postal_code VARCHAR(10),
    shipping_street VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    total_weight_grams INTEGER
);

-- Crear tabla de items de venta online
CREATE TABLE IF NOT EXISTS online_sale_items (
    id SERIAL PRIMARY KEY,
    online_sale_id INTEGER NOT NULL,
    valuation_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Comentarios de documentación
COMMENT ON TABLE online_sales IS 'Tabla para almacenar ventas realizadas a través de la tienda online con MercadoPago';
COMMENT ON COLUMN online_sales.payment_id IS 'ID único del pago generado por MercadoPago';
COMMENT ON COLUMN online_sales.shipping_address IS 'Dirección de envío en formato JSON si aplica';
COMMENT ON COLUMN online_sales.payment_status IS 'Estado del pago: approved, pending, rejected, etc.';
COMMENT ON COLUMN online_sales.shipping_cost IS 'Costo de envío calculado para esta venta';
COMMENT ON COLUMN online_sales.total_weight_grams IS 'Peso total del pedido en gramos';

COMMENT ON TABLE online_sale_items IS 'Detalle de productos vendidos en cada venta online';
COMMENT ON COLUMN online_sale_items.valuation_item_id IS 'Referencia al producto del inventario vendido';

-- Registrar migración
INSERT INTO migrations (name, executed_at) VALUES ('025-create-online-sales-tables.sql', NOW());

-- ====================================================================
-- MIGRACIÓN 026: Sistema de zonas y tarifas de envío
-- ====================================================================

-- Crear tabla de zonas de envío
CREATE TABLE IF NOT EXISTS shipping_zones (
    id SERIAL PRIMARY KEY,
    zone_name VARCHAR(100) UNIQUE NOT NULL,
    zone_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Crear tabla de códigos postales por zona
CREATE TABLE IF NOT EXISTS shipping_zone_postcodes (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_postal_code UNIQUE (postal_code)
);

-- Crear tabla de tarifas de envío
CREATE TABLE IF NOT EXISTS shipping_rates (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER NOT NULL,
    weight_from NUMERIC(10,2) NOT NULL,
    weight_to NUMERIC(10,2),
    price NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_zone_weight_range UNIQUE (zone_id, weight_from, weight_to)
);

-- Comentarios de documentación
COMMENT ON TABLE shipping_zones IS 'Zonas de envío con diferentes tarifas';
COMMENT ON TABLE shipping_zone_postcodes IS 'Códigos postales asociados a cada zona de envío';
COMMENT ON TABLE shipping_rates IS 'Tarifas de envío por zona y rango de peso';
COMMENT ON COLUMN shipping_rates.weight_from IS 'Peso mínimo en kilogramos (inclusive)';
COMMENT ON COLUMN shipping_rates.weight_to IS 'Peso máximo en kilogramos (inclusive). NULL para sin límite';

-- Crear Foreign Keys
ALTER TABLE ONLY online_sale_items
    ADD CONSTRAINT fk_online_sale FOREIGN KEY (online_sale_id) 
    REFERENCES online_sales(id) ON DELETE CASCADE;

ALTER TABLE ONLY online_sale_items
    ADD CONSTRAINT fk_valuation_item FOREIGN KEY (valuation_item_id) 
    REFERENCES valuation_items(id);

ALTER TABLE ONLY online_sales
    ADD CONSTRAINT fk_shipping_zone FOREIGN KEY (shipping_zone_id) 
    REFERENCES shipping_zones(id) ON DELETE SET NULL;

ALTER TABLE ONLY shipping_zone_postcodes
    ADD CONSTRAINT fk_zone FOREIGN KEY (zone_id) 
    REFERENCES shipping_zones(id) ON DELETE CASCADE;

ALTER TABLE ONLY shipping_rates
    ADD CONSTRAINT fk_zone_rate FOREIGN KEY (zone_id) 
    REFERENCES shipping_zones(id) ON DELETE CASCADE;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_online_sales_payment_id ON online_sales(payment_id);
CREATE INDEX IF NOT EXISTS idx_online_sales_customer_email ON online_sales(customer_email);
CREATE INDEX IF NOT EXISTS idx_online_sales_payment_date ON online_sales(payment_date);
CREATE INDEX IF NOT EXISTS idx_online_sales_payment_status ON online_sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_online_sale_items_sale_id ON online_sale_items(online_sale_id);
CREATE INDEX IF NOT EXISTS idx_online_sale_items_valuation_item_id ON online_sale_items(valuation_item_id);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_zone_id ON shipping_rates(zone_id);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_weight ON shipping_rates(weight_from, weight_to);
CREATE INDEX IF NOT EXISTS idx_zone_postcodes_zone_id ON shipping_zone_postcodes(zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_postcodes_postal_code ON shipping_zone_postcodes(postal_code);

-- Insertar datos de zonas de envío
INSERT INTO shipping_zones (zone_name, zone_code, description) VALUES
('Local - Querétaro', 'LOCAL_QRO', 'Envíos dentro de la ciudad de Querétaro y zonas conurbadas'),
('Zona 1 - Centro', 'ZONE_1', 'Estados del centro de México'),
('Zona 2 - Norte', 'ZONE_2', 'Estados del norte de México'),
('Zona 3 - Sur', 'ZONE_3', 'Estados del sur de México'),
('Recogida en tienda', 'PICKUP', 'Cliente recoge en tienda física')
ON CONFLICT (zone_name) DO NOTHING;

-- Insertar tarifas de envío por zona
-- Zona Local - Querétaro
INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 0, 1, 89 FROM shipping_zones WHERE zone_code = 'LOCAL_QRO'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 1.01, 5, 119 FROM shipping_zones WHERE zone_code = 'LOCAL_QRO'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 5.01, 10, 149 FROM shipping_zones WHERE zone_code = 'LOCAL_QRO'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 10.01, NULL, 189 FROM shipping_zones WHERE zone_code = 'LOCAL_QRO'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

-- Zona 1 - Centro
INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 0, 1, 119 FROM shipping_zones WHERE zone_code = 'ZONE_1'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 1.01, 5, 159 FROM shipping_zones WHERE zone_code = 'ZONE_1'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 5.01, 10, 199 FROM shipping_zones WHERE zone_code = 'ZONE_1'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 10.01, NULL, 249 FROM shipping_zones WHERE zone_code = 'ZONE_1'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

-- Zona 2 - Norte
INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 0, 1, 149 FROM shipping_zones WHERE zone_code = 'ZONE_2'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 1.01, 5, 199 FROM shipping_zones WHERE zone_code = 'ZONE_2'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 5.01, 10, 249 FROM shipping_zones WHERE zone_code = 'ZONE_2'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 10.01, NULL, 299 FROM shipping_zones WHERE zone_code = 'ZONE_2'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

-- Zona 3 - Sur
INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 0, 1, 159 FROM shipping_zones WHERE zone_code = 'ZONE_3'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 1.01, 5, 209 FROM shipping_zones WHERE zone_code = 'ZONE_3'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 5.01, 10, 259 FROM shipping_zones WHERE zone_code = 'ZONE_3'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 10.01, NULL, 319 FROM shipping_zones WHERE zone_code = 'ZONE_3'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

-- Recogida en tienda (tarifa $0)
INSERT INTO shipping_rates (zone_id, weight_from, weight_to, price)
SELECT id, 0, NULL, 0 FROM shipping_zones WHERE zone_code = 'PICKUP'
ON CONFLICT (zone_id, weight_from, weight_to) DO NOTHING;

-- Registrar migración
INSERT INTO migrations (name, executed_at) VALUES ('026-shipping-zones-and-rates.sql', NOW());

-- ====================================================================
-- MIGRACIÓN 027: Cargar códigos postales
-- ====================================================================

-- Códigos postales de Querétaro (zona local)
INSERT INTO shipping_zone_postcodes (zone_id, postal_code)
SELECT sz.id, cp.postal_code FROM shipping_zones sz
CROSS JOIN (VALUES 
    ('76000'), ('76010'), ('76020'), ('76030'), ('76040'),
    ('76050'), ('76060'), ('76070'), ('76080'), ('76090'),
    ('76100'), ('76110'), ('76113'), ('76114'), ('76115'),
    ('76116'), ('76117'), ('76118'), ('76120'), ('76125'),
    ('76130'), ('76134'), ('76135'), ('76136'), ('76137'),
    ('76138'), ('76139'), ('76140'), ('76146'), ('76147'),
    ('76148'), ('76150'), ('76154'), ('76158'), ('76159'),
    ('76160'), ('76167'), ('76168'), ('76169'), ('76170'),
    ('76175'), ('76176'), ('76177'), ('76178'), ('76179'),
    ('76180'), ('76190'), ('76220'), ('76226'), ('76227'),
    ('76228'), ('76229'), ('76230'), ('76233'), ('76235'),
    ('76237'), ('76238'), ('76239'), ('76240'), ('76243'),
    ('76246'), ('76247'), ('76248'), ('76249'), ('76250'),
    ('76269'), ('76270')
) AS cp(postal_code)
WHERE sz.zone_code = 'LOCAL_QRO'
ON CONFLICT (postal_code) DO NOTHING;

-- Códigos postales de Zona 1 - Centro (algunos ejemplos)
INSERT INTO shipping_zone_postcodes (zone_id, postal_code)
SELECT sz.id, cp.postal_code FROM shipping_zones sz
CROSS JOIN (VALUES 
    -- Estado de México
    ('50000'), ('51000'), ('52000'), ('53000'), ('54000'),
    -- Hidalgo
    ('42000'), ('43000'),
    -- Morelos
    ('62000'),
    -- Puebla
    ('72000'), ('73000'), ('74000'),
    -- Tlaxcala
    ('90000')
) AS cp(postal_code)
WHERE sz.zone_code = 'ZONE_1'
ON CONFLICT (postal_code) DO NOTHING;

-- Códigos postales de Zona 2 - Norte (algunos ejemplos)
INSERT INTO shipping_zone_postcodes (zone_id, postal_code)
SELECT sz.id, cp.postal_code FROM shipping_zones sz
CROSS JOIN (VALUES 
    -- Nuevo León
    ('64000'), ('66000'),
    -- Chihuahua
    ('31000'), ('32000'),
    -- Coahuila
    ('25000'), ('26000'),
    -- Tamaulipas
    ('87000'), ('88000'),
    -- Sonora
    ('83000'), ('84000')
) AS cp(postal_code)
WHERE sz.zone_code = 'ZONE_2'
ON CONFLICT (postal_code) DO NOTHING;

-- Códigos postales de Zona 3 - Sur (algunos ejemplos)
INSERT INTO shipping_zone_postcodes (zone_id, postal_code)
SELECT sz.id, cp.postal_code FROM shipping_zones sz
CROSS JOIN (VALUES 
    -- Oaxaca
    ('68000'), ('70000'),
    -- Chiapas
    ('29000'), ('30000'),
    -- Yucatán
    ('97000'),
    -- Quintana Roo
    ('77000'),
    -- Campeche
    ('24000')
) AS cp(postal_code)
WHERE sz.zone_code = 'ZONE_3'
ON CONFLICT (postal_code) DO NOTHING;

-- Registrar migración
INSERT INTO migrations (name, executed_at) VALUES ('027-load-postal-codes.sql', NOW());

-- ====================================================================
-- MIGRACIÓN 028: Agregar campo weight_kg a valuation_items
-- ====================================================================

-- Agregar el campo weight_kg a la tabla valuation_items
ALTER TABLE valuation_items
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(10,3);

-- Añadir comentario descriptivo
COMMENT ON COLUMN valuation_items.weight_kg IS 'Peso del producto en kilogramos para cálculo de envío';

-- Crear índice para consultas de productos por peso
CREATE INDEX IF NOT EXISTS idx_valuation_items_weight_kg
ON valuation_items(weight_kg)
WHERE weight_kg IS NOT NULL;

-- Actualizar algunos productos con pesos estimados basados en la categoría
-- (Esto es opcional y se puede ajustar según los datos reales)
UPDATE valuation_items vi
SET weight_kg = CASE 
    WHEN sc.name ILIKE '%carreola%' OR sc.name ILIKE '%carriola%' THEN 8.5
    WHEN sc.name ILIKE '%cuna%' THEN 15.0
    WHEN sc.name ILIKE '%silla auto%' OR sc.name ILIKE '%autoasiento%' THEN 6.0
    WHEN sc.name ILIKE '%periquera%' THEN 7.0
    WHEN sc.name ILIKE '%corral%' THEN 10.0
    WHEN sc.name ILIKE '%mecedora%' THEN 5.0
    WHEN sc.name ILIKE '%andadera%' THEN 3.5
    WHEN sc.name ILIKE '%bicicleta%' THEN 12.0
    WHEN sc.name ILIKE '%triciclo%' THEN 4.5
    WHEN sc.name ILIKE '%montable%' THEN 3.0
    WHEN sc.name ILIKE '%ropa%' OR sc.name ILIKE '%calzado%' THEN 0.3
    WHEN sc.name ILIKE '%juguete%' THEN 0.5
    WHEN sc.name ILIKE '%libro%' THEN 0.4
    WHEN sc.name ILIKE '%pañalera%' THEN 0.8
    ELSE 1.0 -- Peso por defecto para productos sin categoría específica
END
FROM subcategories sc
WHERE vi.subcategory_id = sc.id
AND vi.weight_kg IS NULL
AND vi.online_store_ready = true;

-- Registrar migración
INSERT INTO migrations (name, executed_at) VALUES ('028-add-weight-kg-field.sql', NOW());

-- ====================================================================
-- Verificación final
-- ====================================================================
SELECT 'Migración completada exitosamente. Tablas creadas:' AS status
UNION ALL
SELECT '- online_sales'
UNION ALL
SELECT '- online_sale_items'
UNION ALL
SELECT '- shipping_zones'
UNION ALL
SELECT '- shipping_zone_postcodes'
UNION ALL
SELECT '- shipping_rates'
UNION ALL
SELECT 'Campos agregados:'
UNION ALL
SELECT '- valuation_items.weight_kg';