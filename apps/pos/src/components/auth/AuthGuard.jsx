import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginContainer from './LoginContainer';

const AuthGuard = ({ children }) => {
  console.log('🛡️ AuthGuard: Componente renderizado');
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  
  console.log('🛡️ AuthGuard: Estado actual', { 
    isAuthenticated, 
    isLoading, 
    user: user?.username || 'null' 
  });

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    console.log('🛡️ AuthGuard: Mostrando loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    console.log('🛡️ AuthGuard: Usuario no autenticado, mostrando LoginContainer');
    return <LoginContainer />;
  }

  // Verificar si el usuario tiene permisos para usar el POS
  const allowedRoles = ['superadmin', 'admin', 'gerente', 'vendedor'];
  const hasAccess = allowedRoles.includes(user?.role?.name || '');
  
  if (!hasAccess) {
    console.log('🛡️ AuthGuard: Usuario sin permisos de POS');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder al sistema de punto de venta.
          </p>
          <button
            onClick={() => logout()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Usuario autenticado y con permisos, mostrar contenido
  console.log('🛡️ AuthGuard: Usuario autenticado con permisos, mostrando contenido');
  return <>{children}</>;
};

export default AuthGuard;