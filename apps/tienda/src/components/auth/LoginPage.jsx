import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import LoginContainer from './LoginContainer';

const LoginPageContent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir
    if (!isLoading && isAuthenticated && user) {
      // Verificar si hay una URL de retorno
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('return') || '/';
      
      // Redirigir según el tipo de usuario
      if (user.role?.name === 'customer') {
        window.location.href = returnUrl;
      } else {
        // Empleados van a preparar productos por defecto
        window.location.href = returnUrl === '/' ? '/preparar-productos' : returnUrl;
      }
    }
  }, [isAuthenticated, isLoading, user]);

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado (mientras se procesa la redirección)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-pulse">
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  const handleLoginSuccess = () => {
    // El useEffect se encargará de la redirección
    console.log('Login exitoso, esperando redirección...');
  };

  const handleClose = () => {
    window.location.href = '/';
  };

  // Mostrar el formulario de login
  return (
    <LoginContainer 
      onSuccess={handleLoginSuccess}
      onClose={handleClose}
    />
  );
};

// Componente wrapper con AuthProvider
const LoginPage = () => {
  return (
    <AuthProvider>
      <LoginPageContent />
    </AuthProvider>
  );
};

export default LoginPage;