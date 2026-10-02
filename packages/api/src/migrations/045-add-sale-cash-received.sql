-- Migration: 045-add-sale-cash-received.sql
-- Description: Registrar el efectivo recibido y el cambio entregado en ventas
--   de mostrador, para que el ticket (y su reimpresión) muestren el cambio.
--   Ambas columnas son NULL cuando la cajera no captura el importe recibido:
--   en ese caso la venta se cobra igual que siempre y el ticket no imprime
--   estas líneas.
-- Date: 2026-09-24

-- cash_received: importe en efectivo que entregó el cliente (NULL = no capturado)
ALTER TABLE sales ADD COLUMN IF NOT EXISTS cash_received NUMERIC(10,2);
-- change_given: cambio devuelto, calculado en el backend como
--   cash_received - (suma de payment_details con payment_method = 'efectivo'),
--   acotado a >= 0. NULL cuando no aplica.
ALTER TABLE sales ADD COLUMN IF NOT EXISTS change_given NUMERIC(10,2);

COMMENT ON COLUMN sales.cash_received IS 'Efectivo recibido del cliente. NULL si la cajera no lo capturo (campo opcional)';
COMMENT ON COLUMN sales.change_given IS 'Cambio entregado = cash_received - efectivo cobrado, acotado a >= 0. NULL si no aplica';

-- Migration record
INSERT INTO migrations (name, executed_at) VALUES ('045-add-sale-cash-received.sql', NOW());
