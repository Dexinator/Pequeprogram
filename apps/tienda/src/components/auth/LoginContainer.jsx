import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginContainer = ({ onSuccess, onClose }) => {
  console.log('🔐 LoginContainer: Componente montado');
  const { login, error: authError, isLoading: authLoading, isAuthenticated, user } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si el usuario ya está autenticado, ejecutar onSuccess
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔐 LoginContainer: Usuario ya autenticado, ejecutando onSuccess');
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [isAuthenticated, user, onSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error al escribir
    if (localError || authError) {
      setLocalError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 LoginContainer: Submit iniciado');
    
    // Validación básica
    if (!formData.username || !formData.password) {
      setLocalError('Por favor completa todos los campos');
      return;
    }

    setIsSubmitting(true);
    setLocalError('');

    try {
      console.log('🔐 LoginContainer: Llamando a login con usuario:', formData.username);
      await login(formData);
      console.log('🔐 LoginContainer: Login exitoso');
      
      // Si hay un callback onSuccess, llamarlo
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('🔐 LoginContainer: Error en login:', error);
      setLocalError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorMessage = localError || authError;
  const isLoading = authLoading || isSubmitting;

  // Si llegamos aquí porque el API respondió 401 (sesión vencida), decirlo
  // claramente en vez de mostrar un login "de la nada".
  const sessionExpired =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('expired') === '1';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div>
        {/* Logo y título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Entrepeques
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {sessionExpired ? 'Tu sesión expiró. Vuelve a iniciar sesión para continuar.' : 'Inicia sesión para continuar'}
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {/* Botón de cerrar si se proporciona onClose */}
          {onClose && (
            <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensaje de error */}
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
              </div>
            )}

            {/* Campo de usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Ingresa tu usuario"
              />
            </div>

            {/* Campo de contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Ingresa tu contraseña"
              />
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2'
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Opciones adicionales */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿No tienes cuenta?{' '}
              <a href="/registro" className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium">
                Regístrate aquí
              </a>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <a href="/recuperar-contraseña" className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium">
                ¿Olvidaste tu contraseña?
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginContainer;