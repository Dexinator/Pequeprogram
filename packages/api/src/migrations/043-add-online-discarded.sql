-- Migration: 043-add-online-discarded.sql
-- Description: Estado "descartado" para la preparación de la tienda en línea.
--   Petición de Pablo: la ropa sin foto satura la lista de "preparar productos" y no
--   deja encontrar lo que sí se va a publicar. Con este flag puede marcar productos
--   como "no publicar" (en lote) para sacarlos de la lista de pendientes.
--
--   Es independiente de online_store_ready:
--     online_store_ready = false, online_discarded = false -> pendiente de publicar
--     online_store_ready = false, online_discarded = true  -> no se va a publicar
--     online_store_ready = true                            -> publicado en la tienda
--   Descartar NO afecta el inventario ni la venta en tienda física: el producto sigue
--   existiendo y se puede vender en el POS, solo deja de aparecer en la cola de
--   preparación para la tienda en línea. Es reversible (se puede volver a pendiente).
-- Date: 2026-08-16

ALTER TABLE valuation_items ADD COLUMN IF NOT EXISTS online_discarded BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN valuation_items.online_discarded IS 'TRUE = descartado para la tienda en linea (no aparece en preparar productos). No afecta inventario ni venta en tienda fisica.';

-- Índice parcial para la consulta de pendientes (online_store_ready=false AND online_discarded=false)
CREATE INDEX IF NOT EXISTS idx_valuation_items_online_discarded
ON valuation_items(online_discarded)
WHERE online_discarded = TRUE;

-- Migration record
INSERT INTO migrations (name, executed_at) VALUES ('043-add-online-discarded.sql', NOW());
