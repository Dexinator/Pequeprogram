import React, { useState, useEffect } from 'react';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

/**
 * Componente de formulario de registro
 * Utiliza directamente el servicio de usuarios
 */
export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    first_name: '',
    last_name: '',
    role_id: 3 // Por defecto, rol de valuador (ID 3)
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Crear instancias de los servicios solo en el cliente
  const [userService, setUserService] = useState(null);
  const [authService, setAuthService] = useState(null);
  const [roles, setRoles] = useState([]);

  // Inicializar los servicios solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userSvc = new UserService();
      const authSvc = new AuthService();

      setUserService(userSvc);
      setAuthService(authSvc);

      // Cargar roles
      const loadRoles = async () => {
        try {
          const rolesList = await userSvc.getRoles();
          setRoles(rolesList);

          // Si hay roles, establecer el rol por defecto al primero que no sea admin
          if (rolesList.length > 0) {
            const defaultRole = rolesList.find(role => role.name !== 'admin') || rolesList[0];
            setFormData(prev => ({
              ...prev,
              role_id: defaultRole.id
            }));
          }
        } catch (error) {
          console.error('Error al cargar roles:', error);
        }
      };

      loadRoles();
    }
  }, []);

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
    } else if (formData.username.length < 3) {
      errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El correo electrónico no es válido';
    }

    if (!formData.first_name.trim()) {
      errors.first_name = 'El nombre es obligatorio';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'El apellido es obligatorio';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Verificar si el servicio de usuarios está disponible
      if (!userService) {
        setError('El servicio de usuarios no está disponible');
        return;
      }

      setIsSubmitting(true);
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        // Preparar datos para el registro
        const userData = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role_id: formData.role_id
        };

        console.log('Enviando formulario de registro:', userData);
        console.log('URL de la API:', authService.getBaseUrl ? authService.getBaseUrl() : 'No disponible');

        // Registrar usuario usando el servicio de autenticación
        const response = await authService.register(userData);

        console.log('Respuesta del registro:', response);

        if (response && response.success) {
          // Mostrar mensaje de éxito
          setSuccess('Usuario registrado correctamente. Ahora puedes iniciar sesión.');

          // Limpiar formulario
          setFormData({
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            first_name: '',
            last_name: '',
            role_id: 3
          });
        } else {
          // Mostrar mensaje de error
          console.error('Error en la respuesta del registro:', response);
          setError(response?.message || 'Error al registrar usuario. Verifica los datos ingresados.');
        }
      } catch (err) {
        console.error('Error al registrar usuario:', err);
        if (err.message && err.message.includes('Failed to fetch')) {
          setError('No se pudo conectar con el servidor. Verifica tu conexión a internet o contacta al administrador.');
        } else {
          setError(err instanceof Error ? err.message : 'Error al registrar usuario');
        }
      } finally {
        setIsSubmitting(false);
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

        {success && (
          <div className="mb-4 p-3 bg-verde-claro/10 border border-verde-claro rounded-md text-verde-claro">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo de nombre */}
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-text-base">
              Nombre
            </label>
            <div className="mt-1">
              <input
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                required
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full p-3 border ${
                  formErrors.first_name ? 'border-rosa' : 'border-border'
                } rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all`}
                placeholder="Ingresa tu nombre"
                disabled={isLoading}
              />
              {formErrors.first_name && (
                <p className="mt-1 text-sm text-rosa">{formErrors.first_name}</p>
              )}
            </div>
          </div>

          {/* Campo de apellido */}
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-text-base">
              Apellido
            </label>
            <div className="mt-1">
              <input
                id="last_name"
                name="last_name"
                type="text"
                autoComplete="family-name"
                required
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full p-3 border ${
                  formErrors.last_name ? 'border-rosa' : 'border-border'
                } rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all`}
                placeholder="Ingresa tu apellido"
                disabled={isLoading}
              />
              {formErrors.last_name && (
                <p className="mt-1 text-sm text-rosa">{formErrors.last_name}</p>
              )}
            </div>
          </div>

          {/* Campo de email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-base">
              Correo electrónico
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 border ${
                  formErrors.email ? 'border-rosa' : 'border-border'
                } rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all`}
                placeholder="Ingresa tu correo electrónico"
                disabled={isLoading}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-rosa">{formErrors.email}</p>
              )}
            </div>
          </div>

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
                autoComplete="new-password"
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

          {/* Campo de confirmación de contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-base">
              Confirmar contraseña
            </label>
            <div className="mt-1 relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full p-3 border ${
                  formErrors.confirmPassword ? 'border-rosa' : 'border-border'
                } rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all`}
                placeholder="Confirma tu contraseña"
                disabled={isLoading}
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-rosa">{formErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Campo de rol (solo visible si hay roles disponibles) */}
          {roles.length > 0 && (
            <div>
              <label htmlFor="role_id" className="block text-sm font-medium text-text-base">
                Rol
              </label>
              <div className="mt-1">
                <select
                  id="role_id"
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-azul-claro/50 focus:border-azul-claro outline-none transition-all"
                  disabled={isLoading}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description || ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Botón de registro */}
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
                  Registrando...
                </span>
              ) : (
                'Registrarse'
              )}
            </button>
          </div>

          {/* Enlace para iniciar sesión */}
          <div className="text-center mt-4">
            <p className="text-sm text-text-muted">
              ¿Ya tienes una cuenta?{' '}
              <a href="/login" className="text-azul-claro hover:text-azul-profundo">
                Inicia sesión
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
