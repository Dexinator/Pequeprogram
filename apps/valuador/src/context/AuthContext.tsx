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

  useEffect(() => {
    // Verificar si hay un usuario autenticado al inicio
    const checkAuth = () => {
      const storedUser = authService.getUser();
      setUser(storedUser);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (err) {
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