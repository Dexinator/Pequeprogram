-- Migración 020: Crear tablas para ventas online con MercadoPago

-- Crear tabla de ventas online
CREATE TABLE IF NOT EXISTS online_sales (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(50) UNIQUE NOT NULL, -- ID del pago de MercadoPago
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    shipping_address JSONB, -- Dirección de envío si aplica
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL, -- approved, pending, rejected, etc.
    payment_method VARCHAR(50) NOT NULL, -- visa, mastercard, etc.
    payment_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Crear tabla de items de venta online
CREATE TABLE IF NOT EXISTS online_sale_items (
    id SERIAL PRIMARY KEY,
    online_sale_id INTEGER NOT NULL,
    valuation_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_online_sale 
        FOREIGN KEY (online_sale_id) 
        REFERENCES online_sales(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_valuation_item 
        FOREIGN KEY (valuation_item_id) 
        REFERENCES valuation_items(id)
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_online_sales_payment_id ON online_sales(payment_id);
CREATE INDEX IF NOT EXISTS idx_online_sales_customer_email ON online_sales(customer_email);
CREATE INDEX IF NOT EXISTS idx_online_sales_payment_date ON online_sales(payment_date);
CREATE INDEX IF NOT EXISTS idx_online_sales_payment_status ON online_sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_online_sale_items_sale_id ON online_sale_items(online_sale_id);
CREATE INDEX IF NOT EXISTS idx_online_sale_items_valuation_item_id ON online_sale_items(valuation_item_id);

-- Comentarios de documentación
COMMENT ON TABLE online_sales IS 'Tabla para almacenar ventas realizadas a través de la tienda online con MercadoPago';
COMMENT ON COLUMN online_sales.payment_id IS 'ID único del pago generado por MercadoPago';
COMMENT ON COLUMN online_sales.shipping_address IS 'Dirección de envío en formato JSON si aplica';
COMMENT ON COLUMN online_sales.payment_status IS 'Estado del pago: approved, pending, rejected, etc.';

COMMENT ON TABLE online_sale_items IS 'Detalle de productos vendidos en cada venta online';
COMMENT ON COLUMN online_sale_items.valuation_item_id IS 'Referencia al producto del inventario vendido';