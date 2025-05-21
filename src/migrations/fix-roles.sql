-- Script para verificar y corregir la tabla de roles

-- Verificar si la tabla roles existe y crearla si no existe
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles por defecto si no existen
INSERT INTO roles (name, description) 
VALUES 
  ('admin', 'Administrador con acceso completo al sistema'),
  ('manager', 'Gerente con acceso a la mayoría de las funciones'),
  ('valuator', 'Usuario que puede valorar artículos'),
  ('sales', 'Usuario de ventas')
ON CONFLICT (name) DO NOTHING;

-- Verificar si el usuario admin existe y tiene un rol asignado
DO $$
DECLARE
  admin_user_id INTEGER;
  admin_role_id INTEGER;
BEGIN
  -- Obtener el ID del usuario admin
  SELECT id INTO admin_user_id FROM users WHERE username = 'admin';
  
  -- Obtener el ID del rol admin
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  -- Si el usuario admin existe pero no tiene un rol asignado, asignarle el rol de admin
  IF admin_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
    UPDATE users 
    SET role_id = admin_role_id 
    WHERE id = admin_user_id AND (role_id IS NULL OR role_id <> admin_role_id);
    
    RAISE NOTICE 'Usuario admin actualizado con rol_id = %', admin_role_id;
  ELSE
    RAISE NOTICE 'No se encontró el usuario admin o el rol admin';
  END IF;
END $$;

-- Mostrar todos los roles
SELECT * FROM roles;

-- Mostrar información del usuario admin
SELECT u.*, r.name as role_name 
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.username = 'admin';
