-- Inserciones para feature_definitions (subcategorías 41-57)

-- Subcategoría 41: Niño abajo de cintura
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(41, 'talla', 'Talla', 'seleccion', 1, '["0-3 meses", "6 meses", "9 meses", "12 meses", "18 meses", "2 años", "3 años", "4 años", "5 años", "6 años", "7 años", "8 años", "10 años", "12 años", "14 años", "13 años", "9 años", "11 años"]', true),
(41, 'modelo', 'Modelo', 'seleccion', 2, '["Bermuda", "Calcetas", "Cinturón", "Pantalón deportivo", "Pantalón Mezclilla", "Pantalón Tela", "Pants", "Short", "Traje de baño"]', true);

-- Subcategoría 42: Calzado Niña
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(42, 'talla', 'Talla', 'seleccion', 1, '["0-3 meses", "3-6 meses", "6-9 meses", "6-12 meses", "12-18 meses", "9-12 meses", "12 a 14", "15 a 17", "18", "19", "20", "22", "21", "23", "24", "25", "26", "27", "28", "30", "31", "32", "33", "34", "29"]', true),
(42, 'modelo', 'Modelo', 'seleccion', 2, '["Agua/Playa", "Ballerina", "Bota", "Calcetín", "Crocs", "Deportivo", "Escolar", "Pantuflas", "Sandalia", "Tenis", "Zapato", "Primeros Pasos"]', true);

-- Subcategoría 43: Calzado Niño
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(43, 'talla', 'Talla', 'seleccion', 1, '["0-3 meses", "3-6 meses", "6-9 meses", "6-12 meses", "12-18 meses", "9-12 meses", "12 a 14", "15 a 17", "18", "19", "20", "22", "21", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "35", "34", "36", "37"]', true),
(43, 'modelo', 'Modelo', 'seleccion', 2, '["Agua/Playa", "Bota", "Calcetín", "Crocs", "Deportivo", "Escolar", "Pantuflas", "Sandalia", "Tenis", "Zapato", "Primeros Pasos"]', true);

-- Subcategoría 44: Accesorios y Bolsas de Dama
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(44, 'modelo', 'Modelo', 'seleccion', 1, '["Accesorios", "Bolsas", "Sombreros"]', true);

-- Subcategoría 45: Ropa de Dama y Maternidad
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(45, 'talla', 'Talla', 'seleccion', 1, '["XCH", "CH", "M", "G", "XG"]', true),
(45, 'modelo', 'Modelo', 'seleccion', 2, '["Accesorios", "Blusa", "Blusón", "Conjunto", "Falda", "Leggin", "Pijama", "Ropa interior", "Suéter", "Top", "Vestido"]', true);

-- Subcategoría 46: Juguetes
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(46, 'modelo', 'Modelo', 'seleccion', 1, '["Alberca", "Andadera", "Andadera interactiva", "Armable", "Avión", "Aviones", "Barbie", "Barquito", "Barricada", "Bebé Reborn", "Bebés con accesorios", "Bebés y Accesorios", "Big foot", "Block con casita", "Bloques de foam", "Bloques de madera", "Bloques tipo lego", "Bola suave", "Bolitas de pelotas", "Camión escala", "Carro con control remoto", "Carro escala", "Carro montable", "Carros", "Carrusel", "Casa de muñecas", "Casitas", "Castillo Frozen", "Control remoto", "Costura", "Creciendo conmigo", "Cuna de muñeca", "Dron", "Espada", "Estudio Maquillaje", "Gallina con huevos", "Globo terraqueo", "Golpe topo", "Guitarra", "Helicóptero", "Instrumentos", "Instrumentos Musicales", "Interactivo", "Interactivos", "Juegos de Cocina", "Juegos de Herramienta", "Juegos de Limpieza", "Juegos de te", "Kit repostería", "Lanchas", "LIbritos", "Libro sonoro", "Llaveros", "Maleable", "Masas", "Mat acuática", "Max Stell", "Mecánico", "Mochila con sonido", "Monedero", "Motos", "Muñecos", "Musicales", "Osito", "Pandero", "Paquete de pelotas", "PAr de mitones", "Pato", "Pelotas", "Pesa cocodrilo", "Piano", "Piezas de encaje", "Pimpones", "Pistola Nerf", "Pistola pelotas", "Pistolas", "Play Doh", "Portavasos", "Ranitas", "Robot", "Sapo", "Servilleteros", "Set Barcos", "Set de aviones", "Set de Carros", "Set de fútbol", "Set de motocicletas", "Set montables", "Serpientes y escaleras", "Slime", "Soldaditos", "Sonidos de animales", "Teatro", "Teléfono", "Torre Bloques", "Torre Jenga", "Tractor", "Tren", "Vídeo juegos"]', true),
(46, 'edad', 'Rango de edad recomendado', 'seleccion', 2, '["0-6 meses", "0-12 meses", "6-12 meses", "12 meses o más", "2 años o más", "3 años o más", "4 años o más", "5 años o más", "6 años o más", "7 años o más", "8 años o más", "9 años o más", "10 años o más"]', true);

-- Subcategoría 47: Disfraces
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(47, 'talla', 'Talla', 'seleccion', 1, '["0-6 meses", "6-12 meses", "12-18 meses", "18-24 meses", "2 años", "3 años", "4 años", "5 años", "6 años", "7 años", "8 años", "10 años", "12 años"]', true),
(47, 'modelo', 'Modelo', 'seleccion', 2, '["Superman", "Batman", "Spiderman", "Princesa", "Hada", "Animal", "Superhéroe", "Personaje TV", "Otro"]', true);

-- Subcategoría 48: Juegos de mesa
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(48, 'modelo', 'Modelo', 'seleccion', 1, '["Serpientes y Escaleras", "Jenga", "Lotería", "Dominó", "UNO", "Rompecabezas", "Ajedrez", "Memory", "Otro"]', true),
(48, 'para_edad', 'Para edad', 'seleccion', 2, '["1 a 3 años", "3 a 5 años", "Mas de 5 años"]', true);

-- Subcategoría 49: Mesa de actividades
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(49, 'modelo', 'Modelo', 'seleccion', 1, '["Con luces y sonidos", "Didáctica", "Con piezas", "Simple"]', true),
(49, 'edad', 'Rango de edad recomendado', 'seleccion', 2, '["0-6 meses", "6-12 meses", "12-18 meses", "18-24 meses", "2 años", "3 años", "4 años", "5 años", "6 años"]', true);

-- Subcategoría 50: Libros y rompecabezas
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(50, 'modelo', 'Modelo', 'seleccion', 1, '["Libro interactivo", "Libro normal", "Rompecabezas", "Cubo Rubik", "Otro"]', true),
(50, 'cantidad_piezas', 'Cantidad de piezas', 'seleccion', 2, '["24 piezas", "48 piezas", "100 piezas", "200 piezas", "300 piezas", "500 piezas", "1000 piezas", "Otro", "NA"]', true);

-- Subcategoría 51: Gimnasios y tapetes
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(51, 'modelo', 'Modelo', 'seleccion', 1, '["Gimnasio", "Tapete", "Tapete Actividades"]', true),
(51, 'tipo', 'Tipo', 'seleccion', 2, '["Suave", "Plástico", "Con luz y sonido", "Didáctico", "Otro"]', true);

-- Subcategoría 52: Andaderas
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(52, 'modelo', 'Modelo', 'seleccion', 1, '["Con bandeja", "Sin bandeja", "Interactiva"]', true),
(52, 'con_luz_sonido', 'Con luces y sonido', 'seleccion', 2, '["Luces y sonido", "Sin luces y sonido"]', true);

-- Subcategoría 53: Montables y correpasillos Bebé
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(53, 'modelo', 'Modelo', 'seleccion', 1, '["Correpasillos", "Montable", "Avión", "Moto", "Caballo", "Auto", "Otro"]', true),
(53, 'con_luz_sonido', 'Con luces y sonido', 'seleccion', 2, '["Luces y sonido", "Sin luces y sonido"]', true);

-- Subcategoría 54: Montables de exterior
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(54, 'modelo', 'Modelo', 'seleccion', 1, '["Auto", "Moto", "Jeep", "Cuatrimoto", "Tractor", "Otro"]', true),
(54, 'tipo', 'Tipo', 'seleccion', 2, '["Eléctrico", "Pedales", "Manual"]', true);

-- Subcategoría 55: Triciclos y bicicletas
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(55, 'modelo', 'Modelo', 'seleccion', 1, '["Triciclo", "Bicicleta R-12", "Bicicleta R-16", "Bicicleta R-20", "Bicicleta de equilibrio", "Otro"]', true),
(55, 'ruedas_auxiliares', 'Ruedas auxiliares', 'seleccion', 2, '["Con ruedas auxiliares", "Sin ruedas auxiliares", "NA"]', true);

-- Subcategoría 56: Sobre ruedas
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(56, 'modelo', 'Modelo', 'seleccion', 1, '["Patines", "Patineta", "Scooter", "Avalancha", "Otro"]', true);

-- Subcategoría 57: Juegos grandes
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(57, 'modelo', 'Modelo', 'seleccion', 1, '["Alberca", "Brincolin", "Casita", "Resbaladilla", "Columpio", "Otro"]', true),
(57, 'tamano', 'Tamaño', 'seleccion', 2, '["Pequeño", "Mediano", "Grande"]', true); 