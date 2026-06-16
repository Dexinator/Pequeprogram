-- Migration: 034-add-consignment-folio.sql
-- Description: Add a trackable folio to valuations (the consignment "contract") and expose
--   the contract date. Requested by Pablo: when consignors call he needs to know the date
--   the items were left and a folio he can search for (consecutive / date-based) to locate
--   the physical contract.
-- Date: 2026-05-30

-- 1. Add folio column to valuations (a valuation = one contract / drop-off session)
ALTER TABLE valuations
ADD COLUMN IF NOT EXISTS folio VARCHAR(30);

-- 2. Backfill existing valuations with a deterministic folio: C-YYMMDD-{id}
--    Contains the contract date (so it tells you when) and the consecutive id (so it is unique).
UPDATE valuations
SET folio = 'C-' || to_char(COALESCE(valuation_date, created_at, NOW()), 'YYMMDD') || '-' || id
WHERE folio IS NULL;

-- 3. Auto-generate folio for new valuations via trigger (works for every app that inserts).
--    Done AFTER INSERT because the serial id is only known once the row exists.
CREATE OR REPLACE FUNCTION set_valuation_folio()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.folio IS NULL THEN
    UPDATE valuations
    SET folio = 'C-' || to_char(COALESCE(NEW.valuation_date, NEW.created_at, NOW()), 'YYMMDD') || '-' || NEW.id
    WHERE id = NEW.id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_valuation_folio ON valuations;
CREATE TRIGGER trigger_set_valuation_folio
AFTER INSERT ON valuations
FOR EACH ROW
EXECUTE FUNCTION set_valuation_folio();

-- 4. Index for fast folio lookups (search by folio)
CREATE INDEX IF NOT EXISTS idx_valuations_folio ON valuations(folio);

COMMENT ON COLUMN valuations.folio IS 'Folio rastreable del contrato (formato C-YYMMDD-{id}): contiene la fecha de contrato y el id consecutivo';

-- Migration completed successfully
