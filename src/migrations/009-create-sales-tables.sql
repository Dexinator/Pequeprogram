-- Migration 009: Create sales and sale_items tables
-- Executed at: Manual execution required

-- Create sales table
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    client_name VARCHAR(100),
    user_id INTEGER NOT NULL REFERENCES users(id),
    sale_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    total_amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    location VARCHAR(100) NOT NULL DEFAULT 'Polanco',
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_client_info CHECK (
        (client_id IS NOT NULL AND client_name IS NULL) OR 
        (client_id IS NULL AND client_name IS NOT NULL) OR
        (client_id IS NOT NULL AND client_name IS NOT NULL)
    )
);

-- Create sale_items table
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    inventario_id VARCHAR(50) NOT NULL REFERENCES inventario(id),
    quantity_sold INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_quantity_sold_positive CHECK (quantity_sold > 0),
    CONSTRAINT chk_unit_price_positive CHECK (unit_price >= 0),
    CONSTRAINT chk_total_price_positive CHECK (total_price >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_sales_client_id ON sales USING btree (client_id);
CREATE INDEX idx_sales_user_id ON sales USING btree (user_id);
CREATE INDEX idx_sales_date ON sales USING btree (sale_date);
CREATE INDEX idx_sales_status ON sales USING btree (status);
CREATE INDEX idx_sales_location ON sales USING btree (location);
CREATE INDEX idx_sale_items_sale_id ON sale_items USING btree (sale_id);
CREATE INDEX idx_sale_items_inventario_id ON sale_items USING btree (inventario_id);

-- Add comments for documentation
COMMENT ON TABLE sales IS 'Tabla de ventas de la tienda física';
COMMENT ON COLUMN sales.client_id IS 'ID del cliente registrado (opcional)';
COMMENT ON COLUMN sales.client_name IS 'Nombre del cliente ocasional (opcional)';
COMMENT ON COLUMN sales.payment_method IS 'Método de pago: efectivo, tarjeta, transferencia, etc.';
COMMENT ON COLUMN sales.status IS 'Estado de la venta: completed, cancelled, refunded';

COMMENT ON TABLE sale_items IS 'Items individuales de cada venta';
COMMENT ON COLUMN sale_items.inventario_id IS 'ID del producto en inventario';
COMMENT ON COLUMN sale_items.quantity_sold IS 'Cantidad vendida del producto';
COMMENT ON COLUMN sale_items.unit_price IS 'Precio unitario al momento de la venta';
COMMENT ON COLUMN sale_items.total_price IS 'Precio total (unit_price * quantity_sold)';