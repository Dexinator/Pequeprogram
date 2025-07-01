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
  console.log('🚀 AuthProvider: Inicializando componente...');
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🚀 AuthProvider: Estados inicializados', { 
    user: user?.username || 'null', 
    isLoading, 
    error 
  });

  const authService = new AuthService();
  console.log('🚀 AuthProvider: AuthService creado');

  // Función para verificar la autenticación
  const checkAuth = async () => {
    console.log('=== Verificando autenticación ===');
    
    try {
      // Solo verificar si estamos en el cliente
      if (typeof window === 'undefined') {
        console.log('❌ No estamos en el cliente, saltando verificación');
        setIsLoading(false);
        return;
      }
      
      const storedUser = authService.getUser();
      const token = authService.getToken();
      
      console.log('Token encontrado:', !!token);
      console.log('Usuario encontrado:', !!storedUser);

      if (token && storedUser) {
        console.log('✅ Usuario autenticado:', storedUser.username);
        setUser(storedUser);
      } else {
        console.log('❌ No hay usuario autenticado');
        setUser(null);
      }
    } catch (err) {
      console.error('💥 Error al verificar autenticación:', err);
      setUser(null);
    }
    
    // Siempre establecer isLoading en false
    setIsLoading(false);
    console.log('=== Fin verificación de autenticación ===');
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    console.log('🔥 AuthProvider useEffect: Ejecutándose...');
    
    // Pequeño retraso para asegurar que el DOM esté listo
    const timeoutId = setTimeout(() => {
      console.log('🔥 AuthProvider useEffect: Llamando checkAuth después del timeout...');
      checkAuth();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);


  const login = async (credentials: LoginCredentials) => {
    console.log('🔐 AuthContext.login(): Iniciando proceso de login...');
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 AuthContext.login(): Credenciales:', credentials.username);
      console.log('🔐 AuthContext.login(): Llamando a authService.login()...');
      const response = await authService.login(credentials);
      console.log('🔐 AuthContext.login(): Respuesta del authService:', response);

      if (response.success && response.token && response.user) {
        console.log('🔐 AuthContext.login(): Login exitoso en authService');
        console.log('🔐 AuthContext.login(): Token recibido:', response.token ? 'PRESENTE' : 'AUSENTE');
        console.log('🔐 AuthContext.login(): Usuario recibido:', response.user.username);
        
        // Verificar que el AuthService haya guardado en localStorage
        const savedToken = authService.getToken();
        const savedUser = authService.getUser();
        
        console.log('🔐 AuthContext.login(): Verificación de guardado:');
        console.log('  - Token guardado por AuthService:', savedToken ? 'PRESENTE' : 'AUSENTE');
        console.log('  - Usuario guardado por AuthService:', savedUser?.username || 'AUSENTE');
        
        console.log('🔐 AuthContext.login(): Actualizando estado de usuario...');
        setUser(response.user);
        console.log('🔐 AuthContext.login(): Estado de usuario actualizado');

        // Verificar que el token se haya guardado correctamente
        if (savedToken) {
          console.log('✅ AuthContext.login(): Token guardado correctamente');
        } else {
          console.warn('⚠️ AuthContext.login(): El token no se guardó correctamente');
        }
      } else {
        console.error('❌ AuthContext.login(): Respuesta de login no válida:', response);
        setError(response.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('❌ AuthContext.login(): Error en login:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      console.log('🔐 AuthContext.login(): Finalizando, setIsLoading(false)');
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
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
};