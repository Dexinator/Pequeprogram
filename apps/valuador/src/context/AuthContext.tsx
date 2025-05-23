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
  const checkAuth = () => {
    try {
      console.log('=== Verificando autenticación ===');
      console.log('Entorno del navegador:', typeof window !== 'undefined');
      console.log('LocalStorage disponible:', typeof localStorage !== 'undefined');
      
      console.log('🔍 Llamando a authService.getUser()...');
      const storedUser = authService.getUser();
      console.log('🔍 Resultado de getUser():', storedUser);
      
      console.log('🔍 Llamando a authService.getToken()...');
      const token = authService.getToken();
      console.log('🔍 Resultado de getToken():', token ? 'Token presente' : 'Token ausente');

      console.log('Token encontrado:', !!token);
      console.log('Usuario encontrado:', !!storedUser);

      if (token && storedUser) {
        console.log('✅ Usuario autenticado:', storedUser.username);
        console.log('ID del usuario:', storedUser.id);
        console.log('🔧 Llamando a setUser()...');
        setUser(storedUser);
        console.log('🔧 setUser() completado');
      } else {
        console.log('❌ No hay usuario autenticado');
        if (!token) console.log('  - Falta token');
        if (!storedUser) console.log('  - Falta información de usuario');
        console.log('🔧 Llamando a setUser(null)...');
        setUser(null);
        console.log('🔧 setUser(null) completado');
      }
    } catch (err) {
      console.error('💥 Error al verificar autenticación:', err);
      if (err instanceof Error) {
        console.error('💥 Stack trace:', err.stack);
      }
      setUser(null);
    } finally {
      console.log('🏁 Llamando a setIsLoading(false)...');
      setIsLoading(false);
      console.log('=== Fin verificación de autenticación ===');
    }
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    console.log('🔥 AuthProvider useEffect: Ejecutándose...');
    checkAuth();
    console.log('🔥 AuthProvider useEffect: checkAuth() llamado');
  }, []);

  // Verificación adicional para asegurar hidratación completa
  useEffect(() => {
    console.log('🔥 AuthProvider useEffect secundario: Verificando estado...');
    
    // Si después de 1 segundo seguimos en loading y hay token en localStorage, forzar verificación
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout: Verificando si necesitamos forzar checkAuth...');
      console.log('⏰ Estado actual:', { isLoading, user: user?.username, isAuthenticated: !!user });
      
      if (isLoading && typeof window !== 'undefined') {
        const rawToken = localStorage.getItem('entrepeques_auth_token');
        const rawUser = localStorage.getItem('entrepeques_user');
        
        console.log('⏰ LocalStorage check:', { 
          token: rawToken ? 'PRESENTE' : 'AUSENTE', 
          user: rawUser ? 'PRESENTE' : 'AUSENTE' 
        });
        
        if (rawToken && rawUser) {
          console.log('🔄 Forzando nueva verificación de autenticación...');
          checkAuth();
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isLoading, user]);

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
  
  console.log('🔗 useAuth: Contexto obtenido:', context ? 'Contexto encontrado' : 'Contexto NO encontrado');
  if (context) {
    console.log('🔗 useAuth: Valores del contexto:', {
      isAuthenticated: context.isAuthenticated,
      user: context.user?.username || 'null',
      isLoading: context.isLoading
    });
  }

  // Si estamos en un entorno de servidor (SSR) o el contexto no está disponible,
  // devolvemos un contexto por defecto en lugar de lanzar un error
  if (context === undefined) {
    console.log('⚠️ useAuth: Devolviendo valores por defecto - contexto no disponible');
    // Valores por defecto para el contexto - indicamos que está cargando para evitar
    // mostrar la pantalla de acceso restringido antes de verificar la autenticación
    return {
      user: null,
      isLoading: true, // Cambiado a true para indicar que está verificando
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