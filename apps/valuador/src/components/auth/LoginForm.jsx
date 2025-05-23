import React, { useState } from 'react';
import { useAuth, AuthProvider } from '../../context/AuthContext';

/**
 * Componente de formulario de inicio de sesión
 * Utiliza el contexto de autenticación
 */
function LoginFormContent() {
  const { login, error: authError, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Actualizar el error local si hay un error en el contexto de autenticación
  React.useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Limpiar error específico cuando el usuario comienza a escribir
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validar el formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'El nombre de usuario es obligatorio';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      setError(null);

      try {
        console.log('📝 LoginForm: Enviando formulario de login:', formData);

        // Usar el contexto de autenticación para iniciar sesión
        console.log('📝 LoginForm: Llamando a login() del contexto...');
        await login(formData);
        console.log('📝 LoginForm: login() completado sin errores');

        // Verificar que el token se haya guardado
        if (typeof window !== 'undefined') {
          const tokenSaved = localStorage.getItem('entrepeques_auth_token');
          const userSaved = localStorage.getItem('entrepeques_user');
          
          console.log('📝 LoginForm: Verificación post-login:');
          console.log('  - Token guardado:', tokenSaved ? 'SÍ' : 'NO');
          console.log('  - Usuario guardado:', userSaved ? 'SÍ' : 'NO');
          
          if (!tokenSaved || !userSaved) {
            console.error('❌ LoginForm: Falló el guardado en localStorage');
            setError('Error: No se pudo completar el inicio de sesión. Intenta nuevamente.');
            setIsLoading(false);
            return;
          }
        }

        console.log('📝 LoginForm: Login exitoso, esperando 500ms antes de redirigir...');
        // Esperar un momento para que se actualice el estado
        setTimeout(() => {
          // Redirigir a la página principal
          console.log('📝 LoginForm: Redirigiendo a /historial...');
          window.location.href = '/historial';
        }, 500);
      } catch (err) {
        console.error('❌ LoginForm: Error al iniciar sesión:', err);
        if (err.message && err.message.includes('Failed to fetch')) {
          setError('No se pudo conectar con el servidor. Verifica tu conexión a internet o contacta al administrador.');
        } else {
          setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        }
        setIsLoading(false);
      }
    }
  };

  // Alternar visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mt-8">
      <div className="bg-background-alt p-8 rounded-lg shadow-md border border-border">
        {error && (
          <div className="mb-4 p-3 bg-rosa/10 border border-rosa rounded-md text-rosa">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo de usuario */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-base">
              Nombre de usuario
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className={`w-full p-3 border ${
                  formErrors.username ? 'border-rosa' : 'border-border'
                } rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all`}
                placeholder="Ingresa tu nombre de usuario"
                disabled={isLoading}
              />
              {formErrors.username && (
                <p className="mt-1 text-sm text-rosa">{formErrors.username}</p>
              )}
            </div>
          </div>

          {/* Campo de contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-base">
              Contraseña
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-3 border ${
                  formErrors.password ? 'border-rosa' : 'border-border'
                } rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all`}
                placeholder="Ingresa tu contraseña"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-base"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
              {formErrors.password && (
                <p className="mt-1 text-sm text-rosa">{formErrors.password}</p>
              )}
            </div>
          </div>

          {/* Botón de inicio de sesión */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-azul-claro hover:bg-azul-profundo focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-claro transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </div>

          {/* Enlace para registrarse */}
          <div className="text-center mt-4">
            <p className="text-sm text-text-muted">
              ¿No tienes una cuenta?{' '}
              <a href="/registro" className="text-azul-claro hover:text-azul-profundo">
                Regístrate
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginForm() {
  return (
    <AuthProvider>
      <LoginFormContent />
    </AuthProvider>
  );
}
