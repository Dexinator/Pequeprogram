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
  isEmployee: boolean;
  isCustomer: boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🚀 AuthProvider: Inicializando componente...');

  // Inicializar isLoading basándose en si estamos en el cliente
  // Durante SSR, mantener isLoading=true para evitar redirecciones prematuras
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(typeof window === 'undefined' ? true : true);
  const [error, setError] = useState<string | null>(null);

  console.log('🚀 AuthProvider: Estados inicializados', {
    user: user?.username || 'null',
    isLoading,
    isSSR: typeof window === 'undefined',
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

      // Una sesión vencida debe tratarse como "sin sesión": si no, el admin de
      // citas se mostraba con un token caducado y todo fallaba con 401.
      if (token && authService.isTokenExpired(token)) {
        console.log('⌛ Token vencido: limpiando sesión');
        authService.logout();
        setUser(null);
      } else if (token && storedUser) {
        console.log('✅ Usuario autenticado:', storedUser.username);
        console.log('ID del usuario:', storedUser.id);
        console.log('Rol del usuario:', storedUser.role?.name);
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
    console.log('🔥 Entorno:', typeof window !== 'undefined' ? 'CLIENTE' : 'SERVIDOR');

    // Solo ejecutar en el cliente - CRÍTICO para evitar problemas de SSR
    if (typeof window !== 'undefined') {
      console.log('🔥 AuthProvider useEffect: En cliente, llamando checkAuth()');
      checkAuth();
    } else {
      // En el servidor, mantener isLoading=true para que OptionalAuthGuard no redirija
      console.log('🔥 AuthProvider useEffect: En servidor, manteniendo isLoading=true');
      // NO llamamos a setIsLoading(false) durante SSR
    }
  }, []);

  // Verificación de respaldo solo en el cliente
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      console.log('🔥 useEffect secundario: En servidor, saltando...');
      return;
    }

    console.log('🔥 AuthProvider useEffect secundario: Verificando estado en cliente...');

    // Si después de 1 segundo seguimos en loading, forzar verificación o finalizar
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout: Verificando si necesitamos forzar checkAuth...');
      console.log('⏰ Estado actual:', { isLoading, user: user?.username, isAuthenticated: !!user });

      if (isLoading) {
        const rawToken = localStorage.getItem('entrepeques_auth_token');
        const rawUser = localStorage.getItem('entrepeques_user');

        console.log('⏰ LocalStorage check:', {
          token: rawToken ? 'PRESENTE' : 'AUSENTE',
          user: rawUser ? 'PRESENTE' : 'AUSENTE'
        });

        if (rawToken && rawUser) {
          console.log('🔄 Forzando nueva verificación de autenticación...');
          checkAuth();
        } else {
          // Si no hay token ni usuario, asegurar que isLoading se ponga en false
          console.log('⏰ No hay autenticación guardada, finalizando carga...');
          setIsLoading(false);
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

  // Determinar el tipo de usuario
  const isEmployee = authService.isEmployee();
  const isCustomer = authService.isCustomer();

  // Función para verificar si el usuario tiene uno de los roles especificados
  const hasRole = (roles: string[]): boolean => {
    if (!user || !user.role) return false;
    return roles.includes(user.role.name);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        isEmployee,
        isCustomer,
        hasRole
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
      isLoading: context.isLoading,
      isEmployee: context.isEmployee,
      isCustomer: context.isCustomer
    });
  }

  // Si estamos en un entorno de servidor (SSR) o el contexto no está disponible,
  // devolvemos un contexto por defecto en lugar de lanzar un error
  if (context === undefined) {
    console.log('⚠️ useAuth: Devolviendo valores por defecto - contexto no disponible');
    // Valores por defecto para el contexto
    return {
      user: null,
      isLoading: false, // false para tienda, ya que no requiere autenticación
      error: null,
      isAuthenticated: false,
      isEmployee: false,
      isCustomer: false,
      hasRole: () => false,
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