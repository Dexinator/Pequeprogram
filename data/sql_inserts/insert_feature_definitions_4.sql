-- Inserciones para feature_definitions (subcategorías 31-40)

-- Subcategoría 31: Calentador de biberones
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(31, 'modelo', 'Modelo', 'seleccion', 1, '["Eléctrico", "Para Auto", "Resbaladillas"]', true),
(31, 'tipo', 'Tipo', 'seleccion', 2, '["Sencillo", "Digital", "Almacén General"]', true);

-- Subcategoría 32: Esterilizador de biberones
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(32, 'modelo', 'Modelo', 'seleccion', 1, '["Microondas", "Eléctrico"]', true);

-- Subcategoría 33: Extractores de leche
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(33, 'modelo', 'Modelo', 'seleccion', 1, '["Doble", "Sencillo"]', true),
(33, 'tipo_fuente', 'Tipo de fuente', 'seleccion', 2, '["Eléctrico", "Manual"]', true),
(33, 'tipo', 'Tipo', 'seleccion', 3, '["Enchufe y Pilas", "Pilas", "No pilas"]', true),
(33, 'niveles_succion', 'Niveles de succión', 'seleccion', 4, '["Con Niveles de succión", "Niveles y Tipo de succión", "Sin Niveles de succión"]', true);

-- Subcategoría 34: Procesador de alimentos
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(34, 'modelo', 'Modelo', 'seleccion', 1, '["Eléctrico", "Manual"]', true),
(34, 'tipo', 'Tipo', 'seleccion', 2, '["Sencillo", "Diferentes funciones"]', true);

-- Subcategoría 35: Accesorios de alimentación
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(35, 'modelo', 'Modelo', 'seleccion', 1, '["Baberos", "Vasos", "Platos", "Cubiertos", "Portavaso", "Desechables", "Red papillas", "Mordederas", "Para papillas", "Escurridor de biberones", "Chupones", "Clip Chupones", "Biberon", "Cepillos", "Accesorios de extractor", "Recolector", "Termo", "Mantel"]', true);

-- Subcategoría 36: Niña cuerpo completo
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(36, 'talla', 'Talla', 'seleccion', 1, '["0-3 meses", "6 meses", "9 meses", "12 meses", "18 meses", "2 años", "3 años", "4 años", "5 años", "6 años", "7 años", "8 años", "10 años", "12 años", "9 años"]', true),
(36, 'modelo', 'Modelo', 'seleccion', 2, '["Abrigo", "Bata", "Bata de baño", "Comando", "Comando ligero", "Conjunto corto", "Conjunto largo", "Costalito", "Gabardina", "Impermeable", "Mameluco", "Overall", "Pants completo", "Pañalero exterior", "Pañalero interior", "Pijama corta", "Pijama larga", "Traje Baño Completo", "Vestido niña", "Vestido bebé", "Vestido de fiesta", "Disfraces"]', true);

-- Subcategoría 37: Niña arriba de cintura
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(37, 'talla', 'Talla', 'seleccion', 1, '["0-3 meses", "6 meses", "9 meses", "12 meses", "18 meses", "2 años", "3 años", "4 años", "5 años", "6 años", "7 años", "8 años", "10 años", "12 años", "14 años"]', true),
(37, 'modelo', 'Modelo', 'seleccion', 2, '["Blusa Mcorta", "Blusa Mlarga", "Chaleco Grueso", "Chaleco ligero", "Cham.ligera/Romp.", "Chamarra Gruesa", "Chamarra mezclilla", "Gorro/Sombrero", "Guantes", "Moños y diademas", "Playera M corta", "Playera M larga", "Polos M larga", "Polos Mcorta", "Sudadera", "Suéter", "Torero"]', true);

-- Subcategoría 38: Niña abajo de cintura
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(38, 'talla', 'Talla', 'seleccion', 1, '["0-3 meses", "6 meses", "9 meses", "12 meses", "18 meses", "2 años", "3 años", "4 años", "5 años", "6 años", "7 años", "9 años", "10 años", "8 años", "12 años", "14 años", "11 años"]', true),
(38, 'modelo', 'Modelo', 'seleccion', 2, '["Bermuda", "Bikini", "Calcetas", "Cinturón", "Falda", "Leggins/ Mallas", "Pantalón Mezclilla", "Pantalón Tela", "Pants", "Short", " Traje de baño 1pza "]', true);

-- Subcategoría 39: Niño cuerpo completo
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(39, 'talla', 'Talla', 'seleccion', 1, '["0-3 meses", "6 meses", "9 meses", "12 meses", "18 meses", "2 años", "3 años", "4 años", "5 años", "6 años", "7 años"]', true),
(39, 'modelo', 'Modelo', 'seleccion', 2, '["Abrigo", "Bata", "Bata de baño", "Traje", "Comando", "Conjunto corto", "Conjunto largo", "Gabardina", "Impermeable", "Mameluco", "Overall", "Pañalero exterior", "Pañalero interior", "Pijama corta", "Pijama larga", "Comando ligero", "Pants completo", "Costalito", "Disfraces"]', true);

-- Subcategoría 40: Niño arriba de cintura
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(40, 'talla', 'Talla', 'seleccion', 1, '["0-3 meses", "6 meses", "9 meses", "12 meses", "18 meses", "2 años", "3 años", "4 años", "5 años", "6 años", "7 años", "14 años", "10 años", "8 años", "11 años", "12 años", "13 años"]', true),
(40, 'modelo', 'Modelo', 'seleccion', 2, '["Saco", "Camisa Mcorta", "Camisa Mlarga", "Chaleco ligero", "Cham.ligera/Romp.", "Gorro/Sombrero", "Playera M corta", "Polos M larga", "Polos Mcorta", "Sudadera", "Suéter", "Playera M larga", "Guantes", "Tirantes", "Chaleco Grueso", "Chamarra Gruesa", "Chamarra mezclilla", "Sarape Mexicano"]', true); 