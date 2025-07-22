-- Migración 004: Ajuste de la columna SKU en subcategories
-- Fecha: Junio 28, 2025

-- Verificamos si necesitamos hacer la migración de description a sku
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'subcategories' AND column_name = 'description'
    ) THEN
        -- Renombramos la columna description a sku si todavía existe
        ALTER TABLE subcategories RENAME COLUMN description TO sku;
    END IF;
END
$$;

-- Verificamos si la columna está en mayúsculas (SKU) y la cambiamos a minúsculas (sku)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'subcategories' AND column_name = 'SKU'
    ) THEN
        -- Renombramos la columna SKU a sku para consistencia
        ALTER TABLE subcategories RENAME COLUMN "SKU" TO sku;
    END IF;
END
$$;
