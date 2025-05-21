import React from 'react';
import { AuthProvider } from '../../context/AuthContext';

/**
 * Componente contenedor para proporcionar el contexto de autenticación
 * a los componentes hijos.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 */
export default function AuthWrapper({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
