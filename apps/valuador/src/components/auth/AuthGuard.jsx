import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PROTECTED_ROUTES, ROLE_PROTECTED_ROUTES, LOGIN_ROUTE, ACCESS_DENIED_ROUTE } from '../../config/auth.config';

/**
 * Componente para proteger rutas en toda la aplicación
 * Se debe incluir en el layout principal
 */
export default function AuthGuard() {
  // Obtener funciones y estado del contexto de autenticación
  // Usamos try/catch para manejar el caso cuando se usa fuera de un AuthProvider
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('Error al usar useAuth en AuthGuard:', error);
    // Valores por defecto si no se puede acceder al contexto
    authContext = {
      user: null,
      isAuthenticated: false,
      isLoading: false
    };
  }

  const { user, isAuthenticated, isLoading } = authContext;

  useEffect(() => {
    // No hacer nada si aún está cargando
    if (isLoading) return;

    // Obtener la ruta actual
    const currentPath = window.location.pathname;

    // Verificar si es una ruta protegida
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
      currentPath === route || currentPath.startsWith(`${route}/`)
    );

    // Verificar si es una ruta protegida por rol
    const roleProtectedRoute = Object.entries(ROLE_PROTECTED_ROUTES).find(([route]) =>
      currentPath === route || currentPath.startsWith(`${route}/`)
    );

    // Si es una ruta protegida y no está autenticado, redirigir al login
    if (isProtectedRoute && !isAuthenticated) {
      window.location.href = LOGIN_ROUTE;
      return;
    }

    // Si es una ruta protegida por rol
    if (roleProtectedRoute && isAuthenticated) {
      const [_, allowedRoles] = roleProtectedRoute;

      // Si el usuario no tiene un rol permitido, redirigir a acceso denegado
      if (!allowedRoles.includes(user?.role)) {
        window.location.href = ACCESS_DENIED_ROUTE;
        return;
      }
    }
  }, [isLoading, isAuthenticated, user]);

  // Este componente no renderiza nada, solo verifica la autenticación
  return null;
}
