-- Migration: 046-add-client-notes.sql
-- Description: Notas libres por cliente, pedidas por Pablo en el documento de
--   septiembre ("agregar alguna nota específica si se requiere"). La tabla
--   clients no tenía dónde guardarlas.
-- Date: 2026-10-09

ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN clients.notes IS 'Notas libres del personal sobre el cliente (preferencias, acuerdos, avisos)';

-- Migration record
INSERT INTO migrations (name, executed_at) VALUES ('046-add-client-notes.sql', NOW());
