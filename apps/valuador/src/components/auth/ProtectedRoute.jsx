import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a la página de login si el usuario no está autenticado
 *
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido a mostrar si el usuario está autenticado
 * @param {string[]} [props.allowedRoles] - Roles permitidos para acceder a la ruta (opcional)
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  // Obtener funciones y estado del contexto de autenticación
  // Usamos try/catch para manejar el caso cuando se usa fuera de un AuthProvider
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('Error al usar useAuth en ProtectedRoute:', error);
    // Valores por defecto si no se puede acceder al contexto
    authContext = {
      user: null,
      isAuthenticated: false,
      isLoading: false
    };
  }

  const { user, isAuthenticated, isLoading } = authContext;

  useEffect(() => {
    // Si no está cargando y no está autenticado, redirigir al login
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
    }

    // Si hay roles permitidos y el usuario no tiene un rol permitido, redirigir
    if (
      !isLoading &&
      isAuthenticated &&
      allowedRoles.length > 0 &&
      user &&
      !allowedRoles.includes(user.role)
    ) {
      // Redirigir a una página de acceso denegado o a la página principal
      window.location.href = '/acceso-denegado';
    }
  }, [isLoading, isAuthenticated, user, allowedRoles]);

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"></div>
      </div>
    );
  }

  // Si no está autenticado o no tiene los roles permitidos, no mostrar nada
  // (la redirección se manejará en el efecto)
  if (!isAuthenticated || (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role))) {
    return null;
  }

  // Si está autenticado y tiene los roles permitidos, mostrar el contenido
  return <>{children}</>;
}
