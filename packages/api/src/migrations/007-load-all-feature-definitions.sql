-- Migración 007: Cargar TODOS los 102 registros del CSV feature_definitions.csv
-- Fecha: Junio 18, 2025

-- Limpiar tabla completamente
TRUNCATE TABLE feature_definitions RESTART IDENTITY CASCADE;

-- Insertar TODOS los datos del CSV (102 registros)
INSERT INTO feature_definitions (id, subcategory_id, name, display_name, type, order_index, options, created_at, updated_at, mandatory, offer_print) VALUES

-- Autoasientos (subcategory_id = 1)
(1, 1, 'modelo', 'Modelo', 'seleccion', 1, '["Portabebé 0-13 kg", "Autoasientos 0-18 a 25 kg", "Autoasientos 9-18 a 30 kg", "Booster 15 a 45 kg"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(2, 1, 'tipo_asiento', 'Tipo de asiento', 'seleccion', 2, '["Ajustable alturas", "No ajustable alturas", "Elevador", "Con respaldo y cinturones", "Elevador con respaldo"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(3, 1, 'sistemas_anclaje', 'Sistemas de anclaje', 'seleccion', 3, '["Sistema Latch", "Sistema Isofix", "Cinturón de Seguridad"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(4, 1, 'cantidad_posiciones', 'Cantidad de posiciones', 'seleccion', 4, '["Reclinable", "No Reclinable"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Cargando al peque (subcategory_id = 2)
(5, 2, 'modelo', 'Modelo', 'seleccion', 1, '["Mochila Ergonómica", "Mei Thai", "Rebozo", "Fular 3m", "Fular 5m", "Bambineto", "Cangurera", "Mochila Senderismo", "Cargador niñ@ grande"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Carriolas (subcategory_id = 3)
(6, 3, 'modelo', 'Modelo', 'seleccion', 1, '["Con portabebé", "Sin portabebé", "Doble", "Portabebé y Base"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(7, 3, 'tipo', 'Tipo', 'seleccion', 2, '["Bastón", "Ligera", "Tradicional", "Para correr", "Gemelar Horizontal", "Gemelar Vertical", "Doble Bebe + Niño", "Base para portabebe"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(8, 3, 'incluye_travel_system', 'Incluye travel system', 'seleccion', 3, '["No Travel System", "Travel System"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(9, 3, 'capacidad_carriola', 'Capacidad de la carriola', 'seleccion', 4, '["Sencilla", "Doble"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(10, 3, 'es_reclinable', 'Es reclinable', 'seleccion', 5, '["Reclinable", "No Reclinable"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(11, 3, 'es_3_en_1', 'Es 3 en 1', 'seleccion', 6, '["3 en 1", "No 3en1"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(12, 3, 'cantidad_posiciones_reclinado', 'Cantidad de posiciones de reclinado', 'seleccion', 7, '["1 Posición", "2 Posiciones", "3 Posiciones"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Accesorios Carriola y Auto (subcategory_id = 4)
(13, 4, 'modelo', 'Modelo', 'seleccion', 1, '["Cubre carriola", "Ganchos carriola", "Patín carriola", "Juguete para Carriola", "Organizador", "Funda de lluvia", "Saco protector", "Sombrilla", "Mosquitero", "Cubre portabebé", "Soporte para Cabeza", "Apapacho para Portabebé", "Protector Asientos", "Organizador auto", "Espejos retrovisores", "Funda de carriola", "accesorios sobre ruedas", "Cargador Autoasiento", "Adaptador de carriola"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Coches eléctricos (subcategory_id = 5)
(14, 5, 'modelo', 'Modelo', 'seleccion', 1, '["Eléctrico", "Empuje"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(15, 5, 'tipo', 'Tipo', 'seleccion', 2, '["Control remoto", "Sin Control remoto"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(16, 5, 'baston_empuje', 'Bastón para empuje', 'seleccion', 3, '["Con bastón empuje", "Sin bastón empuje"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(17, 5, 'techo', 'Techo', 'seleccion', 4, '["Con techo", "Sin techo"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Bicicletas y triciclos (subcategory_id = 6)
(18, 6, 'modelo', 'Modelo', 'seleccion', 1, '["R-12 / 2-3a", "R-14 / 3-4a", "R-16 / 3-5a", "R-18 / 4-6a", "R+20 +6a", "Triciclo Pequeño", "Triciclo Grande", "Bicicleta de Equilibrio"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(19, 6, 'tipo', 'Tipo', 'seleccion', 2, '["Ruedas Aux.", "Sin Ruedas Aux.", "3 en 1", "Regular", "Con accesorios"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Andadores (subcategory_id = 7)
(20, 7, 'modelo', 'Modelo', 'seleccion', 1, '["Trasera", "Frontal"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(21, 7, 'edad_minima', 'Edad mínima recomendada', 'seleccion', 2, '["9 meses", "Otra"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(22, 7, 'edad_maxima', 'Edad máxima recomendada', 'seleccion', 3, '["5 años", "Otra"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Patinetas y scooters (subcategory_id = 8)
(23, 8, 'modelo', 'Modelo', 'seleccion', 1, '["Avalancha", "Patineta", "Patines", "Scooter pequeño", "Scooter Grande", "Wagon"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Accesorios diversos (subcategory_id = 9)
(24, 9, 'modelo', 'Modelo', 'seleccion', 1, '["Pañalera", "Inserto", "Cambiador", "Casco Protector Bici", "Arnés/Correa", "Andarín", "Inflable", "Mochila", "Silla para Bici", "Bambineto", "Portabebé y Base", "Adaptador de asiento", "Accesorios carriola", "Organizador", "Chaleco salvavidas", "Salvavidas"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Cunas (subcategory_id = 10)
(25, 10, 'edad_maxima', 'Edad máxima recomendada', 'seleccion', 1, '["7 meses", "36 meses", "Más de 36 meses"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(26, 10, 'modelo', 'Modelo', 'seleccion', 2, '["Cuna Estándar", "Convertible Entrenadora", "Convertible Matrimonial", "Tamaño Moisés", "Cama Junior", "Cama Individual", "Otros Tamaños", "Cuna Cama"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(27, 10, 'con_buros', 'Con burós', 'seleccion', 3, '["Con burós", "Sin Buros"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(28, 10, 'acabado', 'Acabado', 'seleccion', 4, '["Acabado Rústico", "Acabado Regular", "Acabado Fino"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(29, 10, 'tipo_madera', 'Tipos de madera', 'seleccion', 5, '["Madera Regular/Pino", "Madera Fina"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(30, 10, 'incluye_colchon', 'Incluye colchón', 'seleccion', 6, '["Incluye colchón", "No incluye colchón"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Moisés (subcategory_id = 11)
(31, 11, 'modelo', 'Modelo', 'seleccion', 1, '["Colecho", "Moisés"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(32, 11, 'tipo', 'Tipo', 'seleccion', 2, '["Fijo", "Plegable"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(33, 11, 'mecedora', 'Mecedora', 'seleccion', 3, '["Mecedora", "No mecedora"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(34, 11, 'accesorios', 'Accesorios', 'seleccion', 4, '["Con caja de luz y sonidos", "Con Mosquitero", "Accesorios completos", "Sin Accesorios", "Accesorios"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Cuna Pack&Play (subcategory_id = 12)
(35, 12, 'modelo', 'Modelo', 'seleccion', 1, '["Corral", "Segundo piso", "Completa"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(36, 12, 'accesorios', 'Accesorios', 'seleccion', 3, '["Con caja de luz y sonidos", "Con Mosquitero", "Accesorios completos", "Sin Accesorios"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Ropa de cama (subcategory_id = 13)
(37, 13, 'modelo', 'Modelo', 'seleccion', 1, '["Cuna estándar", "Cuna cama", "Cuna de viaje", "Individual", "Matrimonial"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(38, 13, 'tipo', 'Tipo', 'seleccion', 2, '["Cubre barandal", "1 Pieza Edredón", "2 a 3 piezas", "3 a 4 piezas", "Sábanas", "Cobijas", "Cubre colchón", "Moisés"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Colchones (subcategory_id = 14)
(39, 14, 'modelo', 'Modelo', 'seleccion', 1, '["Cuna estándar", "Cuna cama", "Cuna de viaje", "Moisés", "Nido", "Pequeño"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(40, 14, 'tipo', 'Tipo', 'seleccion', 2, '["Sencillo", "Estándar", "Memory Foam", "Antirreflujo", "Cambiador", "Moisés", "Nido"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Almohadas (subcategory_id = 15)
(41, 15, 'modelo', 'Modelo', 'seleccion', 1, '["Embarazo", "Para bebé", "Amamantar"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(42, 15, 'tipo', 'Tipo', 'seleccion', 2, '["Con vibración", "Gemelar", "Regular"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Móviles (subcategory_id = 16)
(43, 16, 'modelo', 'Modelo', 'seleccion', 1, '["Sonido y movimiento", "Con proyector", "Otro"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Barandales (subcategory_id = 17)
(44, 17, 'modelo', 'Modelo', 'seleccion', 1, '["120 cm", "180 cm", "Otro", "100 cm"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(45, 17, 'tipo', 'Tipo', 'seleccion', 2, '["Altura ajustable", "Fijo"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Muebles (subcategory_id = 18)
(46, 18, 'modelo', 'Modelo', 'seleccion', 1, '["Cómoda/cajonera", "Cabecera", "Buró", "Ropero/Closet", "Mecedora para mamá", "Librero", "Cómoda con tina", "Baúl"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Decoración (subcategory_id = 19)
(47, 19, 'modelo', 'Modelo', 'seleccion', 1, '["Álbum Fotos", "Lámparas", "Cuadros", "Humidificador", "Nebulizador", "Bote Pañalero", "Bote Basura/ropa", "Otro", "Sillon con cojin", "Tapete", "Saco de dormir", "Ruido Blanco"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Sillas para comer (subcategory_id = 20)
(48, 20, 'modelo', 'Modelo', 'seleccion', 1, '["Silla alta", "Portátil fijar en silla", "Portátil fijar en mesa"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(49, 20, 'cantidad_posiciones', 'Cantidad de posiciones', 'seleccion', 2, '["Fija", "Niveles de altura", "Giratoria", "Otra"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(50, 20, 'desmontable', 'Desmontable', 'seleccion', 3, '["Charola desmontable", "Silla Desmontable"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(51, 20, 'plegable', 'Plegable', 'seleccion', 4, '["Plegable", "No Plegable"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(52, 20, 'reclinable', 'Reclinable', 'seleccion', 5, '["Reclinable", "No Reclinable"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Termómetros (subcategory_id = 31)
(53, 31, 'modelo', 'Modelo', 'seleccion', 1, '["Eléctrico", "Para Auto"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(54, 31, 'tipo', 'Tipo', 'seleccion', 2, '["Sencillo", "Digital"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Calentadores (subcategory_id = 32)
(55, 32, 'modelo', 'Modelo', 'seleccion', 1, '["Microondas", "Eléctrico"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Esterilizadores (subcategory_id = 33)
(56, 33, 'modelo', 'Modelo', 'seleccion', 1, '["Doble", "Sencillo"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(57, 33, 'tipo_fuente', 'Tipo de fuente', 'seleccion', 2, '["Eléctrico", "Manual"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(58, 33, 'tipo', 'Tipo', 'seleccion', 3, '["Enchufe y Pilas", "Pilas", "No pilas"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(59, 33, 'niveles_succion', 'Niveles de succión', 'seleccion', 4, '["Con Niveles de succión", "Niveles y Tipo de succión", "Sin Niveles de succión"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Extractores (subcategory_id = 34)
(60, 34, 'modelo', 'Modelo', 'seleccion', 1, '["Eléctrico", "Manual"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(61, 34, 'tipo', 'Tipo', 'seleccion', 2, '["Sencillo", "Diferentes funciones"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Accesorios alimentación (subcategory_id = 35)
(62, 35, 'modelo', 'Modelo', 'seleccion', 1, '["Baberos", "Vasos", "Platos", "Cubiertos", "Portavaso", "Desechables", "Red papillas", "Mordederas", "Para papillas", "Escurridor de biberones", "Chupones", "Clip Chupones", "Biberon", "Cepillos", "Accesorios de extractor", "Recolector", "Termo", "Mantel"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Ropa niña (subcategory_id = 36)
(63, 36, 'talla', 'Talla', 'seleccion', 1, '["0-3 meses", "6 meses", "9 meses", "12 meses", "18 meses", "2 años", "3 años", "4 años", "5 años", "6 años", "7 años", "8 años", "9 años"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(64, 36, 'modelo', 'Modelo', 'seleccion', 2, '["Abrigo", "Bata", "Bata de baño", "Comando Grueso", "Comando ligero", "Conjunto corto", "Conjunto largo", "Costalito", "Gabardina", "Impermeable", "Mameluco", "Overall", "Pants completo", "Pañalero exterior", "Pañalero interior", "Pijama corta", "Pijama larga", "Traje Baño Completo", "Vestido niña", "Vestido bebé", "Vestido de fiesta", "Disfraces"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Parte superior niña (subcategory_id = 37)
(65, 37, 'talla', 'Talla', 'seleccion', 1, '["0-3 meses", "6 meses", "9 meses", "12 meses", "18 meses", "2 años", "3 años", "4 años", "5 años", "6 años", "7 años", "8 años", "9 años"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(66, 37, 'modelo', 'Modelo', 'seleccion', 2, '["Blusa Mcorta", "Blusa Mlarga", "Chaleco Grueso", "Chaleco ligero", "Cham.ligera/Romp.", "Chamarra Gruesa", "Chamarra mezclilla", "Gorro/Sombrero", "Guantes", "Moños y diademas", "Playera M corta", "Playera M larga", "Polos M larga", "Polos Mcorta", "Sudadera", "Suéter", "Torero"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Parte inferior niña (subcategory_id = 38)
(67, 38, 'talla', 'Talla', 'seleccion', 1, '["0-3 meses", "6 meses", "9 meses", "12 meses", "18 meses", "2 años", "3 años", "4 años", "5 años", "6 años", "7 años", "8 años", "9 años"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(68, 38, 'modelo', 'Modelo', 'seleccion', 2, '["Bermuda", "Bikini", "Calcetas", "Cinturón", "Falda", "Leggins/ Mallas", "Pantalón Mezclilla", "Pantalón Tela", "Pants", "Short", "Traje de baño 1pza"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Ropa niño (subcategory_id = 39)
(69, 39, 'talla', 'Talla', 'seleccion', 1, '["0-3 meses", "6 meses", "9 meses", "12 meses", "18 meses", "2 años", "3 años", "4 años", "5 años", "6 años", "7 años", "8 años", "9 años"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(70, 39, 'modelo', 'Modelo', 'seleccion', 2, '["Abrigo", "Bata", "Bata de baño", "Traje", "Comando", "Conjunto corto", "Conjunto largo", "Gabardina", "Impermeable", "Mameluco", "Overall", "Pañalero exterior", "Pañalero interior", "Pijama corta", "Pijama larga", "Comando ligero", "Pants completo", "Costalito", "Disfraces"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Parte superior niño (subcategory_id = 40)
(71, 40, 'talla', 'Talla', 'seleccion', 1, '["0-3 meses", "6 meses", "9 meses", "12 meses", "18 meses", "2 años", "3 años", "4 años", "5 años", "6 años", "7 años", "8 años", "9 años"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(72, 40, 'modelo', 'Modelo', 'seleccion', 2, '["Saco", "Camisa Mcorta", "Camisa Mlarga", "Chaleco ligero", "Cham.ligera/Romp.", "Gorro/Sombrero", "Playera M corta", "Polos M larga", "Polos Mcorta", "Sudadera", "Suéter", "Playera M larga", "Guantes", "Tirantes", "Chaleco Grueso", "Chamarra Gruesa", "Chamarra mezclilla"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Parte inferior niño (subcategory_id = 41)
(73, 41, 'talla', 'Talla', 'seleccion', 1, '["0-3 meses", "6 meses", "9 meses", "12 meses", "18 meses", "2 años", "3 años", "4 años", "5 años", "6 años", "7 años", "8 años", "9 años"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(74, 41, 'modelo', 'Modelo', 'seleccion', 2, '["Bermuda", "Calcetas", "Cinturón", "Pantalón deportivo", "Pantalón Mezclilla", "Pantalón Tela", "Pants", "Short", "Traje de baño"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Zapatos niña (subcategory_id = 42)
(75, 42, 'talla', 'Talla', 'seleccion', 1, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(76, 42, 'modelo', 'Modelo', 'seleccion', 2, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Zapatos niño (subcategory_id = 43)
(77, 43, 'talla', 'Talla', 'seleccion', 1, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(78, 43, 'modelo', 'Modelo', 'seleccion', 2, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Accesorios niños (subcategory_id = 44)
(79, 44, 'modelo', 'Modelo', 'seleccion', 1, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Zapatos bebé (subcategory_id = 45)
(80, 45, 'talla', 'Talla', 'seleccion', 1, '["XCH", "CH", "M", "G", "XG"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(81, 45, 'modelo', 'Modelo', 'seleccion', 2, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Juguetes (subcategory_id = 46)
(82, 46, 'modelo', 'Modelo', 'seleccion', 1, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(83, 46, 'edad', 'Rango de edad recomendado', 'seleccion', 2, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Disfraces (subcategory_id = 47)
(84, 47, 'talla', 'Talla', 'seleccion', 1, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(85, 47, 'modelo', 'Modelo', 'seleccion', 2, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Juegos de mesa (subcategory_id = 48)
(86, 48, 'modelo', 'Modelo', 'seleccion', 1, '["Juego de mesa", "Jenga", "Lotería", "Dominó", "UNO", "Rompecabezas", "Ajedrez", "Memory", "Otro"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Instrumentos musicales (subcategory_id = 49)
(87, 49, 'modelo', 'Modelo', 'seleccion', 1, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Libros (subcategory_id = 50)
(88, 50, 'modelo', 'Modelo', 'seleccion', 1, '["Libro interactivo", "Bebes", "Niños", "Lectura", "Rompecabezas"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(89, 50, 'cantidad_piezas', 'Cantidad de piezas', 'seleccion', 2, '["24 piezas", "48 piezas", "100 piezas", "200 piezas", "300 piezas", "500 piezas", "1000 piezas", "Otro"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Gimnasios (subcategory_id = 51)
(90, 51, 'modelo', 'Modelo', 'seleccion', 1, '["Gimnasio", "Tapete", "Tapete Actividades"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(91, 51, 'tipo', 'Tipo', 'seleccion', 2, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Bouncers (subcategory_id = 52)
(92, 52, 'modelo', 'Modelo', 'seleccion', 1, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(93, 52, 'con_luz_sonido', 'Con luces y sonido', 'seleccion', 2, '["Luces y sonido", "Sin luces y sonido"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Montables/Andadores (subcategory_id = 53)
(94, 53, 'modelo', 'Modelo', 'seleccion', 1, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(95, 53, 'con_luz_sonido', 'Con luces y sonido', 'seleccion', 2, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Coches (subcategory_id = 54)
(96, 54, 'modelo', 'Modelo', 'seleccion', 1, '["Eléctrico", "Pedales", "Empuje"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),
(97, 54, 'tipo', 'Tipo', 'seleccion', 2, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Bicicletas infantiles (subcategory_id = 55)
(98, 55, 'modelo', 'Modelo', 'seleccion', 1, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(99, 55, 'ruedas_auxiliares', 'Ruedas auxiliares', 'seleccion', 2, '["Con ruedas auxiliares", "Sin ruedas auxiliares", "3 en 1", "Con accesorios"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false),

-- Patinetas infantiles (subcategory_id = 56)
(100, 56, 'modelo', 'Modelo', 'seleccion', 1, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),

-- Muebles grandes (subcategory_id = 57)
(101, 57, 'modelo', 'Modelo', 'seleccion', 1, '[]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, true),
(102, 57, 'tamano', 'Tamaño', 'seleccion', 2, '["Pequeño", "Mediano", "Grande"]', '2024-01-01 00:00:00', '2024-01-01 00:00:00', false, false);

-- Resetear la secuencia al valor máximo
SELECT setval('feature_definitions_id_seq', (SELECT MAX(id) FROM feature_definitions));

-- Crear índice para optimizar consultas por offer_print
CREATE INDEX IF NOT EXISTS idx_feature_definitions_offer_print 
ON feature_definitions(subcategory_id, offer_print) 
WHERE offer_print = true;