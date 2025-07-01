-- Migration 014: Create otherprods and otherprods_items tables
-- Tables for managing purchases of other products (cigarettes, candy, etc.)

-- Create otherprods table (purchase headers)
CREATE TABLE IF NOT EXISTS otherprods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    supplier_name VARCHAR(255) NOT NULL,
    purchase_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    total_amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL DEFAULT 'Polanco',
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create otherprods_items table (purchase details)
CREATE TABLE IF NOT EXISTS otherprods_items (
    id SERIAL PRIMARY KEY,
    otherprod_id INTEGER NOT NULL REFERENCES otherprods(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    purchase_unit_price NUMERIC(10,2) NOT NULL,
    sale_unit_price NUMERIC(10,2) NOT NULL,
    total_purchase_price NUMERIC(10,2) NOT NULL,
    sku VARCHAR(50) NOT NULL, -- Will be OTRP1, OTRP2, etc.
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_otherprods_user_id ON otherprods(user_id);
CREATE INDEX idx_otherprods_purchase_date ON otherprods(purchase_date);
CREATE INDEX idx_otherprods_location ON otherprods(location);
CREATE INDEX idx_otherprods_items_otherprod_id ON otherprods_items(otherprod_id);
CREATE INDEX idx_otherprods_items_sku ON otherprods_items(sku);

-- Create sequence for OTRP SKU generation
CREATE SEQUENCE IF NOT EXISTS otrp_sku_seq START WITH 1;

-- Add comments
COMMENT ON TABLE otherprods IS 'Purchase records for other products like cigarettes, candy, etc.';
COMMENT ON TABLE otherprods_items IS 'Individual items within each purchase';
COMMENT ON COLUMN otherprods_items.sku IS 'SKU format: OTRP{number} (e.g., OTRP1, OTRP2)';

-- Create function to auto-generate OTRP SKU
CREATE OR REPLACE FUNCTION generate_otrp_sku()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sku IS NULL OR NEW.sku = '' THEN
        NEW.sku := 'OTRP' || nextval('otrp_sku_seq');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate SKU
CREATE TRIGGER generate_otrp_sku_trigger
BEFORE INSERT ON otherprods_items
FOR EACH ROW
EXECUTE FUNCTION generate_otrp_sku();