-- Migration 010: Add payment_details table for mixed payments
-- Executed at: Manual execution required

-- Create payment_details table
CREATE TABLE payment_details (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_payment_amount_positive CHECK (amount > 0)
);

-- Create indexes for performance
CREATE INDEX idx_payment_details_sale_id ON payment_details USING btree (sale_id);
CREATE INDEX idx_payment_details_payment_method ON payment_details USING btree (payment_method);

-- Add comments for documentation
COMMENT ON TABLE payment_details IS 'Detalles de pago para ventas - permite múltiples métodos de pago por venta';
COMMENT ON COLUMN payment_details.sale_id IS 'ID de la venta asociada';
COMMENT ON COLUMN payment_details.payment_method IS 'Método de pago: efectivo, tarjeta, transferencia, etc.';
COMMENT ON COLUMN payment_details.amount IS 'Monto pagado con este método de pago';
COMMENT ON COLUMN payment_details.notes IS 'Notas adicionales sobre este pago (ej: últimos 4 dígitos tarjeta)';

-- Update existing sales to use payment_details
-- For existing sales, create a single payment_detail record with the current payment_method
INSERT INTO payment_details (sale_id, payment_method, amount, notes, created_at, updated_at)
SELECT 
    id as sale_id,
    payment_method,
    total_amount,
    'Migrado automáticamente' as notes,
    created_at,
    updated_at
FROM sales 
WHERE payment_method IS NOT NULL;

-- Optional: Remove payment_method column from sales table after migration
-- (Uncomment the line below if you want to remove the old column)
-- ALTER TABLE sales DROP COLUMN payment_method;