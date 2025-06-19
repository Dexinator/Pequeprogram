-- Migración 006: Cargar datos de feature_definitions desde CSV
-- Fecha: Junio 18, 2025

-- Truncar tabla para asegurar datos frescos
TRUNCATE TABLE feature_definitions RESTART IDENTITY CASCADE;

-- Insertar datos de feature_definitions basados en el archivo CSV
-- Los datos han sido limpiados y formateados para PostgreSQL

-- Subcategoría 1: Autoasientos
INSERT INTO feature_definitions (id, subcategory_id, name, display_name, type, order_index, options, created_at, updated_at, mandatory, offer_print) VALUES
(1, 1, 'modelo', 'Modelo', 'seleccion', 1, '["Portabebé 0-13 kg", "Autoasientos 0-18 a 25 kg", "Autoasientos 9-18 a 30 kg", "Booster 15 a 45 kg"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(2, 1, 'tipo_asiento', 'Tipo de asiento', 'seleccion', 2, '["Ajustable alturas", "No ajustable alturas", "Elevador", "Con respaldo y cinturones", "Elevador con respaldo"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(3, 1, 'sistemas_anclaje', 'Sistemas de anclaje', 'seleccion', 3, '["Sistema Latch", "Sistema Isofix", "Cinturón de Seguridad"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(4, 1, 'cantidad_posiciones', 'Cantidad de posiciones', 'seleccion', 4, '["Reclinable", "No Reclinable"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false);

-- Subcategoría 2: Cargando al peque
INSERT INTO feature_definitions (id, subcategory_id, name, display_name, type, order_index, options, created_at, updated_at, mandatory, offer_print) VALUES
(5, 2, 'modelo', 'Modelo', 'seleccion', 1, '["Mochila Ergonómica", "Mei Thai", "Rebozo", "Fular 3m", "Fular 5m", "Bambineto", "Cangurera", "Mochila Senderismo", "Cargador niñ@ grande"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true);

-- Subcategoría 3: Carriolas  
INSERT INTO feature_definitions (id, subcategory_id, name, display_name, type, order_index, options, created_at, updated_at, mandatory, offer_print) VALUES
(6, 3, 'modelo', 'Modelo', 'seleccion', 1, '["Con portabebé", "Sin portabebé", "Doble", "Portabebé y Base"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(7, 3, 'tipo', 'Tipo', 'seleccion', 2, '["Bastón", "Ligera", "Tradicional", "Para correr", "Gemelar Horizontal", "Gemelar Vertical", "Doble Bebe + Niño", "Base para portabebe"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(8, 3, 'incluye_travel_system', 'Incluye travel system', 'seleccion', 3, '["No Travel System", "Travel System"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(9, 3, 'capacidad_carriola', 'Capacidad de la carriola', 'seleccion', 4, '["Sencilla", "Doble"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(10, 3, 'es_reclinable', 'Es reclinable', 'seleccion', 5, '["Reclinable", "No Reclinable"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(11, 3, 'es_3_en_1', 'Es 3 en 1', 'seleccion', 6, '["3 en 1", "No 3en1"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(12, 3, 'cantidad_posiciones_reclinado', 'Cantidad de posiciones de reclinado', 'seleccion', 7, '["1 Posición", "2 Posiciones", "3 Posiciones"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false);

-- Subcategoría 4: Accesorios Carriola y Auto
INSERT INTO feature_definitions (id, subcategory_id, name, display_name, type, order_index, options, created_at, updated_at, mandatory, offer_print) VALUES
(13, 4, 'modelo', 'Modelo', 'seleccion', 1, '["Cubre carriola", "Ganchos carriola", "Patín carriola", "Juguete para Carriola", "Organizador", "Funda de lluvia", "Saco protector", "Sombrilla", "Mosquitero", "Cubre portabebé", "Soporte para Cabeza", "Apapacho para Portabebé", "Protector Asientos", "Organizador auto", "Espejos retrovisores", "Funda de carriola", "accesorios sobre ruedas", "Cargador Autoasiento", "Adaptador de carriola"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true);

-- Subcategoría 5: Coches eléctricos
INSERT INTO feature_definitions (id, subcategory_id, name, display_name, type, order_index, options, created_at, updated_at, mandatory, offer_print) VALUES
(14, 5, 'modelo', 'Modelo', 'seleccion', 1, '["Eléctrico", "Empuje"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(15, 5, 'tipo', 'Tipo', 'seleccion', 2, '["Control remoto", "Sin Control remoto"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(16, 5, 'baston_empuje', 'Bastón para empuje', 'seleccion', 3, '["Con bastón empuje", "Sin bastón empuje"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(17, 5, 'techo', 'Techo', 'seleccion', 4, '["Con techo", "Sin techo"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false);

-- Subcategoría 6: Bicicletas y triciclos
INSERT INTO feature_definitions (id, subcategory_id, name, display_name, type, order_index, options, created_at, updated_at, mandatory, offer_print) VALUES
(18, 6, 'modelo', 'Modelo', 'seleccion', 1, '["R-12 / 2-3a", "R-14 / 3-4a", "R-16 / 3-5a", "R-18 / 4-6a", "R+20 +6a", "Triciclo Pequeño", "Triciclo Grande", "Bicicleta de Equilibrio"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(19, 6, 'tipo', 'Tipo', 'seleccion', 2, '["Ruedas Aux.", "Sin Ruedas Aux.", "3 en 1", "Regular", "Con accesorios"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true);

-- Subcategoría 7: Andadores
INSERT INTO feature_definitions (id, subcategory_id, name, display_name, type, order_index, options, created_at, updated_at, mandatory, offer_print) VALUES
(20, 7, 'modelo', 'Modelo', 'seleccion', 1, '["Trasera", "Frontal"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(21, 7, 'edad_minima', 'Edad mínima recomendada', 'seleccion', 2, '["9 meses", "Otra"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(22, 7, 'edad_maxima', 'Edad máxima recomendada', 'seleccion', 3, '["5 años", "Otra"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false);

-- Crear índice para optimizar consultas por offer_print
CREATE INDEX IF NOT EXISTS idx_feature_definitions_offer_print 
ON feature_definitions(subcategory_id, offer_print) 
WHERE offer_print = true;

-- Resetear secuencia para que el próximo ID sea correcto
SELECT setval('feature_definitions_id_seq', (SELECT MAX(id) FROM feature_definitions));