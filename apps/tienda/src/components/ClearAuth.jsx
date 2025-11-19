import { useEffect } from 'react';
import { ROUTE_CONFIG } from '../config/routes.config';

const ClearAuth = () => {
  useEffect(() => {
    // Limpiar cualquier token de autenticación al cargar la tienda pública
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;

      // Rutas protegidas que NO deben limpiar el token
      const protectedRoutes = [
        ...ROUTE_CONFIG.customerOnly,
        ...ROUTE_CONFIG.employeeOnly,
        ...ROUTE_CONFIG.adminOnly,
        '/login',
        '/registro'
      ];

      // Verificar si la ruta actual es una ruta protegida
      const isProtectedRoute = protectedRoutes.some(route => {
        // Convertir rutas con parámetros a regex
        const regex = new RegExp('^' + route.replace(/:[^/]+/g, '[^/]+') + '$');
        return regex.test(currentPath) || currentPath.includes(route);
      });

      if (!isProtectedRoute) {
        console.log('🧹 Limpiando tokens de autenticación para navegación pública...');
        localStorage.removeItem('entrepeques_auth_token');
        localStorage.removeItem('entrepeques_user');
      } else {
        console.log('🔒 Ruta protegida detectada, manteniendo autenticación:', currentPath);
      }
    }
  }, []);

  return null;
};

export default ClearAuth;