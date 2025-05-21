import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthService } from '../services/auth.service';
import type { User, LoginCredentials } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authService = new AuthService();

  // Función para verificar la autenticación
  const checkAuth = () => {
    try {
      console.log('Verificando autenticación...');
      const storedUser = authService.getUser();
      const token = authService.getToken();

      console.log('Token encontrado:', !!token);
      console.log('Usuario encontrado:', !!storedUser);

      if (token && storedUser) {
        console.log('Usuario autenticado:', storedUser.username);
        setUser(storedUser);
      } else {
        console.log('No hay usuario autenticado');
        setUser(null);
      }
    } catch (err) {
      console.error('Error al verificar autenticación:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Iniciando sesión con credenciales:', credentials.username);
      const response = await authService.login(credentials);

      if (response.success && response.token && response.user) {
        console.log('Login exitoso, actualizando estado de usuario');
        setUser(response.user);

        // Verificar que el token se haya guardado correctamente
        const savedToken = authService.getToken();
        if (savedToken) {
          console.log('Token guardado correctamente');
        } else {
          console.warn('El token no se guardó correctamente');
        }
      } else {
        console.error('Respuesta de login no válida:', response);
        setError(response.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  // Si estamos en un entorno de servidor (SSR) o el contexto no está disponible,
  // devolvemos un contexto por defecto en lugar de lanzar un error
  if (context === undefined) {
    // Valores por defecto para el contexto
    return {
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      login: async () => {
        console.warn('useAuth se está usando fuera de un AuthProvider');
      },
      logout: () => {
        console.warn('useAuth se está usando fuera de un AuthProvider');
      }
    };
  }

  return context;
};