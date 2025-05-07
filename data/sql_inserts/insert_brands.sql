-- Script para insertar marcas en la tabla brands
-- Las marcas se extrajeron del archivo full cboxes.csv
-- El renown se asignó según el criterio de reconocimiento de marca

-- Carriolas (subcategoría id 3)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 3, 'Normal'),
  ('Prinsel', 3, 'Normal'),
  ('Chicco', 3, 'Premium'),
  ('Infanti', 3, 'Normal'),
  ('Evenflo', 3, 'Normal'),
  ('Graco', 3, 'Alta'),
  ('Brevi', 3, 'Normal'),
  ('The first years', 3, 'Normal'),
  ('Britax', 3, 'Alta'),
  ('ABC Design', 3, 'Alta'),
  ('Stokke', 3, 'Premium'),
  ('Maxicosi', 3, 'Alta'),
  ('Mama Mia', 3, 'Normal'),
  ('PegPérego', 3, 'Alta'),
  ('Baby Trend', 3, 'Normal'),
  ('Pock It', 3, 'Normal'),
  ('Phill&Teds', 3, 'Alta'),
  ('Quinny', 3, 'Alta'),
  ('Safety 1st', 3, 'Normal'),
  ('UppaBaby', 3, 'Premium'),
  ('Baby Jogger', 3, 'Alta'),
  ('CityMini', 3, 'Alta'),
  ('Orbit Baby', 3, 'Alta'),
  ('Mima', 3, 'Premium'),
  ('Cybex', 3, 'Premium'),
  ('Maclaren', 3, 'Alta'),
  ('Sorel', 3, 'Normal'),
  ('Silver Cross', 3, 'Premium'),
  ('Inglesina', 3, 'Alta'),
  ('Nuna', 3, 'Premium'),
  ('Bebeconfort', 3, 'Alta'),
  ('Bugaboo', 3, 'Premium'),
  ('D Bebé', 3, 'Normal'),
  ('Diono', 3, 'Alta'),
  ('Yoyo', 3, 'Alta'),
  ('Joie', 3, 'Alta'),
  ('City Mini', 3, 'Alta'),
  ('Phil&Teds', 3, 'Alta'),
  ('Donna', 3, 'Normal'),
  ('BabyZenl', 3, 'Alta'),
  ('Thule', 3, 'Premium'),
  ('Joovy', 3, 'Alta'),
  ('Buggy pod', 3, 'Normal'),
  ('Dogona', 3, 'Normal'),
  ('Hot Mom', 3, 'Normal'),
  ('Mc Laren', 3, 'Alta'),
  ('zIPPY', 3, 'Normal'),
  ('kolcraft', 3, 'Normal'),
  ('GB', 3, 'Normal'),
  ('BabyJogger', 3, 'Alta'),
  ('Joolz', 3, 'Alta'),
  ('Kelly', 3, 'Normal');

-- Cunas de madera (subcategoría id 10)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 10, 'Normal'),
  ('Mi Cuna', 10, 'Normal'),
  ('La Cuna Encantada', 10, 'Normal'),
  ('Baby Smile', 10, 'Normal'),
  ('Grand home', 10, 'Normal'),
  ('Munire furniture', 10, 'Alta'),
  ('Ikea', 10, 'Normal'),
  ('Mon Caramel', 10, 'Normal'),
  ('Bloom', 10, 'Alta'),
  ('Carters', 10, 'Alta'),
  ('Pottery Barn', 10, 'Premium'),
  ('Madera Fina', 10, 'Alta'),
  ('Baby&Kids', 10, 'Normal'),
  ('Babys and Kids', 10, 'Normal'),
  ('Aranjuez', 10, 'Normal');

-- Autoasientos (subcategoría id 1)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 1, 'Normal'),
  ('Prinsel', 1, 'Normal'),
  ('Chicco', 1, 'Premium'),
  ('Infanti', 1, 'Normal'),
  ('Evenflo', 1, 'Normal'),
  ('Graco', 1, 'Alta'),
  ('Brevi', 1, 'Normal'),
  ('The first years', 1, 'Normal'),
  ('Britax', 1, 'Alta'),
  ('PegPérego', 1, 'Alta'),
  ('Stokke', 1, 'Premium'),
  ('Maxicosi', 1, 'Alta'),
  ('BeSafe', 1, 'Alta'),
  ('Sorel', 1, 'Normal'),
  ('Cybex', 1, 'Premium'),
  ('Alpha omega', 1, 'Normal'),
  ('Safety 1st', 1, 'Normal'),
  ('Cosco', 1, 'Normal'),
  ('Dbebe', 1, 'Normal'),
  ('Mon Caramel', 1, 'Normal'),
  ('Nuna', 1, 'Premium'),
  ('Prinsel', 1, 'Normal'),
  ('Joie', 1, 'Alta'),
  ('Mifold', 1, 'Normal');

-- Sillas para bicicleta (subcategoría id 7)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 7, 'Normal'),
  ('Polissport', 7, 'Normal'),
  ('Thule', 7, 'Premium'),
  ('Bobike', 7, 'Alta'),
  ('Hamax', 7, 'Alta'),
  ('Topeak', 7, 'Alta');

-- Cargando al peque (subcategoría id 2)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 2, 'Normal'),
  ('Prinsel', 2, 'Normal'),
  ('Chicco', 2, 'Premium'),
  ('Infanti', 2, 'Normal'),
  ('Evenflo', 2, 'Normal'),
  ('BabyBjorn', 2, 'Premium'),
  ('Ergobaby', 2, 'Premium'),
  ('Infantino', 2, 'Normal'),
  ('Changuitos', 2, 'Sencilla'),
  ('Manduca', 2, 'Alta'),
  ('D Yali', 2, 'Normal'),
  ('JJ Cole', 2, 'Normal'),
  ('Kristian', 2, 'Normal'),
  ('Lulyboo', 2, 'Normal'),
  ('Saddle Baby', 2, 'Normal'),
  ('Mon Caramel', 2, 'Normal'),
  ('Babyanny', 2, 'Normal'),
  ('Babuu', 2, 'Normal'),
  ('Stokke', 2, 'Premium'),
  ('Collections', 2, 'Normal'),
  ('Home line baby', 2, 'Normal'),
  ('Baby Mobel', 2, 'Normal'),
  ('Marsupial', 2, 'Normal'),
  ('Bobba', 2, 'Normal'),
  ('Cybex', 2, 'Premium'),
  ('Avi', 2, 'Normal'),
  ('Boppy', 2, 'Normal'),
  ('Britax', 2, 'Alta'),
  ('Marsupi', 2, 'Normal'),
  ('Twingar', 2, 'Normal'),
  ('Twingo', 2, 'Normal'),
  ('Koala Kin', 2, 'Normal'),
  ('Yemaya', 2, 'Normal'),
  ('LILLE', 2, 'Normal'),
  ('La Barriguita de mama', 2, 'Sencilla'),
  ('Baby Gaon', 2, 'Normal'),
  ('Diva Essenza', 2, 'Normal'),
  ('D Yaly', 2, 'Normal'),
  ('Bebear', 2, 'Normal'),
  ('Graco', 2, 'Alta'),
  ('TushBaby', 2, 'Normal');

-- Accesorios Carriola y Auto (subcategoría id 4)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 4, 'Normal'),
  ('Prinsel', 4, 'Normal'),
  ('Chicco', 4, 'Premium'),
  ('Infanti', 4, 'Normal'),
  ('Evenflo', 4, 'Normal'),
  ('Graco', 4, 'Alta'),
  ('Brevi', 4, 'Normal'),
  ('The first years', 4, 'Normal'),
  ('Britax', 4, 'Alta'),
  ('ABC Design', 4, 'Alta'),
  ('Stokke', 4, 'Premium'),
  ('Fisher Price', 4, 'Alta'),
  ('Tiny Love', 4, 'Alta'),
  ('Prince Lionheart', 4, 'Normal'),
  ('Stroller', 4, 'Normal'),
  ('Baby jogger', 4, 'Alta'),
  ('Skip hop', 4, 'Alta'),
  ('Cozy Carrier', 4, 'Normal'),
  ('Pac Back', 4, 'Normal'),
  ('Gap', 4, 'Alta'),
  ('Buggy Board', 4, 'Normal'),
  ('Ideas', 4, 'Sencilla'),
  ('Smart elf', 4, 'Normal'),
  ('YoYo', 4, 'Alta'),
  ('Ezimoov', 4, 'Normal');

-- Otros de Paseo (subcategoría id 9)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 9, 'Normal'),
  ('Prinsel', 9, 'Normal'),
  ('Chicco', 9, 'Premium'),
  ('Infanti', 9, 'Normal'),
  ('Evenflo', 9, 'Normal'),
  ('Graco', 9, 'Alta'),
  ('Brevi', 9, 'Normal'),
  ('The first years', 9, 'Normal'),
  ('Britax', 9, 'Alta'),
  ('Safety 1st', 9, 'Normal'),
  ('Stokke', 9, 'Premium'),
  ('Tiny Love', 9, 'Alta'),
  ('Fisher Price', 9, 'Alta'),
  ('Cloe', 9, 'Normal'),
  ('Coach', 9, 'Premium'),
  ('Avi Collections', 9, 'Normal'),
  ('Fisher Price', 9, 'Alta'),
  ('Jean Book', 9, 'Normal'),
  ('Marvel', 9, 'Alta'),
  ('Swimways', 9, 'Normal'),
  ('Campanita', 9, 'Sencilla'),
  ('Uppababy', 9, 'Premium'),
  ('Baby Star', 9, 'Normal'),
  ('Salvavidas', 9, 'Sencilla'),
  ('Toto', 9, 'Normal'),
  ('Chenson', 9, 'Normal'),
  ('Delta Baby', 9, 'Normal'),
  ('Eddie Bauer', 9, 'Alta'),
  ('Panbitt', 9, 'Normal'),
  ('Ride Safer', 9, 'Normal'),
  ('Skip Hop', 9, 'Alta'),
  ('Hornit', 9, 'Normal'),
  ('Btwin', 9, 'Normal'),
  ('Spin Master', 9, 'Alta'),
  ('Sombras', 9, 'Sencilla'),
  ('Buggy Butler', 9, 'Normal'),
  ('Accesorio', 9, 'Sencilla'),
  ('Happy Walk', 9, 'Normal'),
  ('Arnes', 9, 'Sencilla'),
  ('Thule', 9, 'Premium'),
  ('Kipling', 9, 'Alta'),
  ('International Traveller', 9, 'Normal'),
  ('Distroller', 9, 'Alta'),
  ('Its Imagical', 9, 'Normal'),
  ('Manboo baby', 9, 'Normal'),
  ('Bestway', 9, 'Normal'),
  ('Bami', 9, 'Normal'),
  ('Moose', 9, 'Normal'),
  ('Oxelo', 9, 'Normal');

-- Colechos y Moisés (subcategoría id 11)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 11, 'Normal'),
  ('Prinsel', 11, 'Normal'),
  ('Chicco', 11, 'Premium'),
  ('Infanti', 11, 'Normal'),
  ('Evenflo', 11, 'Normal'),
  ('Graco', 11, 'Alta'),
  ('Brevi', 11, 'Normal'),
  ('The first years', 11, 'Normal'),
  ('Fisher Price', 11, 'Alta'),
  ('Babymobel', 11, 'Normal'),
  ('Snuggle Nest', 11, 'Alta'),
  ('Mon Caramel', 11, 'Normal'),
  ('Dreams', 11, 'Normal'),
  ('Madera Fina', 11, 'Alta'),
  ('Baby Colors', 11, 'Normal'),
  ('Simmons', 11, 'Alta'),
  ('Maxicosi', 11, 'Alta'),
  ('Halo', 11, 'Alta'),
  ('Kristhian', 11, 'Normal');

-- Cunas de viaje (subcategoría id 12)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 12, 'Normal'),
  ('Prinsel', 12, 'Normal'),
  ('Chicco', 12, 'Premium'),
  ('Infanti', 12, 'Normal'),
  ('Evenflo', 12, 'Normal'),
  ('Graco', 12, 'Alta'),
  ('General de gas', 12, 'Sencilla'),
  ('Safety 1st', 12, 'Normal'),
  ('Ingenuity', 12, 'Normal'),
  ('Baby&Kids', 12, 'Normal'),
  ('Dbebe', 12, 'Normal'),
  ('Phil&Teds', 12, 'Alta'),
  ('Delta Children', 12, 'Normal'),
  ('Cosco', 12, 'Normal'),
  ('Besrey', 12, 'Normal'),
  ('Engenuity', 12, 'Normal'),
  ('Aeromoov', 12, 'Normal'),
  ('BabyMoov', 12, 'Normal'),
  ('Infanti', 12, 'Normal'),
  ('Tuc Tuc', 12, 'Normal'),
  ('Maxi Cosi', 12, 'Alta'),
  ('Mon Caramel', 12, 'Normal'),
  ('Babybjorn', 12, 'Premium'),
  ('Fisher Price', 12, 'Alta');

-- Mecedoras y Columpios de bebé (subcategoría id 21)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 21, 'Normal'),
  ('Prinsel', 21, 'Normal'),
  ('Chicco', 21, 'Premium'),
  ('Infanti', 21, 'Normal'),
  ('Evenflo', 21, 'Normal'),
  ('Graco', 21, 'Alta'),
  ('Brevi', 21, 'Normal'),
  ('The first years', 21, 'Normal'),
  ('Bright Starts', 21, 'Normal'),
  ('Fisher Price', 21, 'Alta'),
  ('Ingenuity', 21, 'Normal'),
  ('BabyBjorn', 21, 'Premium'),
  ('Stokke', 21, 'Premium'),
  ('4 Moms', 21, 'Alta'),
  ('Maxi cosi', 21, 'Alta'),
  ('Kids 2', 21, 'Normal'),
  ('Tiny love', 21, 'Alta'),
  ('Beaba', 21, 'Alta'),
  ('Disney', 21, 'Alta'),
  ('Infanti Joie', 21, 'Normal'),
  ('Cybex', 21, 'Premium');

-- Lactancia (subcategoría id 30)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 30, 'Normal'),
  ('Avent', 30, 'Alta'),
  ('Lansinoh', 30, 'Alta'),
  ('Tommee Tippee', 30, 'Alta'),
  ('Chicco', 30, 'Premium'),
  ('Pigeon', 30, 'Alta'),
  ('Spectra', 30, 'Alta'),
  ('Dr. Browns', 30, 'Alta'),
  ('Evenflo', 30, 'Normal'),
  ('Medela', 30, 'Premium');

-- Juguetes (subcategoría id 46)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 46, 'Normal'),
  ('Fisher Price', 46, 'Alta'),
  ('Crayola', 46, 'Alta'),
  ('Elmer''s', 46, 'Normal'),
  ('Kidkraft', 46, 'Alta'),
  ('Play-Doh', 46, 'Alta'),
  ('Melissa&Doug', 46, 'Alta'),
  ('Cabbage Patch', 46, 'Alta'),
  ('Cat', 46, 'Normal'),
  ('Geli', 46, 'Sencilla'),
  ('Nenuco', 46, 'Normal'),
  ('Step2', 46, 'Alta'),
  ('My little pony', 46, 'Alta'),
  ('Distroller', 46, 'Alta'),
  ('Little mommy', 46, 'Normal'),
  ('Hot Wheels', 46, 'Alta'),
  ('Lego', 46, 'Premium'),
  ('Little People', 46, 'Alta'),
  ('Little Tikes', 46, 'Alta'),
  ('ItsIMagical', 46, 'Normal'),
  ('Lamaze', 46, 'Alta'),
  ('Play Mobil', 46, 'Alta'),
  ('Mega Bloks', 46, 'Alta'),
  ('Baby Einstein', 46, 'Alta'),
  ('Tiny Love', 46, 'Alta'),
  ('Brigth Starts', 46, 'Normal'),
  ('DC Comics', 46, 'Alta'),
  ('Alex', 46, 'Normal'),
  ('Build a Bear', 46, 'Alta'),
  ('Leap Frog', 46, 'Alta'),
  ('Playgro', 46, 'Normal'),
  ('Playskool', 46, 'Alta'),
  ('Nickelodeon', 46, 'Alta'),
  ('Mattel', 46, 'Alta'),
  ('Marvel', 46, 'Alta'),
  ('Hasbro', 46, 'Alta'),
  ('Hello Kitty', 46, 'Alta'),
  ('Vtech', 46, 'Alta'),
  ('Barbie', 46, 'Alta'),
  ('Disney', 46, 'Alta'),
  ('Funko Pop', 46, 'Alta'),
  ('Paw Patrol', 46, 'Alta');

-- Juegos de cuna (subcategoría id 13)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 13, 'Normal'),
  ('Pottery Barn', 13, 'Premium'),
  ('Carters', 13, 'Alta'),
  ('Fisher Price', 13, 'Alta'),
  ('Skip Hop', 13, 'Alta'),
  ('The First Years', 13, 'Normal'),
  ('Cloud Island', 13, 'Normal'),
  ('Gerber', 13, 'Normal'),
  ('Burt''s Bees', 13, 'Alta'),
  ('Hudson Baby', 13, 'Normal'),
  ('Little Giraffe', 13, 'Premium'),
  ('Munchkin', 13, 'Alta'),
  ('Summer Infant', 13, 'Normal');

-- Colchones (subcategoría id 14)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 14, 'Normal'),
  ('Simmons', 14, 'Premium'),
  ('Sealy', 14, 'Premium'),
  ('Serta', 14, 'Premium'),
  ('Colgate', 14, 'Alta'),
  ('Moonlight Slumber', 14, 'Alta'),
  ('Safety 1st', 14, 'Normal'),
  ('Graco', 14, 'Alta'),
  ('Dream On Me', 14, 'Normal'),
  ('Delta Children', 14, 'Normal'),
  ('Milliard', 14, 'Alta'),
  ('Lullaby Earth', 14, 'Alta');

-- Almohadas y donas (subcategoría id 15)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 15, 'Normal'),
  ('Boppy', 15, 'Premium'),
  ('Leachco', 15, 'Alta'),
  ('My Brest Friend', 15, 'Alta'),
  ('Chicco', 15, 'Premium'),
  ('Fisher Price', 15, 'Alta'),
  ('Summer Infant', 15, 'Normal'),
  ('The First Years', 15, 'Normal'),
  ('Munchkin', 15, 'Alta'),
  ('Safety 1st', 15, 'Normal'),
  ('Infantino', 15, 'Normal'),
  ('Lansinoh', 15, 'Alta');

-- Móviles de cuna (subcategoría id 16)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 16, 'Normal'),
  ('Fisher Price', 16, 'Alta'),
  ('Tiny Love', 16, 'Alta'),
  ('Manhattan Toy', 16, 'Alta'),
  ('VTech', 16, 'Alta'),
  ('Skip Hop', 16, 'Alta'),
  ('Baby Einstein', 16, 'Alta'),
  ('Lamaze', 16, 'Alta'),
  ('Sassy', 16, 'Normal'),
  ('The First Years', 16, 'Normal'),
  ('Infantino', 16, 'Normal'),
  ('Bright Starts', 16, 'Normal');

-- Barandal para cama (subcategoría id 17)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 17, 'Normal'),
  ('Regalo', 17, 'Alta'),
  ('Summer Infant', 17, 'Normal'),
  ('Safety 1st', 17, 'Normal'),
  ('Toddleroo', 17, 'Alta'),
  ('Delta Children', 17, 'Normal'),
  ('Dream On Me', 17, 'Normal'),
  ('Evenflo', 17, 'Normal'),
  ('KidCo', 17, 'Alta'),
  ('North States', 17, 'Alta');

-- Muebles de recámara (subcategoría id 18)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 18, 'Normal'),
  ('Pottery Barn Kids', 18, 'Premium'),
  ('Ikea', 18, 'Normal'),
  ('Delta Children', 18, 'Normal'),
  ('DaVinci', 18, 'Alta'),
  ('Storkcraft', 18, 'Alta'),
  ('Dream On Me', 18, 'Normal'),
  ('South Shore', 18, 'Normal'),
  ('Dorel', 18, 'Alta'),
  ('Bassett', 18, 'Premium'),
  ('Ethan Allen', 18, 'Premium'),
  ('Munire', 18, 'Alta');

-- Accesorios Recámara (subcategoría id 19)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 19, 'Normal'),
  ('Skip Hop', 19, 'Alta'),
  ('Munchkin', 19, 'Alta'),
  ('Safety 1st', 19, 'Normal'),
  ('Summer Infant', 19, 'Normal'),
  ('The First Years', 19, 'Normal'),
  ('Fisher Price', 19, 'Alta'),
  ('VTech', 19, 'Alta'),
  ('Hatch', 19, 'Premium'),
  ('Dohm', 19, 'Alta'),
  ('Cloud B', 19, 'Alta'),
  ('Marpac', 19, 'Alta');

-- Sillas para comer (subcategoría id 20)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 20, 'Normal'),
  ('Fisher Price', 20, 'Alta'),
  ('Graco', 20, 'Alta'),
  ('Chicco', 20, 'Premium'),
  ('Ingenuity', 20, 'Normal'),
  ('Evenflo', 20, 'Normal'),
  ('Safety 1st', 20, 'Normal'),
  ('Joovy', 20, 'Alta'),
  ('Stokke', 20, 'Premium'),
  ('Peg Perego', 20, 'Premium'),
  ('Maxi-Cosi', 20, 'Alta'),
  ('Abiie', 20, 'Alta');

-- Brincolines (subcategoría id 22)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 22, 'Normal'),
  ('Fisher Price', 22, 'Alta'),
  ('Little Tikes', 22, 'Alta'),
  ('Step2', 22, 'Alta'),
  ('Bounce Pro', 22, 'Alta'),
  ('Skywalker', 22, 'Alta'),
  ('JumpKing', 22, 'Alta'),
  ('Sportspower', 22, 'Normal'),
  ('Inflatable World', 22, 'Normal'),
  ('Banzai', 22, 'Normal');

-- Corrales (subcategoría id 23)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 23, 'Normal'),
  ('Graco', 23, 'Alta'),
  ('Evenflo', 23, 'Normal'),
  ('Safety 1st', 23, 'Normal'),
  ('Regalo', 23, 'Alta'),
  ('Baby Trend', 23, 'Normal'),
  ('Summer Infant', 23, 'Normal'),
  ('Delta Children', 23, 'Normal'),
  ('North States', 23, 'Alta'),
  ('Toddleroo', 23, 'Alta'),
  ('Joovy', 23, 'Alta'),
  ('4moms', 23, 'Premium');

-- Protectores y seguros (subcategoría id 24)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 24, 'Normal'),
  ('Safety 1st', 24, 'Normal'),
  ('Munchkin', 24, 'Alta'),
  ('Summer Infant', 24, 'Normal'),
  ('The First Years', 24, 'Normal'),
  ('Regalo', 24, 'Alta'),
  ('Toddleroo', 24, 'Alta'),
  ('North States', 24, 'Alta'),
  ('Mommy''s Helper', 24, 'Normal'),
  ('KidCo', 24, 'Alta'),
  ('Prince Lionheart', 24, 'Normal'),
  ('Dreambaby', 24, 'Normal');

-- Puertas de seguridad (subcategoría id 25)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 25, 'Normal'),
  ('Safety 1st', 25, 'Normal'),
  ('Regalo', 25, 'Alta'),
  ('Summer Infant', 25, 'Normal'),
  ('Toddleroo', 25, 'Alta'),
  ('North States', 25, 'Alta'),
  ('KidCo', 25, 'Alta'),
  ('Evenflo', 25, 'Normal'),
  ('Munchkin', 25, 'Alta'),
  ('Prince Lionheart', 25, 'Normal'),
  ('Dreambaby', 25, 'Normal'),
  ('Cardinal Gates', 25, 'Alta');

-- Monitores (subcategoría id 26)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 26, 'Normal'),
  ('VTech', 26, 'Alta'),
  ('Motorola', 26, 'Premium'),
  ('Infant Optics', 26, 'Alta'),
  ('Summer Infant', 26, 'Normal'),
  ('Safety 1st', 26, 'Normal'),
  ('Owlet', 26, 'Premium'),
  ('Nanit', 26, 'Premium'),
  ('Cocoon Cam', 26, 'Alta'),
  ('Angelcare', 26, 'Alta'),
  ('Philips Avent', 26, 'Premium'),
  ('Hello Baby', 26, 'Normal');

-- Higiene y accesorios (subcategoría id 27)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 27, 'Normal'),
  ('Munchkin', 27, 'Alta'),
  ('Summer Infant', 27, 'Normal'),
  ('Safety 1st', 27, 'Normal'),
  ('The First Years', 27, 'Normal'),
  ('Nuby', 27, 'Normal'),
  ('Dr. Brown''s', 27, 'Alta'),
  ('Philips Avent', 27, 'Premium'),
  ('Tommee Tippee', 27, 'Alta'),
  ('Pigeon', 27, 'Alta'),
  ('NUK', 27, 'Alta'),
  ('Medela', 27, 'Premium');

-- Bañeras (subcategoría id 28)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 28, 'Normal'),
  ('Summer Infant', 28, 'Normal'),
  ('Safety 1st', 28, 'Normal'),
  ('The First Years', 28, 'Normal'),
  ('Munchkin', 28, 'Alta'),
  ('Fisher Price', 28, 'Alta'),
  ('Skip Hop', 28, 'Alta'),
  ('Angelcare', 28, 'Alta'),
  ('4moms', 28, 'Premium'),
  ('Puj', 28, 'Alta'),
  ('Primo', 28, 'Normal'),
  ('Boon', 28, 'Alta');

-- Pañales (subcategoría id 29)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 29, 'Normal'),
  ('Pampers', 29, 'Premium'),
  ('Huggies', 29, 'Premium'),
  ('Luvs', 29, 'Normal'),
  ('Seventh Generation', 29, 'Alta'),
  ('Honest', 29, 'Alta'),
  ('Bambo Nature', 29, 'Alta'),
  ('Earth''s Best', 29, 'Alta'),
  ('Kirkland', 29, 'Normal'),
  ('Up&Up', 29, 'Normal'),
  ('Parents Choice', 29, 'Normal'),
  ('Hello Bello', 29, 'Alta');

-- Calentador de biberones (subcategoría id 31)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 31, 'Normal'),
  ('Philips Avent', 31, 'Premium'),
  ('Tommee Tippee', 31, 'Alta'),
  ('Munchkin', 31, 'Alta'),
  ('The First Years', 31, 'Normal'),
  ('Dr. Brown''s', 31, 'Alta'),
  ('Kiinde', 31, 'Alta'),
  ('Baby Brezza', 31, 'Premium'),
  ('Nuby', 31, 'Normal'),
  ('NUK', 31, 'Alta'),
  ('Pigeon', 31, 'Alta'),
  ('Medela', 31, 'Premium');

-- Esterilizador de biberones (subcategoría id 32)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 32, 'Normal'),
  ('Philips Avent', 32, 'Premium'),
  ('Tommee Tippee', 32, 'Alta'),
  ('Munchkin', 32, 'Alta'),
  ('Dr. Brown''s', 32, 'Alta'),
  ('Medela', 32, 'Premium'),
  ('Nuby', 32, 'Normal'),
  ('NUK', 32, 'Alta'),
  ('Pigeon', 32, 'Alta'),
  ('Kiinde', 32, 'Alta'),
  ('Baby Brezza', 32, 'Premium'),
  ('The First Years', 32, 'Normal');

-- Extractores de leche (subcategoría id 33)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 33, 'Normal'),
  ('Medela', 33, 'Premium'),
  ('Spectra', 33, 'Premium'),
  ('Philips Avent', 33, 'Premium'),
  ('Lansinoh', 33, 'Alta'),
  ('Evenflo', 33, 'Normal'),
  ('NUK', 33, 'Alta'),
  ('Tommee Tippee', 33, 'Alta'),
  ('Motif Medical', 33, 'Alta'),
  ('BellaBaby', 33, 'Normal'),
  ('Haakaa', 33, 'Alta'),
  ('Elvie', 33, 'Premium');

-- Procesador de alimentos (subcategoría id 34)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 34, 'Normal'),
  ('Beaba', 34, 'Premium'),
  ('Baby Bullet', 34, 'Alta'),
  ('Cuisinart', 34, 'Premium'),
  ('Philips Avent', 34, 'Premium'),
  ('Munchkin', 34, 'Alta'),
  ('Nuby', 34, 'Normal'),
  ('The First Years', 34, 'Normal'),
  ('Oster', 34, 'Alta'),
  ('Hamilton Beach', 34, 'Alta'),
  ('NutriBullet', 34, 'Alta'),
  ('Baby Brezza', 34, 'Premium');

-- Accesorios de alimentación (subcategoría id 35)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 35, 'Normal'),
  ('Munchkin', 35, 'Alta'),
  ('Philips Avent', 35, 'Premium'),
  ('Tommee Tippee', 35, 'Alta'),
  ('Dr. Brown''s', 35, 'Alta'),
  ('Nuby', 35, 'Normal'),
  ('NUK', 35, 'Alta'),
  ('Pigeon', 35, 'Alta'),
  ('Skip Hop', 35, 'Alta'),
  ('Boon', 35, 'Alta'),
  ('The First Years', 35, 'Normal'),
  ('Olababy', 35, 'Alta');

-- Ropa de niño/niña (subcategorías 36-40)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 36, 'Normal'),
  ('Carter''s', 36, 'Alta'),
  ('GAP', 36, 'Alta'),
  ('H&M', 36, 'Normal'),
  ('Zara', 36, 'Alta'),
  ('OshKosh B''gosh', 36, 'Alta'),
  ('The Children''s Place', 36, 'Normal'),
  ('Gymboree', 36, 'Alta'),
  ('Ralph Lauren', 36, 'Premium'),
  ('Burberry', 36, 'Premium'),
  ('Nike', 36, 'Premium'),
  ('Adidas', 36, 'Premium'),
  ('Under Armour', 36, 'Alta'),
  ('Old Navy', 36, 'Normal'),
  ('Target', 36, 'Normal'),
  ('Walmart', 36, 'Normal'),
  ('Amazon', 36, 'Normal'),
  ('Macy''s', 36, 'Normal'),
  ('JCPenney', 36, 'Normal'),
  ('Kohl''s', 36, 'Normal');

-- Disfraces (subcategoría id 47)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 47, 'Normal'),
  ('Disney', 47, 'Premium'),
  ('Marvel', 47, 'Premium'),
  ('DC Comics', 47, 'Premium'),
  ('Rubie''s', 47, 'Alta'),
  ('Spirit Halloween', 47, 'Alta'),
  ('Leg Avenue', 47, 'Alta'),
  ('Fun World', 47, 'Normal'),
  ('California Costumes', 47, 'Alta'),
  ('Smiffy''s', 47, 'Normal'),
  ('Morphsuits', 47, 'Alta'),
  ('Disguise', 47, 'Alta');

-- Juegos de mesa (subcategoría id 48)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 48, 'Normal'),
  ('Hasbro', 48, 'Premium'),
  ('Mattel', 48, 'Premium'),
  ('Ravensburger', 48, 'Alta'),
  ('ThinkFun', 48, 'Alta'),
  ('Educational Insights', 48, 'Alta'),
  ('Melissa & Doug', 48, 'Alta'),
  ('Peaceable Kingdom', 48, 'Alta'),
  ('Blue Orange', 48, 'Alta'),
  ('Haba', 48, 'Alta'),
  ('Gamewright', 48, 'Alta'),
  ('SmartGames', 48, 'Alta');

-- Mesa de actividades (subcategoría id 49)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 49, 'Normal'),
  ('Fisher Price', 49, 'Alta'),
  ('VTech', 49, 'Alta'),
  ('LeapFrog', 49, 'Alta'),
  ('Little Tikes', 49, 'Alta'),
  ('Step2', 49, 'Alta'),
  ('Skip Hop', 49, 'Alta'),
  ('Baby Einstein', 49, 'Alta'),
  ('Manhattan Toy', 49, 'Alta'),
  ('Tiny Love', 49, 'Alta'),
  ('Infantino', 49, 'Normal'),
  ('Bright Starts', 49, 'Normal');

-- Libros y rompecabezas (subcategoría id 50)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 50, 'Normal'),
  ('Melissa & Doug', 50, 'Alta'),
  ('Ravensburger', 50, 'Alta'),
  ('Clementoni', 50, 'Alta'),
  ('Disney', 50, 'Premium'),
  ('Scholastic', 50, 'Alta'),
  ('Usborne', 50, 'Alta'),
  ('DK', 50, 'Alta'),
  ('National Geographic', 50, 'Premium'),
  ('Crayola', 50, 'Alta'),
  ('ThinkFun', 50, 'Alta'),
  ('Educational Insights', 50, 'Alta');

-- Gimnasios y tapetes (subcategoría id 51)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 51, 'Normal'),
  ('Fisher Price', 51, 'Alta'),
  ('Skip Hop', 51, 'Alta'),
  ('Tiny Love', 51, 'Alta'),
  ('Baby Einstein', 51, 'Alta'),
  ('Manhattan Toy', 51, 'Alta'),
  ('Infantino', 51, 'Normal'),
  ('Bright Starts', 51, 'Normal'),
  ('The First Years', 51, 'Normal'),
  ('VTech', 51, 'Alta'),
  ('Lamaze', 51, 'Alta'),
  ('Sassy', 51, 'Normal');

-- Andaderas (subcategoría id 52)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 52, 'Normal'),
  ('VTech', 52, 'Alta'),
  ('Fisher Price', 52, 'Alta'),
  ('Baby Einstein', 52, 'Alta'),
  ('Bright Starts', 52, 'Normal'),
  ('The First Years', 52, 'Normal'),
  ('Safety 1st', 52, 'Normal'),
  ('Joovy', 52, 'Alta'),
  ('Kolcraft', 52, 'Normal'),
  ('Baby Trend', 52, 'Normal'),
  ('Evenflo', 52, 'Normal'),
  ('Graco', 52, 'Alta');

-- Montables y correpasillos Bebé (subcategoría id 53)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 53, 'Normal'),
  ('Radio Flyer', 53, 'Premium'),
  ('Little Tikes', 53, 'Alta'),
  ('Step2', 53, 'Alta'),
  ('Fisher Price', 53, 'Alta'),
  ('VTech', 53, 'Alta'),
  ('Baby Einstein', 53, 'Alta'),
  ('Infantino', 53, 'Normal'),
  ('Bright Starts', 53, 'Normal'),
  ('The First Years', 53, 'Normal'),
  ('Safety 1st', 53, 'Normal'),
  ('Joovy', 53, 'Alta');

-- Montables de exterior (subcategoría id 54)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 54, 'Normal'),
  ('Power Wheels', 54, 'Premium'),
  ('Little Tikes', 54, 'Alta'),
  ('Step2', 54, 'Alta'),
  ('Radio Flyer', 54, 'Premium'),
  ('Peg Perego', 54, 'Premium'),
  ('Kid Trax', 54, 'Alta'),
  ('Best Choice', 54, 'Normal'),
  ('Costzon', 54, 'Normal'),
  ('Hauck', 54, 'Alta'),
  ('Berg', 54, 'Premium'),
  ('Kettler', 54, 'Premium');

-- Triciclos y bicicletas (subcategoría id 55)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 55, 'Normal'),
  ('Radio Flyer', 55, 'Premium'),
  ('Schwinn', 55, 'Premium'),
  ('Trek', 55, 'Premium'),
  ('Specialized', 55, 'Premium'),
  ('Strider', 55, 'Premium'),
  ('Huffy', 55, 'Alta'),
  ('Dynacraft', 55, 'Normal'),
  ('RoyalBaby', 55, 'Alta'),
  ('Joystar', 55, 'Normal'),
  ('Kent', 55, 'Normal'),
  ('Guardian', 55, 'Alta');

-- Sobre ruedas (subcategoría id 56)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 56, 'Normal'),
  ('Razor', 56, 'Premium'),
  ('Micro', 56, 'Premium'),
  ('Globber', 56, 'Alta'),
  ('Roller Derby', 56, 'Alta'),
  ('K2', 56, 'Premium'),
  ('Powerslide', 56, 'Premium'),
  ('Rollerblade', 56, 'Premium'),
  ('Sector 9', 56, 'Premium'),
  ('Penny', 56, 'Premium'),
  ('Landyachtz', 56, 'Premium'),
  ('Atom', 56, 'Alta');

-- Juegos grandes (subcategoría id 57)
INSERT INTO brands (name, subcategory_id, renown)
VALUES
  ('General', 57, 'Normal'),
  ('Little Tikes', 57, 'Alta'),
  ('Step2', 57, 'Alta'),
  ('Backyard Discovery', 57, 'Alta'),
  ('KidKraft', 57, 'Alta'),
  ('Lifetime', 57, 'Alta'),
  ('Gorilla Playsets', 57, 'Alta'),
  ('Creative Playthings', 57, 'Premium'),
  ('Swing-N-Slide', 57, 'Alta'),
  ('Skywalker', 57, 'Alta'),
  ('Bounce Pro', 57, 'Alta'),
  ('Intex', 57, 'Normal');

ON CONFLICT (name, subcategory_id) DO UPDATE
SET renown = EXCLUDED.renown;

/*
NOTAS SOBRE LA CLASIFICACIÓN DE RENOWN (RECONOCIMIENTO DE MARCA):

- Premium: Marcas de alta gama, reconocidas internacionalmente por su calidad excepcional,
  innovación, exclusividad y precios elevados. Ejemplos: Stokke, Cybex, Babybjorn, Lego, Medela.

- Alta: Marcas reconocidas, con presencia consolidada en el mercado, buena calidad y
  precios moderados a altos. Ejemplos: Graco, Fisher Price, Britax, Mattel, Disney.

- Normal: Marcas de distribución común, con presencia regular en el mercado, calidad
  estándar y precios accesibles. Ejemplos: Evenflo, Safety 1st, Mon Caramel.

- Sencilla: Marcas genéricas, locales o menos conocidas, con precios más bajos y
  distribución más limitada. Ejemplos: marcas sin mucho reconocimiento o genéricas.

Este script es fundamental para tener una correcta asociación de marcas con subcategorías,
lo que permitirá una adecuada valuación de los productos en el sistema.
*/ 