/**
 * Configuración de rutas para la aplicación de tienda
 * Define qué rutas son públicas, privadas y sus permisos
 */
export const ROUTE_CONFIG = {
  // Rutas completamente públicas (no requieren autenticación)
  public: [
    '/',
    '/productos',
    '/producto/:id',
    '/categorias',
    '/categoria/:id',
    '/buscar',
    '/nosotros',
    '/contacto',
    '/politicas',
    '/envios',
    '/login',
    '/registro',
    '/recuperar-contraseña'
  ],
  
  // Rutas solo para clientes registrados
  customerOnly: [
    '/mi-cuenta',
    '/mis-pedidos',
    '/mis-favoritos',
    '/mi-direccion',
    '/checkout',
    '/orden/:id'
  ],
  
  // Rutas solo para empleados (admin, gerente, vendedor)
  employeeOnly: [
    '/preparar-productos',
    '/reportes-tienda',
    '/gestionar-pedidos',
    '/actualizar-inventario'
  ],
  
  // Rutas de administrador
  adminOnly: [
    '/configuracion-tienda',
    '/gestionar-categorias',
    '/gestionar-usuarios',
    '/analytics'
  ],
  
  // Rutas con funcionalidad mejorada cuando está autenticado
  enhanced: [
    '/carrito', // Guardado persistente del carrito
    '/producto/:id', // Historial de visualización, favoritos
    '/' // Recomendaciones personalizadas
  ]
};

// Roles permitidos para rutas de empleados
export const EMPLOYEE_ROLES = [
  'superadmin',
  'admin',
  'manager',
  'gerente',
  'sales',
  'vendedor'
];

// Roles permitidos para rutas de administrador
export const ADMIN_ROLES = [
  'superadmin',
  'admin',
  'manager',
  'gerente'
];

// Función helper para verificar si una ruta requiere autenticación
export function requiresAuth(pathname) {
  const allProtectedRoutes = [
    ...ROUTE_CONFIG.customerOnly,
    ...ROUTE_CONFIG.employeeOnly,
    ...ROUTE_CONFIG.adminOnly
  ];
  
  return allProtectedRoutes.some(route => {
    // Convertir rutas con parámetros a regex
    const regex = new RegExp('^' + route.replace(/:[^/]+/g, '[^/]+') + '$');
    return regex.test(pathname);
  });
}

// Función helper para obtener los roles requeridos para una ruta
export function getRequiredRoles(pathname) {
  // Verificar rutas de admin
  const isAdminRoute = ROUTE_CONFIG.adminOnly.some(route => {
    const regex = new RegExp('^' + route.replace(/:[^/]+/g, '[^/]+') + '$');
    return regex.test(pathname);
  });
  
  if (isAdminRoute) {
    return ADMIN_ROLES;
  }
  
  // Verificar rutas de empleados
  const isEmployeeRoute = ROUTE_CONFIG.employeeOnly.some(route => {
    const regex = new RegExp('^' + route.replace(/:[^/]+/g, '[^/]+') + '$');
    return regex.test(pathname);
  });
  
  if (isEmployeeRoute) {
    return EMPLOYEE_ROLES;
  }
  
  // Rutas de cliente no requieren roles específicos
  return [];
}