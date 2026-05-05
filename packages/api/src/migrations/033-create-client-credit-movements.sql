-- Migration 033: Create client_credit_movements table for store credit audit trail
-- Date: 2026-04-29
-- Description: Track every change to a client's store_credit balance, including
-- automatic accruals from sales, deductions when paying with credit, and manual
-- adjustments performed by staff. Required so the manual-adjustment feature is
-- auditable and so we can reconstruct a client's balance history.

CREATE TABLE IF NOT EXISTS client_credit_movements (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    movement_type VARCHAR(30) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    balance_after NUMERIC(10,2) NOT NULL,
    sale_id INTEGER REFERENCES sales(id),
    valuation_id INTEGER REFERENCES valuations(id),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_credit_movements_client_id
    ON client_credit_movements(client_id);

CREATE INDEX IF NOT EXISTS idx_client_credit_movements_created_at
    ON client_credit_movements(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_client_credit_movements_type
    ON client_credit_movements(movement_type);

COMMENT ON TABLE client_credit_movements IS
    'Audit trail of every change to clients.store_credit. Movements may be automatic (sale, valuation) or manual (adjustment).';
COMMENT ON COLUMN client_credit_movements.movement_type IS
    'manual_add | manual_subtract | sale_charge | sale_refund | valuation_credit | initial_load';
COMMENT ON COLUMN client_credit_movements.amount IS
    'Signed delta applied to the balance. Positive adds credit, negative subtracts.';
COMMENT ON COLUMN client_credit_movements.balance_after IS
    'The clients.store_credit value AFTER the movement was applied. Useful for reconciliation.';
