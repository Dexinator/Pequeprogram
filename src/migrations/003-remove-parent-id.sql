-- Migración 003: Eliminación de la columna parent_id de categories
-- Fecha: Junio 28, 2025

-- Al tener subcategorías como una tabla separada, ya no es necesario
-- mantener la relación jerárquica dentro de la tabla categories

-- Primero eliminamos las restricciones de clave foránea
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_parent_id_fkey;

-- Ahora eliminamos la columna
ALTER TABLE categories DROP COLUMN IF EXISTS parent_id;

-- Actualizamos la estructura de categorías en la aplicación
COMMENT ON TABLE categories IS 'Categorías principales sin estructura jerárquica interna'; 