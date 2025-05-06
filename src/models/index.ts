// Interfaz base para todos los modelos de la aplicación
export interface BaseModel {
  id: number;
  created_at?: Date;
  updated_at?: Date;
}

// Interfaz para modelo de Role
export interface Role extends BaseModel {
  name: string;
  description?: string;
}

// Interfaz para modelo de User
export interface User extends BaseModel {
  role_id: number;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  role?: Role; // Relación con Role (opcional para no cargar siempre)
}

// Interfaz para modelo de Category
export interface Category extends BaseModel {
  name: string;
  description?: string;
  is_active: boolean;
}

// Interfaz para modelo de Product
export interface Product extends BaseModel {
  category_id: number;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  age_group?: string;
  is_active: boolean;
  category?: Category; // Relación con Category (opcional)
} 