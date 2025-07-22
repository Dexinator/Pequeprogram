-- Inserciones para feature_definitions (subcategorías 1-10)

-- Subcategoría 1: Autoasientos
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(1, 'modelo', 'Modelo', 'seleccion', 1, '["Portabebé 0-13 kg", "Autoasientos 0-18 a 25 kg", "Autoasientos 9-18 a 30 kg", "Booster 15 a 45 kg", "Booster 18 a 49 Kg"]', true),
(1, 'tipo_asiento', 'Tipo de asiento', 'seleccion', 2, '["Ajustable alturas", "No ajustable alturas", "Elevador", "Con respaldo y cinturones", "Elevador con respaldo"]', true),
(1, 'sistemas_anclaje', 'Sistemas de anclaje', 'seleccion', 3, '["Sistema Latch", "Sistema Isofix", "Cinturón de Seguridad"]', true),
(1, 'cantidad_posiciones', 'Cantidad de posiciones', 'seleccion', 4, '["Reclinable", "No Reclinable"]', true);

-- Subcategoría 2: Cargando al peque
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(2, 'modelo', 'Modelo', 'seleccion', 1, '["Mochila Ergonómica", "Mei Thai", "Rebozo", "Fular 3m", "Fular 5m", "Bambineto", "Cangurera", "6 en 1", "Mochila Senderismo", "Cargador niñ@ grande", "Cobija Impermeable"]', true);

-- Subcategoría 3: Carriolas
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(3, 'modelo', 'Modelo', 'seleccion', 1, '["Con portabebé", "Sin portabebé", "Doble", "Portabebé y Base", "Sin capota"]', true),
(3, 'tipo', 'Tipo', 'seleccion', 2, '["Bastón", "Ligera", "Tradicional", "Para correr", "Gemelar Horizontal", "Gemelar Vertical", "Doble Bebe + Niño", "Nuevo tipo", "Base para portabebe"]', true),
(3, 'incluye_travel_system', 'Incluye travel system', 'seleccion', 3, '["No Travel System", "Travel System"]', true),
(3, 'capacidad_carriola', 'Capacidad de la carriola', 'seleccion', 4, '["Sencilla", "Doble"]', true),
(3, 'es_reclinable', 'Es reclinable', 'seleccion', 5, '["Reclinable", "No Reclinable"]', true),
(3, 'es_3_en_1', 'Es 3 en 1', 'seleccion', 6, '["3 en 1", "No 3en1"]', true),
(3, 'cantidad_posiciones_reclinado', 'Cantidad de posiciones de reclinado', 'seleccion', 7, '["1 Posición", "2 Posiciones", "3 Posiciones"]', true);

-- Subcategoría 4: Accesorios Carriola y Auto
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(4, 'modelo', 'Modelo', 'seleccion', 1, '["Cubre carriola", "Ganchos carriola", "Patín carriola", "Juguete para Carriola", "Organizador", "Funda de lluvia", "Saco protector", "Sombrilla", "Mosquitero", "Cubre portabebé", "Soporte para Cabeza", "Apapacho para Portabebé", "Protector Asientos", "Organizador auto", "Espejos retrovisores", "Funda de carriola", "Summer kit", "Funda reductora", "Adaptador de asiento", "Cargador Autoasiento", "Porta patineta", "Adaptador de carriola"]', true);

-- Subcategoría 5: Montables de exterior
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(5, 'modelo', 'Modelo', 'seleccion', 1, '["Eléctrico", "Empuje"]', true),
(5, 'tipo', 'Tipo', 'seleccion', 2, '["Control remoto", "Sin Control remoto"]', true),
(5, 'baston_empuje', 'Bastón para empuje', 'seleccion', 3, '["Con bastón empuje", "Sin bastón empuje"]', true),
(5, 'techo', 'Techo', 'seleccion', 4, '["Con techo", "Sin techo"]', true);

-- Subcategoría 6: Triciclos y bicicletas
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(6, 'modelo', 'Modelo', 'seleccion', 1, '["R-12 / 2-3a", "R-14 / 3-4a", "R-16 / 3-5a", "R-18 / 4-6a", "R+20 +6a", "Triciclo Pequeño", "Triciclo Grande", "Bicicleta de Equilibrio"]', true),
(6, 'tipo', 'Tipo', 'seleccion', 2, '["Ruedas Aux.", "Sin Ruedas Aux.", "3 en 1", "Regular", "Con accesorios"]', true);

-- Subcategoría 7: Sillas para bicicleta
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(7, 'modelo', 'Modelo', 'seleccion', 1, '["No Reclinable", "Reclinable"]', true),
(7, 'edad_minima', 'Edad mínima recomendada', 'seleccion', 2, '["9 meses", "Otra"]', true),
(7, 'edad_maxima', 'Edad máxima recomendada', 'seleccion', 3, '["6 años", "Otra"]', true);

-- Subcategoría 8: Sobre ruedas
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(8, 'modelo', 'Modelo', 'seleccion', 1, '["Avalancha", "Patineta", "Patines", "Scooter pequeño", "Scooter Grande", "Neon street rollers", "Wagon"]', true);

-- Subcategoría 9: Otros de Paseo
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(9, 'modelo', 'Modelo', 'seleccion', 1, '["Pañalera", "Inserto", "Cambiador", "Casco Protector Bici", "Arnés/Correa", "Andarín", "Inflable", "Mochila", "Silla para Bici", "Bambineto", "Portabebé y Base", "Adaptador de asiento", "Accesorios carriola", "Organizador", "Chaleco salvavidas", "Salvavidas"]', true);

-- Subcategoría 10: Cunas de madera
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(10, 'edad_maxima', 'Edad máxima recomendada', 'seleccion', 1, '["7 meses", "36 meses", "Más de 36 meses"]', true),
(10, 'modelo', 'Modelo', 'seleccion', 2, '["Cuna Estándar", "Convertible Entrenadora", "Convertible Matrimonial", "Tamaño Moisés", "Cama Junior", "Cama Individual", "Otros Tamaños", "Cuna Cama"]', true),
(10, 'con_buros', 'Con burós', 'seleccion', 3, '["Con burós", "Sin Buros"]', true),
(10, 'acabado', 'Acabado', 'seleccion', 4, '["Acabado Rústico", "Acabado Regular", "Acabado Fino"]', true),
(10, 'tipo_madera', 'Tipos de madera', 'seleccion', 5, '["Madera Regular/Pino", "Madera Fina"]', true),
(10, 'incluye_colchon', 'Incluye colchón', 'seleccion', 6, '["Incluye colchón", "No inluye colchón"]', true); 