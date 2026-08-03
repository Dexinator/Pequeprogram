-- Migration: 042-cdmx-add-miguel-hidalgo.sql
-- Description: Agregar la alcaldía Miguel Hidalgo a la cobertura de la tarifa plana de $95
--   en CDMX. La migración 041 la había dejado fuera porque no venía en la lista original de
--   Pablo; él confirmó que fue una omisión suya ("lo obvié por error, lo agregamos").
--   Es además la alcaldía donde está la tienda física (Polanco, Homero 1616), así que sin
--   esto un cliente en Polanco pagaría tarifa nacional (~$445) en vez de $95.
--
--   60 CPs de Miguel Hidalgo según el catálogo SEPOMEX (incluye 11550/11560 de Polanco).
--   Al volver a la zona 'cdmx' recuperan también el envío gratis por compras >= $895,
--   que está ligado a zone_code = 'cdmx'.
--
--   Confirmado por Pablo: las demás alcaldías excluidas SÍ pierden el envío gratis.
-- Date: 2026-08-02

BEGIN;

CREATE TEMP TABLE mh_cps (postal_code VARCHAR(10) PRIMARY KEY) ON COMMIT DROP;

INSERT INTO mh_cps (postal_code) VALUES
('11000'),
('11040'),
('11100'),
('11200'),
('11210'),
('11220'),
('11230'),
('11240'),
('11250'),
('11260'),
('11270'),
('11280'),
('11289'),
('11290'),
('11300'),
('11310'),
('11320'),
('11330'),
('11340'),
('11350'),
('11360'),
('11370'),
('11400'),
('11410'),
('11420'),
('11430'),
('11440'),
('11450'),
('11460'),
('11470'),
('11480'),
('11489'),
('11490'),
('11500'),
('11510'),
('11520'),
('11529'),
('11530'),
('11540'),
('11550'),
('11560'),
('11580'),
('11590'),
('11600'),
('11610'),
('11619'),
('11650'),
('11700'),
('11800'),
('11810'),
('11820'),
('11830'),
('11840'),
('11850'),
('11860'),
('11870'),
('11910'),
('11920'),
('11930'),
('11950');

-- Devolver los CPs de Miguel Hidalgo a la zona CDMX ($95 plano + envío gratis)
UPDATE shipping_zone_postcodes
SET zone_id = (SELECT id FROM shipping_zones WHERE zone_code = 'cdmx')
WHERE postal_code IN (SELECT postal_code FROM mh_cps)
  AND zone_id <> (SELECT id FROM shipping_zones WHERE zone_code = 'cdmx');

-- Migration record
INSERT INTO migrations (name, executed_at) VALUES ('042-cdmx-add-miguel-hidalgo.sql', NOW());

COMMIT;
