# Sistema de Autenticación y Login - Entrepeques

## Resumen General

El sistema de autenticación de Entrepeques utiliza JWT (JSON Web Tokens) para manejar la autenticación de usuarios en todas las aplicaciones del proyecto. Este documento detalla la implementación correcta del sistema de login para garantizar su funcionamiento en cualquier aplicación del monorepo.

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

### 3. Contexto de Autenticación (`AuthContext.tsx`)

```typescript
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
    // Pequeño retraso para asegurar hidratación
    const timeoutId = setTimeout(() => {
      checkAuth();
    }, 100);
    
    return () => clearTimeout(timeoutId);
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

### 5. Componente Dashboard Principal

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

Cuando crees servicios que necesiten autenticación, asegúrate de configurar el token:

```typescript
export class TuServicio {
  private http: HttpService;

  constructor() {
    this.http = new HttpService();
    
    // Configurar token si existe
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
    }
  }

  // Tus métodos...
}
```

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