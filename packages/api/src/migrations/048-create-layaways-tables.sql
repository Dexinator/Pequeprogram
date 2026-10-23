-- Migration: 048-create-layaways-tables.sql
-- Description: Apartados (Etapa 5, la última del roadmap de septiembre).
--
--   Decisión clave: apartar DESCUENTA el stock, igual que una venta. Si no se
--   hiciera, el artículo apartado seguiría apareciendo disponible y podría
--   venderse otra vez, en mostrador o en la tienda en línea. Al liquidar se
--   crea la venta SIN volver a descontar; al cancelar se regresa el stock.
-- Date: 2026-10-22

CREATE TABLE IF NOT EXISTS layaways (
    id SERIAL PRIMARY KEY,
    -- Obligatorio, a diferencia de una venta: sin cliente no hay a quién
    -- cobrarle el resto ni a quién devolverle el anticipo.
    client_id INTEGER NOT NULL REFERENCES clients(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    location VARCHAR(50),
    total_amount NUMERIC(10,2) NOT NULL,
    -- Suma de abonos. Desnormalizado a propósito: se recalcula en cada abono
    -- dentro de la misma transacción, para no sumar en cada consulta.
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',  -- active | completed | cancelled
    due_date DATE,
    -- Se llena al liquidar: el apartado se convierte en venta real
    sale_id INTEGER REFERENCES sales(id),
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    cancelled_at TIMESTAMP WITHOUT TIME ZONE,
    -- Qué se hizo con el anticipo al cancelar: efectivo | credito_tienda | forfeited
    cancel_refund_method VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS layaway_items (
    id SERIAL PRIMARY KEY,
    layaway_id INTEGER NOT NULL REFERENCES layaways(id) ON DELETE CASCADE,
    inventario_id VARCHAR(50) NOT NULL REFERENCES inventario(id),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS layaway_payments (
    id SERIAL PRIMARY KEY,
    layaway_id INTEGER NOT NULL REFERENCES layaways(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    payment_method VARCHAR(20) NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_layaways_client   ON layaways(client_id);
CREATE INDEX IF NOT EXISTS idx_layaways_status   ON layaways(status);
CREATE INDEX IF NOT EXISTS idx_layaways_due_date ON layaways(due_date);
CREATE INDEX IF NOT EXISTS idx_layaway_items_layaway   ON layaway_items(layaway_id);
-- Para saber rápido si un artículo de inventario está apartado
CREATE INDEX IF NOT EXISTS idx_layaway_items_inventario ON layaway_items(inventario_id);
CREATE INDEX IF NOT EXISTS idx_layaway_payments_layaway ON layaway_payments(layaway_id);

COMMENT ON TABLE layaways IS
    'Apartados: articulos reservados con un anticipo. Apartar descuenta stock; liquidar crea la venta sin volver a descontarlo.';
COMMENT ON COLUMN layaways.paid_amount IS
    'Suma de layaway_payments. Desnormalizado, se recalcula en cada abono dentro de la transaccion.';
COMMENT ON COLUMN layaways.cancel_refund_method IS
    'Que se hizo con el anticipo al cancelar: efectivo | credito_tienda | forfeited (se queda la tienda)';

INSERT INTO migrations (name, executed_at) VALUES ('048-create-layaways-tables.sql', NOW());
