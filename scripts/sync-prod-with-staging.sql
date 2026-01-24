-- =============================================================================
-- Script para sincronizar PRODUCCIÓN con STAGING
-- Agrega tablas y columnas que existen en staging pero no en producción
-- Ejecutar con: heroku pg:psql postgresql-flat-17118 --app entrepeques-api < scripts/sync-prod-with-staging.sql
-- =============================================================================

BEGIN;

-- =============================================================================
-- PARTE 1: NUEVAS TABLAS (Sistema de Citas)
-- =============================================================================

-- Tabla: appointments
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    client_name VARCHAR(100),
    client_phone VARCHAR(20),
    client_email VARCHAR(100),
    appointment_date DATE NOT NULL,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    cancelled_by INTEGER REFERENCES users(id),
    cancelled_at TIMESTAMP WITHOUT TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    CONSTRAINT valid_status CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Índices para appointments
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(appointment_date, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_appointment_slot
    ON appointments(appointment_date, start_time)
    WHERE status = 'scheduled';

-- Tabla: appointment_items
CREATE TABLE IF NOT EXISTS appointment_items (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    subcategory_id INTEGER NOT NULL REFERENCES subcategories(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    is_excellent_quality BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Índices para appointment_items
CREATE INDEX IF NOT EXISTS idx_appointment_items_appointment ON appointment_items(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_items_subcategory ON appointment_items(subcategory_id);

-- Tabla: appointment_settings
CREATE TABLE IF NOT EXISTS appointment_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Datos iniciales para appointment_settings
INSERT INTO appointment_settings (setting_key, setting_value)
VALUES ('admin_note', '')
ON CONFLICT (setting_key) DO NOTHING;

-- =============================================================================
-- PARTE 2: NUEVAS COLUMNAS EN TABLAS EXISTENTES
-- =============================================================================

-- subcategories.purchasing_enabled
ALTER TABLE subcategories
ADD COLUMN IF NOT EXISTS purchasing_enabled BOOLEAN DEFAULT true;

-- valuation_items - columnas de tracking de despublicación
ALTER TABLE valuation_items
ADD COLUMN IF NOT EXISTS unpublished_by INTEGER REFERENCES users(id);

ALTER TABLE valuation_items
ADD COLUMN IF NOT EXISTS unpublished_at TIMESTAMP WITHOUT TIME ZONE;

ALTER TABLE valuation_items
ADD COLUMN IF NOT EXISTS unpublish_reason TEXT;

-- valuation_items - historial de ediciones
ALTER TABLE valuation_items
ADD COLUMN IF NOT EXISTS edit_history JSONB;

-- valuation_items - notas para tienda online
ALTER TABLE valuation_items
ADD COLUMN IF NOT EXISTS online_notes TEXT;

-- valuation_items - columnas de consignación mejoradas
ALTER TABLE valuation_items
ADD COLUMN IF NOT EXISTS consignment_percentage NUMERIC(5,2);

ALTER TABLE valuation_items
ADD COLUMN IF NOT EXISTS actual_sale_price NUMERIC(10,2);

ALTER TABLE valuation_items
ADD COLUMN IF NOT EXISTS calculated_consignment_amount NUMERIC(10,2);

-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================

-- Mostrar tablas creadas
SELECT 'Tablas de citas creadas:' as info;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'appointment%';

-- Mostrar nuevas columnas
SELECT 'Nuevas columnas agregadas:' as info;
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
    (table_name = 'subcategories' AND column_name = 'purchasing_enabled')
    OR (table_name = 'valuation_items' AND column_name IN (
        'unpublished_by', 'unpublished_at', 'unpublish_reason',
        'edit_history', 'online_notes', 'consignment_percentage',
        'actual_sale_price', 'calculated_consignment_amount'
    ))
)
ORDER BY table_name, column_name;

COMMIT;

SELECT '✅ Sincronización completada exitosamente' as resultado;
