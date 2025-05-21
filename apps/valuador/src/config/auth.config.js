/**
 * Configuración de autenticación para la aplicación
 */

// Rutas que requieren autenticación
export const PROTECTED_ROUTES = [
  '/nueva-valuacion',
  '/historial',
  '/detalle-valuacion',
  '/perfil',
];

// Rutas que requieren roles específicos
export const ROLE_PROTECTED_ROUTES = {
  '/admin': ['admin'],
  '/admin/usuarios': ['admin'],
  '/admin/configuracion': ['admin'],
};

// Rutas públicas (no requieren autenticación)
export const PUBLIC_ROUTES = [
  '/login',
  '/registro',
];

// Ruta de redirección después del login
export const LOGIN_REDIRECT = '/';

// Ruta de login
export const LOGIN_ROUTE = '/login';

// Ruta de acceso denegado
export const ACCESS_DENIED_ROUTE = '/acceso-denegado';
