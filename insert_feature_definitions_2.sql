-- Inserciones para feature_definitions (subcategorías 11-20)

-- Subcategoría 11: Colechos y Moisés
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(11, 'modelo', 'Modelo', 'seleccion', 1, '["Colecho", "Moisés"]', true),
(11, 'tipo', 'Tipo', 'seleccion', 2, '["Fijo", "Plegable"]', true),
(11, 'mecedora', 'Mecedora', 'seleccion', 3, '["Mecedora", "No mecedora"]', true),
(11, 'accesorios', 'Accesorios', 'seleccion', 4, '["Con caja de luz y sonidos", "Con Mosquitero", "Accesorios completos", "Sin Accesorios", "Accesorios"]', true);

-- Subcategoría 12: Cunas de viaje
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(12, 'modelo', 'Modelo', 'seleccion', 1, '["Corral", "Segundo piso", "Completa"]', true),
(12, 'tipo', 'Tipo', 'seleccion', 2, '["Mecedora", "No mecedora"]', true),
(12, 'accesorios', 'Accesorios', 'seleccion', 3, '["Con caja de luz y sonidos", "Con Mosquitero", "Accesorios completos", "Sin Accesorios"]', true);

-- Subcategoría 13: Juegos de cuna
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(13, 'modelo', 'Modelo', 'seleccion', 1, '["Cuna estándar", "Cuna cama", "Cuna de viaje", "Moisés", "Matrimonial"]', true),
(13, 'tipo', 'Tipo', 'seleccion', 2, '["Cubre barandal", "1 Pieza Edredón", "2 a 3 piezas", "3 a 4 piezas", "Sábanas", "Cobijas", "Cubre colchón", "Moisés"]', true);

-- Subcategoría 14: Colchones
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(14, 'modelo', 'Modelo', 'seleccion', 1, '["Cuna estándar", "Cuna cama", "Cuna de viaje", "Moisés", "Nido", "Pequeño"]', true),
(14, 'tipo', 'Tipo', 'seleccion', 2, '["Sencillo", "Estándar", "Memory Foam", "Antirreflujo", "Cambiador", "Moisés", "Nido"]', true);

-- Subcategoría 15: Almohadas y donas
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(15, 'modelo', 'Modelo', 'seleccion', 1, '["Embarazo", "Para bebé", "Amamantar"]', true),
(15, 'tipo', 'Tipo', 'seleccion', 2, '["Con vibración", "Gemelar", "Regular"]', true);

-- Subcategoría 16: Móviles de cuna
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(16, 'modelo', 'Modelo', 'seleccion', 1, '["Sonido y movimiento", "Con proyector", "Otro"]', true);

-- Subcategoría 17: Barandal para cama
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(17, 'modelo', 'Modelo', 'seleccion', 1, '["120 cm", "180 cm", "Otro", "100 cm"]', true),
(17, 'tipo', 'Tipo', 'seleccion', 2, '["Altura ajustable", "Fijo"]', true);

-- Subcategoría 18: Muebles de recámara
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(18, 'modelo', 'Modelo', 'seleccion', 1, '["Cómoda/cajonera", "Cabecera", "Buró", "Ropero/Closet", "Mecedora para mamá", "Librero", "Cómoda con tina", "Baúl"]', true);

-- Subcategoría 19: Accesorios Recámara
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(19, 'modelo', 'Modelo', 'seleccion', 1, '["Álbum Fotos", "Lámparas", "Cuadros", "Humidificador", "Nebulizador", "Bote Pañalero", "Bote Basura/ropa", "Otro", "Sillon con cojin", "Tapete", "Saco de dormir", "Ruido Blanco"]', true);

-- Subcategoría 20: Sillas para comer
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(20, 'modelo', 'Modelo', 'seleccion', 1, '["Silla alta", "Portátil fijar en silla", "Portátil fijar en mesa", "Fisher Price", "Sin portabebé"]', true),
(20, 'cantidad_posiciones', 'Cantidad de posiciones', 'seleccion', 2, '["Fija", "Niveles de altura", "Giratoria", "Otra"]', true),
(20, 'desmontable', 'Desmontable', 'seleccion', 3, '["Charola desmontable", "Silla Desmontable", "No Travel System", "Sencilla"]', true),
(20, 'plegable', 'Plegable', 'seleccion', 4, '["Plegable", "No Plegable"]', true),
(20, 'reclinable', 'Reclinable', 'seleccion', 5, '["Reclinable", "No Reclinable", "No 3en1"]', true); 