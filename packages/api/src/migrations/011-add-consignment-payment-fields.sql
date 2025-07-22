-- Migration 011: Add consignment payment fields to valuation_items
-- Executed at: Manual execution required

-- Add consignment payment fields to valuation_items table
ALTER TABLE valuation_items 
ADD COLUMN consignment_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN consignment_paid_date TIMESTAMP WITHOUT TIME ZONE,
ADD COLUMN consignment_paid_amount NUMERIC(10,2),
ADD COLUMN consignment_paid_notes TEXT;

-- Add index for faster queries on payment status
CREATE INDEX idx_valuation_items_consignment_paid ON valuation_items(consignment_paid) WHERE modality = 'consignación';

-- Add index for payment date queries
CREATE INDEX idx_valuation_items_consignment_paid_date ON valuation_items(consignment_paid_date) WHERE consignment_paid = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN valuation_items.consignment_paid IS 'Indica si se ha pagado la consignación al proveedor';
COMMENT ON COLUMN valuation_items.consignment_paid_date IS 'Fecha en que se pagó la consignación al proveedor';
COMMENT ON COLUMN valuation_items.consignment_paid_amount IS 'Monto pagado al proveedor por la consignación';
COMMENT ON COLUMN valuation_items.consignment_paid_notes IS 'Notas adicionales sobre el pago de la consignación';