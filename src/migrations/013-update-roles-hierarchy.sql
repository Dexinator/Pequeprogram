-- Migración 013: Actualizar roles con jerarquía correcta
-- superadmin > admin > gerente > valuador

-- Primero, actualizar los nombres y descripciones de los roles existentes
UPDATE roles 
SET name = 'superadmin', 
    description = 'Super administrador con acceso completo al sistema'
WHERE id = 1;

UPDATE roles 
SET name = 'gerente', 
    description = 'Gerente de tienda con acceso a ventas, inventario y reportes'
WHERE id = 2;

UPDATE roles 
SET name = 'valuador', 
    description = 'Usuario que puede valorar artículos y gestionar consignaciones'
WHERE id = 3;

-- El rol de sales ya no es necesario, lo mantenemos para compatibilidad pero lo renombramos
UPDATE roles 
SET name = 'vendedor', 
    description = 'Usuario de ventas con acceso limitado al POS'
WHERE id = 4;

-- Insertar el nuevo rol de admin si no existe
INSERT INTO roles (id, name, description)
VALUES (5, 'admin', 'Administrador con acceso a gestión de usuarios y configuración')
ON CONFLICT (id) DO UPDATE
SET name = 'admin',
    description = 'Administrador con acceso a gestión de usuarios y configuración';

-- Actualizar la secuencia de roles si es necesario
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- Actualizar usuarios existentes si es necesario
-- El usuario admin actual (id=1) debería ser superadmin
UPDATE users 
SET role_id = 1 
WHERE username = 'admin' AND role_id != 1;

-- Crear usuario superadmin si no existe
INSERT INTO users (username, email, password_hash, first_name, last_name, role_id, is_active)
VALUES (
    'superadmin',
    'superadmin@entrepeques.com',
    '$2b$10$YourHashHere', -- La contraseña será establecida por el administrador
    'Super',
    'Admin',
    1,
    true
)
ON CONFLICT (username) DO NOTHING;

-- Agregar columna para jerarquía de permisos
ALTER TABLE roles ADD COLUMN IF NOT EXISTS hierarchy_level INTEGER DEFAULT 0;

-- Establecer niveles de jerarquía (menor número = mayor privilegio)
UPDATE roles SET hierarchy_level = 1 WHERE name = 'superadmin';
UPDATE roles SET hierarchy_level = 2 WHERE name = 'admin';
UPDATE roles SET hierarchy_level = 3 WHERE name = 'gerente';
UPDATE roles SET hierarchy_level = 4 WHERE name = 'valuador';
UPDATE roles SET hierarchy_level = 5 WHERE name = 'vendedor';