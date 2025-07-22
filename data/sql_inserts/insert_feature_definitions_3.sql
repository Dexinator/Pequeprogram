-- Inserciones para feature_definitions (subcategorías 21-30)

-- Subcategoría 21: Mecedoras y Columpios de bebé
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(21, 'modelo', 'Modelo', 'seleccion', 1, '["Silla Mecedora", "Columpio mecedora"]', true),
(21, 'con_melodias', 'Con Melodías/sonidos de Naturaleza', 'seleccion', 2, '["Con Melodías y sonidos", "Sin Melodias"]', true),
(21, 'con_vibracion', 'Con sistema de vibración', 'seleccion', 3, '["Vibración", "Sin Vibración"]', true),
(21, 'cantidad_posiciones', 'Cantidad de posiciones', 'seleccion', 4, '["Fija", "Posiciones"]', true),
(21, 'con_barra_juguetes', 'Con barra de juguetes desmontable', 'seleccion', 5, '["Con barra de juguetes desmontable", "Sin barra de juguetes desmontable"]', true),
(21, 'plegable', 'Plegable', 'seleccion', 6, '["Plegable", "No Plegable"]', true),
(21, 'alimentacion_energia', 'Alimentación de energía', 'seleccion', 7, '["Enchufe eléctrico", "Baterías", "No aplica"]', true);

-- Subcategoría 22: Brincolines
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(22, 'modelo', 'Modelo', 'seleccion', 1, '["Base luz y sonido", "De puerta"]', true);

-- Subcategoría 23: Corrales
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(23, 'modelo', 'Modelo', 'seleccion', 1, '["8 paneles", "6 paneles", "Otro"]', true),
(23, 'tipo', 'Tipo', 'seleccion', 2, '["Con Puerta", "Cerrado"]', true);

-- Subcategoría 24: Protectores y seguros
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(24, 'modelo', 'Modelo', 'seleccion', 1, '["Esquina", "Contactos", "Gabinete", "Refrigerador", "Puerta", "Cajón", "Baño", "Estufa", "Antiderrapantes", "Casco Gateo"]', true);

-- Subcategoría 25: Puertas de seguridad
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(25, 'modelo', 'Modelo', 'seleccion', 1, '["Montaje", "A presión", "A presión o Montaje"]', true),
(25, 'tipo', 'Tipo', 'seleccion', 2, '["Plástico", "Tela", "Madera", "Metálica"]', true);

-- Subcategoría 26: Monitores
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(26, 'modelo', 'Modelo', 'seleccion', 1, '["Con Sonido", "Sonido y Video", "Movimiento y Video"]', true);

-- Subcategoría 27: Higiene y accesorios
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(27, 'modelo', 'Modelo', 'seleccion', 1, '["Base bañera", "Hamaca", "Reductor", "Entrenador sonidos", "Entrenador sencillo", "Cepillo de dientes", "Aspirador Nasal", "Cortaúñas", "Juego de higiene", "Toallitas húmedas", "Bio Filtros", "Toallas Femeninas", "Repuesto bote pañalero", "Calentador de Toallitas", "Termómetros", "Otro", "Bote pañalero", "Bacinica", "Asiento entrenador", "Esalera para baño", "Pañales", "Nica Portatil", "Hielera", "Escalera para baño"]', true);

-- Subcategoría 28: Bañeras
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(28, 'modelo', 'Modelo', 'seleccion', 1, '["Tina", "Con base", "Con base y cambiador", "Otro"]', true),
(28, 'plegable', 'Plegable', 'seleccion', 2, '["Plagable", "No plegable", "Plegable"]', true);

-- Subcategoría 29: Pañales
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(29, 'modelo', 'Modelo', 'seleccion', 1, '["Desechables", "Ecológicos", "Entrenadores", "Acuáticos"]', true);

-- Subcategoría 30: Lactancia
INSERT INTO feature_definitions
(subcategory_id, name, display_name, type, order_index, options, mandatory)
VALUES
(30, 'modelo', 'Modelo', 'seleccion', 1, '["Biberón", "Tetina", "Bolsas recolectoras", "Bolsas para esterilizar", "Protector de senos", "Mandil Lactancia", "Brasiere Lactancia", "Otro"]', true),
(30, 'unidades_envase', 'Unidades por envase', 'seleccion', 2, '["1 unidad", "2 unidades", "4 unidades", "8 unidades", "Otro"]', true),
(30, 'unidad_capacidad', 'Unidad de Capacidad en volúmen', 'seleccion', 3, '["Onzas", "Mililitros", "NA"]', true),
(30, 'capacidad', 'Capacidad en volumen', 'seleccion', 4, '["3 Oz / 90ml", "4 Oz / 120ml", "8 Oz / 240ml", "NA"]', true),
(30, 'libre_bpa', 'Es libre de bpa', 'seleccion', 5, '["Libre BPA", "NA"]', true),
(30, 'sistema_anticolicos', 'Con sistema anticólicos', 'seleccion', 6, '["Sistema Anticólicos", "NA"]', true); 