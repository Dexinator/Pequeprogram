import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginContainer = () => {
  console.log('🔐 LoginContainer: Componente montado');
  const { login, error: authError, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // El AuthContext manejará la redirección
    } catch (error) {
      console.error('🔐 LoginContainer: Error en login:', error);
      setLocalError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorMessage = localError || authError;
  const isLoading = authLoading || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Entrepeques POS
          </h1>
          <p className="text-gray-600">Sistema de Punto de Venta</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensaje de error */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            {/* Campo de usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa tu usuario"
              />
            </div>

            {/* Campo de contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
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

          {/* Nota de seguridad */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Sistema de Punto de Venta - Acceso para empleados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginContainer;