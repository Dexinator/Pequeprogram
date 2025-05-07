-- 001-initial-schema.sql
-- Esquema inicial para Entrepeques

-- Extensión para generar UUIDs (si el proveedor es PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos Base (información general de productos)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  brand VARCHAR(50),
  model VARCHAR(50),
  age_group VARCHAR(50), -- Grupo de edad recomendado (0-3m, 3-6m, etc.)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles básicos
INSERT INTO roles (name, description) 
VALUES 
  ('admin', 'Administrador con acceso completo al sistema'),
  ('manager', 'Gerente con acceso a la mayoría de las funciones'),
  ('valuator', 'Usuario que puede valorar artículos'),
  ('sales', 'Usuario de ventas')
ON CONFLICT (name) DO NOTHING;

-- Insertar usuario administrador por defecto (password: admin123)
-- En producción, cambiar esta contraseña inmediatamente
INSERT INTO users (role_id, username, email, password_hash, first_name, last_name)
VALUES (
  (SELECT id FROM roles WHERE name = 'admin'),
  'admin',
  'admin@entrepeques.com',
  '$2b$10$X/QX5KNLsBGP.JFRJxR7aO8FtNB2jBjzTOWKvM7MR66fABlcEbYhy', -- hash de 'admin123'
  'Admin',
  'User'
) ON CONFLICT (username) DO NOTHING;
