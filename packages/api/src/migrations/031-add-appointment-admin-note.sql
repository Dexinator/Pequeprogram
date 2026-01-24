-- Migration 031: Add admin note for appointments booking page
-- Nota configurable por el administrador que aparece en /citas

-- Tabla de configuración de citas
CREATE TABLE IF NOT EXISTS appointment_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Insertar la nota inicial vacía
INSERT INTO appointment_settings (setting_key, setting_value)
VALUES ('admin_note', '')
ON CONFLICT (setting_key) DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE appointment_settings IS 'Configuraciones del sistema de citas';
COMMENT ON COLUMN appointment_settings.setting_key IS 'Clave única de la configuración';
COMMENT ON COLUMN appointment_settings.setting_value IS 'Valor de la configuración';

-- Registrar migración
INSERT INTO migrations (name, executed_at)
VALUES ('031-add-appointment-admin-note', NOW())
ON CONFLICT DO NOTHING;
