import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import LoginForm from './LoginForm';

/**
 * Componente contenedor para el formulario de login
 * Proporciona el contexto de autenticación al formulario
 *
 * Este componente es necesario porque Astro renderiza los componentes
 * de forma aislada y necesitamos asegurarnos de que el contexto
 * esté disponible para el componente LoginForm.
 */
export default function LoginContainer() {
  // Creamos un nuevo AuthProvider específico para este componente
  // para asegurarnos de que el contexto esté disponible
  return (
    <AuthProvider>
      <div className="login-container">
        <LoginForm />
      </div>
    </AuthProvider>
  );
}
