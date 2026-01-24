-- Migration 029: Create appointments booking system tables
-- Sistema de citas para valuación de artículos

-- Tabla principal de citas
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    -- Para clientes nuevos que aún no tienen registro:
    client_name VARCHAR(100),
    client_phone VARCHAR(20),
    client_email VARCHAR(100),
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    cancelled_by INTEGER REFERENCES users(id),
    cancelled_at TIMESTAMP WITHOUT TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_status CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show'))
);

-- Items de cada cita - productos que el cliente traerá para valuación
CREATE TABLE IF NOT EXISTS appointment_items (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    subcategory_id INTEGER NOT NULL REFERENCES subcategories(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    is_excellent_quality BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Agregar campo purchasing_enabled a subcategories para controlar disponibilidad en citas
ALTER TABLE subcategories
ADD COLUMN IF NOT EXISTS purchasing_enabled BOOLEAN DEFAULT TRUE;

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(appointment_date, start_time);
CREATE INDEX IF NOT EXISTS idx_appointment_items_appointment ON appointment_items(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_items_subcategory ON appointment_items(subcategory_id);

-- Índice único para evitar doble reserva en el mismo horario
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_appointment_slot
ON appointments(appointment_date, start_time)
WHERE status = 'scheduled';

-- Comentarios para documentación
COMMENT ON TABLE appointments IS 'Citas de valuación agendadas desde la tienda en línea';
COMMENT ON COLUMN appointments.client_id IS 'Referencia a cliente existente, NULL para clientes nuevos';
COMMENT ON COLUMN appointments.status IS 'scheduled=activa, completed=realizada, cancelled=cancelada, no_show=no asistió';
COMMENT ON COLUMN subcategories.purchasing_enabled IS 'Si es FALSE, la subcategoría aparece deshabilitada en el sistema de citas';
COMMENT ON TABLE appointment_items IS 'Productos que el cliente planea traer para valuación en la cita';

-- Registrar migración
INSERT INTO migrations (name, executed_at)
VALUES ('029-create-appointments-tables', NOW())
ON CONFLICT DO NOTHING;
