-- 049 — Cuánto se le devuelve al cliente cuando se cancela un apartado.
--
-- Hasta ahora cancelar devolvía siempre todo lo abonado, o nada ('forfeited').
-- Pablo pidió poder retener una parte, así que hace falta guardar el monto
-- devuelto además del destino: el resto se lo queda la tienda y tiene que
-- quedar registrado para que el corte cuadre.
--
-- NULL en apartados cancelados antes de este cambio significa "se devolvió
-- todo lo abonado", que es lo que hacía el sistema entonces.

ALTER TABLE layaways
  ADD COLUMN IF NOT EXISTS cancel_refund_amount NUMERIC(10,2);

COMMENT ON COLUMN layaways.cancel_refund_amount IS
  'Monto devuelto al cliente al cancelar (efectivo o crédito). La diferencia contra paid_amount se la queda la tienda. NULL en cancelaciones previas a la migración 049: ahí se devolvió todo.';
