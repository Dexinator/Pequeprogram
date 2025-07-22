# Sistema de Autenticación y Login - Entrepeques

## Resumen General

El sistema de autenticación de Entrepeques utiliza JWT (JSON Web Tokens) para manejar la autenticación de usuarios en todas las aplicaciones del proyecto. Este documento detalla la implementación correcta del sistema de login para garantizar su funcionamiento en cualquier aplicación del monorepo.

## Actualización Enero 2025

Se ha implementado un sistema de autenticación mejorado y homogéneo en la aplicación de tienda que incluye:
- **OptionalAuthGuard**: Componente para manejar rutas públicas y privadas
- **Interceptor 401**: Manejo automático de sesiones expiradas
- **Inicialización de servicios**: Los servicios verifican el token antes de cada petición
- **Soporte para rutas mixtas**: Rutas públicas con funcionalidad mejorada cuando hay autenticación

## Arquitectura de Autenticación

### Backend (API)

#### Endpoints de Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar nuevo usuario
- `GET /api/auth/me` - Obtener información del usuario actual

#### Roles y Jerarquía
Los roles están organizados jerárquicamente (menor número = mayor privilegio):
1. **superadmin** (nivel 1) - Acceso completo al sistema
2. **admin** (nivel 2) - Administración de usuarios y configuración
3. **gerente** (nivel 3) - Gerente de tienda, acceso a reportes
4. **valuador** (nivel 4) - Puede valorar artículos
5. **vendedor** (nivel 5) - Acceso limitado al POS

### Middleware de Autorización

```typescript
// Uso básico - requiere autenticación
router.get('/protected', authMiddleware, handler);

// Con roles específicos
router.get('/admin-only', authMiddleware, roleMiddleware(['admin']), handler);

// Los roles superiores tienen acceso automático a funciones de roles inferiores
router.get('/valuador-task', authMiddleware, roleMiddleware(['valuador']), handler);
// superadmin, admin y gerente también pueden acceder
```

## Implementación en Frontend (Astro + React)

### Estructura de Archivos Necesarios

Para implementar autenticación en una nueva app, necesitas estos archivos:

```
apps/[tu-app]/src/
├── components/
│   ├── auth/
│   │   ├── AuthGuard.jsx
│   │   └── LoginContainer.jsx
│   └── [TuApp]Dashboard.jsx
├── context/
│   └── AuthContext.tsx
├── services/
│   ├── auth.service.ts
│   ├── http.service.ts
│   └── user.service.ts (si necesitas gestión de usuarios)
└── pages/
    ├── index.astro
    └── login.astro
```

### 1. Servicio HTTP Base (`http.service.ts`)

```typescript
export class HttpService {
  private baseUrl: string;
  private headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  constructor(baseUrl = 'http://localhost:3001/api') {
    if (typeof window !== 'undefined') {
      try {
        const envUrl = import.meta?.env?.PUBLIC_API_URL;
        if (envUrl) {
          baseUrl = envUrl;
        }
      } catch (error) {
        console.warn('Error al obtener la URL de la API:', error);
      }
    }
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.headers = {
      ...this.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  // Métodos get, post, put, delete...
}
```

### 2. Servicio de Autenticación (`auth.service.ts`)

```typescript
export class AuthService {
  private http: HttpService;
  private readonly TOKEN_KEY = 'entrepeques_auth_token';
  private readonly USER_KEY = 'entrepeques_user';

  constructor() {
    this.http = new HttpService();
    
    // Inicializar token si existe
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = this.getToken();
      if (token) {
        this.http.setAuthToken(token);
      }
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.http.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.token && response.user) {
      this.saveToken(response.token);
      this.saveUser(response.user);
      this.http.setAuthToken(response.token);
    }
    
    return response;
  }

  logout(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getUser(): User | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const userJson = localStorage.getItem(this.USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        return null;
      }
    }
    return null;
  }
}
```

### 3. Contexto de Autenticación Mejorado (`AuthContext.tsx`)

El AuthContext ahora incluye funciones helper para verificar roles y tipo de usuario:

```typescript
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authService = new AuthService();

  const checkAuth = async () => {
    try {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }
      
      const storedUser = authService.getUser();
      const token = authService.getToken();
      
      if (token && storedUser) {
        setUser(storedUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error al verificar autenticación:', err);
      setUser(null);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      checkAuth();
    } else {
      // En el servidor, establecer isLoading en false inmediatamente
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.token && response.user) {
        setUser(response.user);
      } else {
        setError(response.message || 'Error al iniciar sesión');
      }
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
```

### 4. AuthGuard Component (`AuthGuard.jsx`)

```jsx
const AuthGuard = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginContainer />;
  }

  // Verificar permisos si se especificaron roles
  const hasPermission = allowedRoles.length === 0 || 
    (user?.role?.name && allowedRoles.includes(user.role.name));
  
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta sección.
          </p>
          <button onClick={() => logout()} className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700">
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
```

### 5. OptionalAuthGuard Component (Nuevo - Para Apps con Rutas Mixtas)

El `OptionalAuthGuard` es ideal para aplicaciones como la tienda online que tienen rutas públicas y privadas:

```jsx
// components/auth/OptionalAuthGuard.jsx
const OptionalAuthGuard = ({ 
  children, 
  requireAuth = false, 
  allowedRoles = [],
  fallbackComponent = null,
  showLoginModal = false 
}) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Si se requiere autenticación y no está autenticado
  if (requireAuth && !isAuthenticated) {
    if (showLoginModal) {
      return (
        <>
          {children}
          <LoginModal />
        </>
      );
    }

    if (fallbackComponent) {
      return fallbackComponent;
    }

    return <LoginPrompt />;
  }

  // Si se requieren roles específicos y el usuario no los tiene
  if (requireAuth && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <InsufficientPermissions />;
  }

  // Si todo está bien, renderizar los children
  return children;
};
```

Uso en páginas con autenticación opcional:

```jsx
// Página pública (no requiere auth)
<OptionalAuthGuard>
  <PublicContent />
</OptionalAuthGuard>

// Página privada para empleados
<OptionalAuthGuard requireAuth={true} allowedRoles={['admin', 'manager', 'sales']}>
  <EmployeeContent />
</OptionalAuthGuard>
```

### 6. Componente Dashboard Principal

**IMPORTANTE**: Para evitar errores de contexto, siempre encapsula AuthProvider, AuthGuard y tu componente principal:

```jsx
// [TuApp]Dashboard.jsx
export default function TuAppDashboard() {
  return (
    <AuthProvider>
      <AuthGuard allowedRoles={['superadmin', 'admin', 'gerente']}>
        <TuAppMain />
      </AuthGuard>
    </AuthProvider>
  );
}
```

### 6. Integración en Astro (`index.astro`)

```astro
---
import TuAppDashboard from '../components/TuAppDashboard.jsx';
import Layout from '../layouts/Layout.astro';
---

<Layout title="Tu App - Entrepeques">
  <TuAppDashboard client:only="react" />
</Layout>
```

## Configuración de Servicios que Requieren Autenticación

### Método Mejorado con Inicialización Automática

Cuando crees servicios que necesiten autenticación, implementa la inicialización automática del token:

```typescript
export class TuServicio {
  private http = httpService;
  
  constructor() {
    // Verificar si hay token guardado al crear el servicio
    this.initializeAuth();
  }
  
  private initializeAuth() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        console.log('🔑 TuServicio: Token encontrado, configurando...');
        this.http.setAuthToken(token);
      }
    }
  }

  // En cada método que requiera autenticación
  async getProtectedData() {
    // Verificar token antes de la petición
    this.initializeAuth();
    
    return this.http.get('/protected-endpoint');
  }
}
```

### Interceptor 401 Automático

El HttpService ahora incluye un interceptor que maneja automáticamente los errores 401:

```typescript
// http.service.ts
private handleUnauthorized() {
  console.log('🚫 Error 401: No autorizado - manejando...');
  
  // Limpiar token inválido
  this.clearAuthToken();
  
  // Limpiar localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('entrepeques_auth_token');
    localStorage.removeItem('entrepeques_user');
    
    // Solo redirigir si no estamos ya en la página de login
    if (!window.location.pathname.includes('/login')) {
      // Guardar la URL actual para volver después del login
      const currentUrl = window.location.pathname + window.location.search;
      console.log('🔄 Redirigiendo a login, URL de retorno:', currentUrl);
      window.location.href = `/login?return=${encodeURIComponent(currentUrl)}`;
    }
  }
}
```

Esto se activa automáticamente en todos los métodos HTTP (GET, POST, PUT, DELETE) cuando el servidor retorna un error 401.

## Manejo de Sesiones y Logout

### Logout Programático
```javascript
const { logout } = useAuth();
logout();
window.location.href = '/login';
```

### Logout Manual (sin React)
```javascript
localStorage.removeItem('entrepeques_auth_token');
localStorage.removeItem('entrepeques_user');
window.location.reload();
```

## Flujo de Autenticación

1. **Usuario intenta acceder a la aplicación**
   - AuthProvider verifica si hay token en localStorage
   - Si hay token, valida y carga datos del usuario
   - Si no hay token, muestra LoginContainer

2. **Usuario inicia sesión**
   - Credenciales enviadas a `/api/auth/login`
   - API valida y retorna token + datos de usuario
   - Token y usuario guardados en localStorage
   - HttpService actualizado con el token
   - Usuario redirigido al dashboard

3. **Peticiones autenticadas**
   - Todas las peticiones incluyen header `Authorization: Bearer [token]`
   - API valida token en cada petición
   - Si token es inválido/expirado, retorna 401

4. **Logout**
   - Limpia localStorage
   - Redirige a login

## Configuración de Rutas (Nuevo)

Para aplicaciones con rutas mixtas (públicas y privadas), usa un archivo de configuración centralizado:

```javascript
// config/routes.config.js
export const ROUTE_CONFIG = {
  // Rutas completamente públicas
  public: [
    '/',
    '/productos',
    '/categorias',
    '/buscar',
    '/login',
    '/registro'
  ],
  
  // Rutas solo para clientes registrados
  customerOnly: [
    '/mi-cuenta',
    '/mis-pedidos',
    '/checkout'
  ],
  
  // Rutas solo para empleados
  employeeOnly: [
    '/preparar-productos',
    '/reportes-tienda',
    '/gestionar-pedidos'
  ],
  
  // Rutas con funcionalidad mejorada cuando está autenticado
  enhanced: [
    '/carrito', // Guardado persistente del carrito
    '/producto/:id' // Favoritos, historial
  ]
};

// Roles permitidos para rutas de empleados
export const EMPLOYEE_ROLES = [
  'superadmin',
  'admin',
  'manager',
  'gerente',
  'sales',
  'vendedor'
];
```

## Consideraciones Importantes

### 1. Hidratación en Astro
- Siempre usa `client:only="react"` para componentes con autenticación
- Incluye un pequeño delay en el useEffect para evitar problemas de hidratación
- Verifica `typeof window !== 'undefined'` antes de acceder a localStorage

### 2. Manejo de Errores
- Siempre maneja errores de parsing JSON del localStorage
- Proporciona feedback visual durante la carga
- Muestra mensajes claros de error al usuario

### 3. Seguridad
- Nunca guardes contraseñas en localStorage
- Los tokens tienen expiración de 24 horas
- Siempre valida permisos tanto en frontend como backend

### 4. Permisos Jerárquicos
- Los roles superiores tienen acceso automático a funciones de roles inferiores
- Ejemplo: un `admin` puede acceder a todo lo que puede un `valuador`
- Siempre especifica el rol mínimo requerido en `roleMiddleware`

## Troubleshooting

### "useAuth debe ser usado dentro de un AuthProvider"
- Asegúrate de encapsular correctamente los componentes
- Usa el patrón Dashboard mostrado arriba

### "Verificando autenticación..." infinito
- Verifica que `setIsLoading(false)` siempre se ejecute
- Revisa la consola para errores de parsing
- Asegúrate de que el timeout en useEffect se ejecute

### Token no se envía en peticiones
- Verifica que cada servicio configure el token en su constructor
- Revisa que el token exista en localStorage
- Confirma que `setAuthToken` se llame correctamente

### Acceso denegado con permisos correctos
- Verifica el nombre exacto del rol en la base de datos
- Revisa que el rol esté incluido en `allowedRoles`
- Confirma que el usuario tenga el campo `role` poblado

## Usuarios de Prueba

Para desarrollo, puedes usar estos usuarios:

```javascript
// Superadmin
username: 'superadmin'
password: 'superadmin123'

// Admin
username: 'admin'
password: 'admin123'

// Valuador
username: 'valuador'
password: 'valuador123'

// Vendedor
username: 'vendedor'
password: 'vendedor123'
```