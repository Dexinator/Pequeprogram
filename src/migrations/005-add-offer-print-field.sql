-- Migración 005: Agregar campo offer_print a feature_definitions
-- Fecha: Junio 18, 2025

-- Agregar columna offer_print a feature_definitions
ALTER TABLE feature_definitions 
ADD COLUMN IF NOT EXISTS offer_print BOOLEAN DEFAULT FALSE;

-- Comentario para documentar el nuevo campo
COMMENT ON COLUMN feature_definitions.offer_print IS 'Indica si esta característica debe mostrarse en la descripción del producto en la oferta impresa';

-- Actualizar valores de offer_print basados en el archivo CSV feature_definitions.csv
-- Estos valores fueron cuidadosamente seleccionados para optimizar las descripciones de productos en ofertas

-- IDs con offer_print = TRUE (características importantes para ofertas)
UPDATE feature_definitions SET offer_print = TRUE WHERE id IN (
  1,   -- Autoasientos: modelo
  2,   -- Autoasientos: tipo_asiento  
  5,   -- Cargando al peque: modelo
  6,   -- Carriolas: modelo
  7,   -- Carriolas: tipo
  13,  -- Accesorios Carriola: modelo
  14,  -- Coches eléctricos: modelo
  15,  -- Coches eléctricos: tipo
  18,  -- Bicicletas/Triciclos: modelo
  19,  -- Bicicletas/Triciclos: tipo
  20,  -- Andadores: modelo
  23,  -- Patinetas/Scooters: modelo
  24,  -- Accesorios diversos: modelo
  26,  -- Cunas: modelo
  30,  -- Cunas: incluye_colchon
  31,  -- Moisés: modelo
  35,  -- Cuna Pack&Play: modelo
  37,  -- Ropa de cama: modelo
  38,  -- Ropa de cama: tipo
  39,  -- Colchones: modelo
  41,  -- Almohadas: modelo
  46,  -- Muebles: modelo
  47,  -- Decoración: modelo
  48,  -- Sillas para comer: modelo
  55,  -- Calentadores: modelo
  56,  -- Esterilizadores: modelo
  60,  -- Extractores: modelo
  62,  -- Accesorios alimentación: modelo
  64,  -- Ropa niña: modelo
  66,  -- Parte superior niña: modelo
  68,  -- Parte inferior niña: modelo
  70,  -- Ropa niño: modelo
  72,  -- Parte superior niño: modelo
  74,  -- Parte inferior niño: modelo
  76,  -- Zapatos niña: modelo
  78,  -- Zapatos niño: modelo
  79,  -- Accesorios niños: modelo
  81,  -- Zapatos bebé: modelo
  86,  -- Juegos de mesa: modelo
  88,  -- Libros: modelo
  90,  -- Gimnasios: modelo
  94,  -- Montables/Andadores: modelo
  98,  -- Bicicletas infantiles: modelo
  100, -- Patinetas infantiles: modelo
  101, -- Muebles grandes: modelo
  102  -- Muebles grandes: tamano
);

-- Crear índice para optimizar consultas por offer_print
CREATE INDEX IF NOT EXISTS idx_feature_definitions_offer_print 
ON feature_definitions(subcategory_id, offer_print) 
WHERE offer_print = TRUE;