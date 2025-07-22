import { useEffect } from 'react';

const ClearAuth = () => {
  useEffect(() => {
    // Limpiar cualquier token de autenticación al cargar la tienda pública
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      // Solo limpiar en páginas públicas, no en login o páginas de empleados
      if (!currentPath.includes('/login') && !currentPath.includes('/preparar-productos')) {
        console.log('🧹 Limpiando tokens de autenticación para navegación pública...');
        localStorage.removeItem('entrepeques_auth_token');
        localStorage.removeItem('entrepeques_user');
      }
    }
  }, []);
  
  return null;
};

export default ClearAuth;