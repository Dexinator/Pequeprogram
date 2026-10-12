-- Migration: 047-create-returns-tables.sql
-- Description: Devoluciones de mercancía (Etapa 4 del roadmap de septiembre).
--   La venta original NUNCA se modifica: es histórico. La devolución es un
--   registro aparte que la referencia, para que el historial de ventas siga
--   cuadrando y se pueda saber qué se devolvió, cuándo y por qué.
-- Date: 2026-10-12

CREATE TABLE IF NOT EXISTS returns (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id),
    client_id INTEGER REFERENCES clients(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    return_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    total_amount NUMERIC(10,2) NOT NULL,
    -- 'garantia' (producto con defecto, se devuelve dinero) |
    -- 'sin_defecto' (el producto está bien, se devuelve crédito)
    return_type VARCHAR(20) NOT NULL,
    -- 'efectivo' | 'credito_tienda'. El tipo solo PROPONE el método; la
    -- cajera puede combinarlos y el sistema no lo bloquea.
    refund_method VARCHAR(20) NOT NULL,
    location VARCHAR(50),
    reason TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS return_items (
    id SERIAL PRIMARY KEY,
    return_id INTEGER NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
    sale_item_id INTEGER NOT NULL REFERENCES sale_items(id),
    inventario_id VARCHAR(50) NOT NULL REFERENCES inventario(id),
    quantity_returned INTEGER NOT NULL CHECK (quantity_returned > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    -- FALSE cuando el artículo no vuelve a venderse (dañado). Por defecto
    -- TRUE: lo normal es que regrese al inventario.
    restocked BOOLEAN DEFAULT TRUE,
    condition_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_returns_sale_id     ON returns(sale_id);
CREATE INDEX IF NOT EXISTS idx_returns_client_id   ON returns(client_id);
CREATE INDEX IF NOT EXISTS idx_returns_date        ON returns(return_date DESC);
CREATE INDEX IF NOT EXISTS idx_return_items_return ON return_items(return_id);
-- Para validar rápido cuánto se ha devuelto ya de cada renglón de venta
CREATE INDEX IF NOT EXISTS idx_return_items_sale_item ON return_items(sale_item_id);

COMMENT ON TABLE returns IS
    'Devoluciones de mercancía. La venta original no se modifica: esto la referencia.';
COMMENT ON COLUMN returns.return_type IS
    'garantia = producto defectuoso (se devuelve dinero) | sin_defecto = producto en buen estado (se devuelve credito)';
COMMENT ON COLUMN return_items.restocked IS
    'TRUE si el articulo regresa al inventario. FALSE para producto danado que ya no se vende.';

INSERT INTO migrations (name, executed_at) VALUES ('047-create-returns-tables.sql', NOW());
