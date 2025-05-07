-- Script para cambiar category_id a subcategory_id en la tabla brands

-- 1. Añadir la nueva columna subcategory_id
ALTER TABLE brands ADD COLUMN subcategory_id INTEGER;

-- 2. Eliminar la restricción de clave externa existente para category_id
ALTER TABLE brands DROP CONSTRAINT IF EXISTS brands_category_id_fkey;

-- 3. Crear la nueva restricción de clave externa para subcategory_id
ALTER TABLE brands ADD CONSTRAINT brands_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES subcategories(id);

-- 4. Opcional: llenar subcategory_id con datos (requiere decisión de negocio)
-- Por ejemplo, podrías seleccionar una subcategoría por defecto para cada categoría
-- UPDATE brands SET subcategory_id = (SELECT MIN(id) FROM subcategories WHERE category_id = brands.category_id);

-- 5. Opcional: si se requiere que subcategory_id no sea nulo después de la migración
-- ALTER TABLE brands ALTER COLUMN subcategory_id SET NOT NULL;

-- 6. Eliminar la columna category_id (solo después de confirmar que la migración de datos está completa)
-- ALTER TABLE brands DROP COLUMN category_id; 