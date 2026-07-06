-- Migration: 037-create-valuation-drafts.sql
-- Description: Tabla para guardar borradores de compra del valuador (petición Pablo Junio26).
--   Guarda el estado completo del formulario en JSONB para poder recuperarlo tal cual
--   quedó. No crea inventario ni afecta el flujo de finalización; al finalizar un
--   borrador se elimina.
-- Date: 2026-07-06

CREATE TABLE IF NOT EXISTS valuation_drafts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  client_name VARCHAR(255),
  product_count INTEGER DEFAULT 0,
  state JSONB NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_valuation_drafts_user ON valuation_drafts(user_id);

COMMENT ON TABLE valuation_drafts IS 'Borradores de compra del valuador: estado del formulario (JSONB) para retomar una valuación sin finalizar';

-- Migration record
INSERT INTO migrations (name, executed_at) VALUES ('037-create-valuation-drafts.sql', NOW());
