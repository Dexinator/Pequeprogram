-- Migración 022: Cargar códigos postales para las zonas de envío

-- Códigos postales de Estado de México 1 (zona cercana)
INSERT INTO shipping_zone_postcodes (zone_id, postal_code)
SELECT sz.id, cp.postal_code
FROM shipping_zones sz
CROSS JOIN (VALUES
    ('57500'), ('57510'), ('57465'), ('57129'), ('57185'), ('57188'), ('57189'),
    ('57709'), ('57718'), ('57719'), ('57760'), ('57830'), ('57950'), ('57600'),
    ('57450'), ('57720'), ('57000'), ('57170'), ('57138'), ('57120'), ('57205'),
    ('57180'), ('57910'), ('57400'), ('57200'), ('57171'), ('57800'), ('57210'),
    ('57700'), ('57708'), ('57710'), ('57130'), ('57810'), ('57140'), ('52977'),
    ('52966'), ('52910'), ('52953'), ('52979'), ('52940'), ('52919'), ('52918'),
    ('52945'), ('52915'), ('52976'), ('52960'), ('52930'), ('52967'), ('52987'),
    ('52948'), ('52990'), ('52996'), ('52928'), ('52988'), ('52920'), ('52997'),
    ('52900'), ('52995'), ('52959'), ('52937'), ('52957'), ('52938'), ('52916'),
    ('52927'), ('55020'), ('55170'), ('55070'), ('55330'), ('55296'), ('55029'),
    ('55050'), ('55040'), ('55240'), ('55148'), ('55125'), ('55400'), ('55118'),
    ('55390'), ('55459'), ('55074'), ('55415'), ('55508'), ('55236'), ('55025'),
    ('55010'), ('55030'), ('55295'), ('55064'), ('55347'), ('55369'), ('55316'),
    ('55418'), ('55280'), ('55290'), ('55080'), ('55518'), ('55549'), ('55548'),
    ('55294'), ('55067'), ('55429'), ('55416'), ('52799'), ('52769'), ('52778'),
    ('52785'), ('52774'), ('52783'), ('52787'), ('52795'), ('52798'), ('52788'),
    ('52775'), ('52773'), ('52777'), ('52760'), ('52794'), ('52793'), ('52766'),
    ('52789'), ('52767'), ('52765'), ('52779'), ('52763'), ('52764'), ('52784'),
    ('53697'), ('53070'), ('53229'), ('53378'), ('53240'), ('53716'), ('53718'),
    ('53700'), ('53799'), ('53459'), ('53580'), ('53239'), ('53410'), ('53787'),
    ('53140'), ('53690'), ('53550'), ('53654'), ('53708'), ('53290'), ('53460'),
    ('53659'), ('53790'), ('53124'), ('53310'), ('53030'), ('53458'), ('53640'),
    ('53279'), ('53653'), ('53800'), ('53110'), ('53533'), ('53730'), ('53426'),
    ('53215'), ('53330'), ('53650'), ('53280'), ('53450'), ('54010'), ('54150'),
    ('54070'), ('54000'), ('54108'), ('54030'), ('54080'), ('54196'), ('54060'),
    ('54160'), ('54180'), ('54049'), ('54015'), ('54054'), ('54020'), ('54068'),
    ('54170'), ('54050'), ('54162'), ('54143'), ('54142'), ('54195'), ('54017'),
    ('54128'), ('54190'), ('54110'), ('54024'), ('54025'), ('54187'), ('54119')
) AS cp(postal_code)
WHERE sz.zone_code = 'edomex1';

-- Códigos postales de Estado de México 2 (zona lejana)
-- Primero los códigos del 50000 al 52799
INSERT INTO shipping_zone_postcodes (zone_id, postal_code)
SELECT sz.id, LPAD(num::text, 5, '0')
FROM shipping_zones sz
CROSS JOIN generate_series(50000, 52799) AS num
WHERE sz.zone_code = 'edomex2'
AND LPAD(num::text, 5, '0') NOT IN (
    SELECT postal_code FROM shipping_zone_postcodes
);

-- Luego los códigos del 52800 al 52899 que no están en EdoMex1
INSERT INTO shipping_zone_postcodes (zone_id, postal_code)
SELECT sz.id, LPAD(num::text, 5, '0')
FROM shipping_zones sz
CROSS JOIN generate_series(52800, 52899) AS num
WHERE sz.zone_code = 'edomex2'
AND LPAD(num::text, 5, '0') NOT IN (
    SELECT postal_code FROM shipping_zone_postcodes
);

-- Códigos del 52900 al 52999 que no están en EdoMex1
INSERT INTO shipping_zone_postcodes (zone_id, postal_code)
SELECT sz.id, LPAD(num::text, 5, '0')
FROM shipping_zones sz
CROSS JOIN generate_series(52901, 52999) AS num
WHERE sz.zone_code = 'edomex2'
AND LPAD(num::text, 5, '0') NOT IN (
    SELECT postal_code FROM shipping_zone_postcodes
);

-- Códigos del 53000 al 53999 que no están en EdoMex1
INSERT INTO shipping_zone_postcodes (zone_id, postal_code)
SELECT sz.id, LPAD(num::text, 5, '0')
FROM shipping_zones sz
CROSS JOIN generate_series(53000, 53999) AS num
WHERE sz.zone_code = 'edomex2'
AND LPAD(num::text, 5, '0') NOT IN (
    SELECT postal_code FROM shipping_zone_postcodes
);

-- Códigos del 54000 al 54999 que no están en EdoMex1
INSERT INTO shipping_zone_postcodes (zone_id, postal_code)
SELECT sz.id, LPAD(num::text, 5, '0')
FROM shipping_zones sz
CROSS JOIN generate_series(54000, 54999) AS num
WHERE sz.zone_code = 'edomex2'
AND LPAD(num::text, 5, '0') NOT IN (
    SELECT postal_code FROM shipping_zone_postcodes
);

-- Códigos del 55000 al 55999 que no están en EdoMex1
INSERT INTO shipping_zone_postcodes (zone_id, postal_code)
SELECT sz.id, LPAD(num::text, 5, '0')
FROM shipping_zones sz
CROSS JOIN generate_series(55000, 55999) AS num
WHERE sz.zone_code = 'edomex2'
AND LPAD(num::text, 5, '0') NOT IN (
    SELECT postal_code FROM shipping_zone_postcodes
);

-- Códigos del 56000 al 57999 
INSERT INTO shipping_zone_postcodes (zone_id, postal_code)
SELECT sz.id, LPAD(num::text, 5, '0')
FROM shipping_zones sz
CROSS JOIN generate_series(56000, 57999) AS num
WHERE sz.zone_code = 'edomex2'
AND LPAD(num::text, 5, '0') NOT IN (
    SELECT postal_code FROM shipping_zone_postcodes
);

-- Códigos postales de CDMX (los principales)
-- Estos son códigos postales de las 16 alcaldías de CDMX
INSERT INTO shipping_zone_postcodes (zone_id, postal_code)
SELECT sz.id, LPAD(num::text, 5, '0')
FROM shipping_zones sz
CROSS JOIN generate_series(1000, 16999) AS num
WHERE sz.zone_code = 'cdmx'
AND LENGTH(LPAD(num::text, 5, '0')) = 5
AND LPAD(num::text, 5, '0') NOT IN (
    SELECT postal_code FROM shipping_zone_postcodes
);

-- Actualizar timestamp
UPDATE shipping_zones SET updated_at = NOW();
UPDATE shipping_rates SET updated_at = NOW();