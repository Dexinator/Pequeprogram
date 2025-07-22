-- Migration: Add store_credit column to clients table
-- Date: 2025-06-26
-- Description: Track accumulated store credit for each client

-- Add store_credit column to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS store_credit NUMERIC(10,2) DEFAULT 0.00;

-- Add comment to explain the column
COMMENT ON COLUMN clients.store_credit IS 'Accumulated store credit balance for the client. Can be used for purchases.';

-- Create index for faster queries on clients with store credit
CREATE INDEX IF NOT EXISTS idx_clients_store_credit 
ON clients(store_credit) 
WHERE store_credit > 0;

-- Update existing clients to have 0 store credit if NULL
UPDATE clients 
SET store_credit = 0.00 
WHERE store_credit IS NULL;