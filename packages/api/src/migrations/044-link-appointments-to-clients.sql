-- Migration: 044-link-appointments-to-clients.sql
-- Description: Las citas de clientes nuevos guardaban nombre/teléfono solo en
--   `appointments` (client_id NULL) y nunca creaban el registro en `clients`, así
--   que esos clientes no aparecían al buscarlos por teléfono en el POS/valuador.
--   El API ya los crea/vincula al agendar (appointment.service.findOrCreateClient);
--   esta migración corrige las citas históricas.
-- Date: 2026-09-17

BEGIN;

-- 1. Vincular citas cuyo teléfono ya existe en clients (comparando solo dígitos)
UPDATE appointments a
SET client_id = c.id
FROM (
  SELECT DISTINCT ON (regexp_replace(phone, '\D', '', 'g'))
         id, regexp_replace(phone, '\D', '', 'g') AS digits
  FROM clients
  WHERE phone IS NOT NULL AND phone <> ''
  ORDER BY regexp_replace(phone, '\D', '', 'g'), id
) c
WHERE a.client_id IS NULL
  AND a.client_phone IS NOT NULL
  AND regexp_replace(a.client_phone, '\D', '', 'g') <> ''
  AND regexp_replace(a.client_phone, '\D', '', 'g') = c.digits;

-- 2. Crear clientes para los teléfonos que aún no existen (uno por teléfono,
--    tomando los datos de la cita más reciente)
INSERT INTO clients (name, phone, email)
SELECT DISTINCT ON (regexp_replace(a.client_phone, '\D', '', 'g'))
       COALESCE(NULLIF(TRIM(a.client_name), ''), 'Cliente de cita'),
       TRIM(a.client_phone),
       NULLIF(TRIM(a.client_email), '')
FROM appointments a
WHERE a.client_id IS NULL
  AND a.client_phone IS NOT NULL
  AND regexp_replace(a.client_phone, '\D', '', 'g') <> ''
  AND NOT EXISTS (
    SELECT 1 FROM clients c
    WHERE regexp_replace(c.phone, '\D', '', 'g') = regexp_replace(a.client_phone, '\D', '', 'g')
  )
ORDER BY regexp_replace(a.client_phone, '\D', '', 'g'), a.created_at DESC;

-- 3. Vincular las citas restantes a los clientes recién creados
UPDATE appointments a
SET client_id = c.id
FROM (
  SELECT DISTINCT ON (regexp_replace(phone, '\D', '', 'g'))
         id, regexp_replace(phone, '\D', '', 'g') AS digits
  FROM clients
  WHERE phone IS NOT NULL AND phone <> ''
  ORDER BY regexp_replace(phone, '\D', '', 'g'), id
) c
WHERE a.client_id IS NULL
  AND a.client_phone IS NOT NULL
  AND regexp_replace(a.client_phone, '\D', '', 'g') = c.digits;

-- Verificación: debe quedar 0 (salvo citas sin teléfono)
-- SELECT COUNT(*) FROM appointments WHERE client_id IS NULL AND client_phone IS NOT NULL;

INSERT INTO migrations (name, executed_at) VALUES ('044-link-appointments-to-clients.sql', NOW());

COMMIT;
