import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginContainer from './LoginContainer';

/**
 * Componente de guardia de autenticación opcional para la tienda
 * Permite rutas públicas por defecto, con opción de requerir autenticación
 */
const OptionalAuthGuard = ({
  children,
  requireAuth = false,
  allowedRoles = [],
  fallbackComponent = null,
  showLoginModal = false
}) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  console.log('🔍 OptionalAuthGuard - Estado:', { isAuthenticated, isLoading, requireAuth, user: user?.username });

  // Manejar redirect en useEffect para evitar problemas de timing
  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated && !showLoginModal && !fallbackComponent) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        console.log('🔄 OptionalAuthGuard - Redirigiendo a login...');
        setIsRedirecting(true);
        const currentPath = window.location.pathname;
        const loginUrl = `/login?return=${encodeURIComponent(currentPath)}`;
        window.location.href = loginUrl;
      }
    }
  }, [isLoading, requireAuth, isAuthenticated, showLoginModal, fallbackComponent]);

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si se requiere autenticación y no está autenticado
  if (requireAuth && !isAuthenticated) {
    // Si se especifica mostrar modal de login
    if (showLoginModal) {
      return (
        <>
          {children}
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <LoginContainer />
            </div>
          </div>
        </>
      );
    }

    // Si hay un componente fallback personalizado
    if (fallbackComponent) {
      return fallbackComponent;
    }

    // Mostrar spinner mientras se procesa el redirect (manejado por useEffect)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div>
          <div className="bg-white rounded-lg shadow-lg p-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirigiendo al login...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si se requieren roles específicos y el usuario no los tiene
  if (requireAuth && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-full sm:max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-10 text-center">
            <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Permisos Insuficientes</h2>
            <p className="text-gray-600 mb-6">
              No tienes los permisos necesarios para acceder a esta sección.
            </p>
            <div className="space-y-3">
              <a 
                href="/" 
                className="block bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Volver al Inicio
              </a>
              {user && (
                <p className="text-sm text-gray-500">
                  Sesión iniciada como: <span className="font-medium">{user.username}</span>
                  <br />
                  Rol: <span className="font-medium">{user.role?.name || 'Sin rol'}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si todo está bien, renderizar los children
  return children;
};

export default OptionalAuthGuard;