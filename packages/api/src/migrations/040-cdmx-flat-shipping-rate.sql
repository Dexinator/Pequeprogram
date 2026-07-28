-- Migration: 040-cdmx-flat-shipping-rate.sql
-- Description: CDMX vuelve a tarifa PLANA de $95 sin importar el peso (petición de Pablo).
--   Antes del fix de peso, CDMX salía siempre $95 porque todo se calculaba como 0.5 kg;
--   al activar el peso volumétrico real (migración/fix de Etapa 5), los items voluminosos
--   en CDMX subían a $225/$495. Pablo quiere CDMX plano en $95 (y por separado quitará las
--   alcaldías/CPs lejanos de esta cobertura, pendiente de su lista).
--
--   Se ponen TODAS las tarifas de CDMX en $95; así, sin importar en qué tier de peso caiga
--   (o el fallback a la tarifa más alta cuando el peso excede los tiers), CDMX siempre
--   cobra $95. El envío gratis para CDMX (subtotal >= $895) sigue funcionando aparte,
--   porque depende del zone_code = 'cdmx', no de la tarifa.
--
--   Las zonas Edomex/Nacional CONSERVAN el cobro por peso volumétrico (ahí sí es correcto).
--   Los precios originales por tier quedan en el historial de git (migración 021) por si
--   se quisieran restaurar.
-- Date: 2026-07-24

UPDATE shipping_rates
SET price = 95
WHERE zone_id = (SELECT id FROM shipping_zones WHERE zone_code = 'cdmx');

-- Migration record
INSERT INTO migrations (name, executed_at) VALUES ('040-cdmx-flat-shipping-rate.sql', NOW());
