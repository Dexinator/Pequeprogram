import { HttpService } from './http.service';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: number;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
  is_active: boolean;
  role?: Role;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// Servicio para manejar autenticación
export class AuthService {
  private http: HttpService;
  private readonly TOKEN_KEY = 'entrepeques_auth_token';
  private readonly USER_KEY = 'entrepeques_user';

  constructor() {
    this.http = new HttpService();

    // Verificar si estamos en un entorno de navegador
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // Inicializar el token si existe en localStorage
      const token = this.getToken();
      if (token) {
        this.http.setAuthToken(token);
      }
    }
  }

  // Iniciar sesión
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 AuthService.login() - Iniciando...');
      console.log('🔐 Credenciales:', credentials);
      console.log('🔐 URL de la API:', this.http.getBaseUrl());

      const response = await this.http.post<AuthResponse>('/auth/login', credentials);
      console.log('🔐 Respuesta completa del login:', response);
      console.log('🔐 response.success:', response.success);
      console.log('🔐 response.token:', response.token ? 'PRESENTE' : 'AUSENTE');
      console.log('🔐 response.user:', response.user ? response.user.username : 'AUSENTE');

      // Verificar si la respuesta fue exitosa
      if (response.success && response.token && response.user) {
        console.log('🔐 Respuesta válida, guardando token y usuario...');
        console.log('🔐 ANTES de saveToken - window:', typeof window);
        console.log('🔐 ANTES de saveToken - localStorage:', typeof localStorage);
        console.log('🔐 ANTES de saveToken - token length:', response.token?.length);

        // Guardar token y datos de usuario en localStorage
        console.log('🔐 LLAMANDO a this.saveToken()...');
        this.saveToken(response.token);
        console.log('🔐 DESPUÉS de this.saveToken()');

        console.log('🔐 LLAMANDO a this.saveUser()...');
        this.saveUser(response.user);
        console.log('🔐 DESPUÉS de this.saveUser()');


        // Verificar que se guardaron correctamente
        const savedToken = this.getToken();
        const savedUser = this.getUser();
        console.log('🔐 Token guardado:', savedToken ? 'SÍ' : 'NO');
        console.log('🔐 Usuario guardado:', savedUser ? savedUser.username : 'NO');

        // Actualizar el token en el servicio HTTP
        this.http.setAuthToken(response.token);
      } else {
        console.error('🔐 Respuesta inválida del servidor:', {
          success: response.success,
          hasToken: !!response.token,
          hasUser: !!response.user
        });
      }

      return response;
    } catch (error) {
      console.error('🔐 Error en el servicio de autenticación (login):', error);
      throw error;
    }
  }

  // Registrar un nuevo usuario
  async register(userData: RegisterCredentials): Promise<AuthResponse> {
    try {
      console.log('Intentando registrar usuario:', userData);
      console.log('URL de la API:', this.http.getBaseUrl());

      const response = await this.http.post<AuthResponse>('/auth/register', userData);
      console.log('Respuesta del registro:', response);

      return response;
    } catch (error) {
      console.error('Error en el servicio de autenticación (register):', error);
      throw error;
    }
  }

  // Cerrar sesión
  logout(): void {
    // Verificar si estamos en un entorno de navegador
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // Limpiar datos de autenticación del localStorage
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      
      // Limpiar el token del servicio HTTP
      this.http.clearAuthToken();
    }
  }

  // Verificar si el usuario está autenticado (token presente y NO expirado)
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Revisa la fecha de expiración dentro del JWT.
   * Sin esto, un token vencido seguía "iniciando sesión": el admin de citas
   * mostraba la pantalla y todas las llamadas al API fallaban con 401, dando la
   * impresión de estar logueado cuando en realidad la sesión ya había caducado.
   * Ante cualquier token ilegible se asume expirado (mejor pedir login de más).
   * (Mismo fix que en el POS, commit c2e3feb.)
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload?.exp) return false; // sin exp: lo dejamos pasar, el API decidirá
      // exp viene en segundos; se descuentan 10s de margen por desfase de reloj
      return payload.exp * 1000 <= Date.now() + 10000;
    } catch {
      return true;
    }
  }

  // Obtener el token del localStorage
  getToken(): string | null {
    // Verificar si estamos en un entorno de navegador
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      console.log('🔍 AuthService.getToken() - Obteniendo token de localStorage...');
      const token = localStorage.getItem(this.TOKEN_KEY);
      console.log('🔍 Token raw de localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
      return token;
    }
    console.log('❌ No se pudo obtener el token (no estamos en un navegador)');
    return null;
  }

  // Guardar el token en localStorage
  saveToken(token: string): void {
    // Verificar si estamos en un entorno de navegador
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      console.log('Guardando token en localStorage');
      localStorage.setItem(this.TOKEN_KEY, token);

      // Verificar que se haya guardado correctamente
      const savedToken = localStorage.getItem(this.TOKEN_KEY);
      if (savedToken) {
        console.log('Token guardado correctamente en localStorage');
      } else {
        console.warn('No se pudo guardar el token en localStorage');
      }
    } else {
      console.warn('No se pudo guardar el token (no estamos en un navegador)');
    }
  }

  // Obtener datos del usuario del localStorage
  getUser(): User | null {
    // Verificar si estamos en un entorno de navegador
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        console.log('🔍 AuthService.getUser() - Obteniendo datos de localStorage...');
        const userJson = localStorage.getItem(this.USER_KEY);
        console.log('🔍 Raw user JSON from localStorage:', userJson);

        if (!userJson) {
          console.log('❌ No se encontraron datos de usuario en localStorage');
          return null;
        }

        console.log('🔍 Parseando JSON de usuario...');
        const user = JSON.parse(userJson);
        console.log('✅ Usuario parseado exitosamente:', {
          id: user?.id,
          username: user?.username,
          email: user?.email
        });
        return user;
      } catch (error) {
        console.error('💥 Error al parsear datos de usuario de localStorage:', error);
        // Si hay un error al parsear, limpiar el localStorage
        localStorage.removeItem(this.USER_KEY);
        return null;
      }
    }
    console.log('❌ No se pudo obtener el usuario (no estamos en un navegador)');
    return null;
  }

  // Guardar datos del usuario en localStorage
  saveUser(user: User): void {
    // Verificar si estamos en un entorno de navegador
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        console.log('Guardando datos de usuario en localStorage:', user?.username);
        const userJson = JSON.stringify(user);
        localStorage.setItem(this.USER_KEY, userJson);

        // Verificar que se haya guardado correctamente
        const savedUserJson = localStorage.getItem(this.USER_KEY);
        if (savedUserJson) {
          console.log('Datos de usuario guardados correctamente en localStorage');
        } else {
          console.warn('No se pudieron guardar los datos de usuario en localStorage');
        }
      } catch (error) {
        console.error('Error al guardar datos de usuario en localStorage:', error);
      }
    } else {
      console.warn('No se pudieron guardar los datos de usuario (no estamos en un navegador)');
    }
  }

  // Verificar si el usuario tiene permisos de administrador
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role?.name === 'admin' || user?.role?.name === 'manager';
  }

  // Verificar si el usuario es un empleado (cualquier rol excepto cliente)
  isEmployee(): boolean {
    const user = this.getUser();
    return user?.role?.name !== 'customer' && user?.role?.name !== undefined;
  }

  // Verificar si el usuario es un cliente
  isCustomer(): boolean {
    const user = this.getUser();
    return user?.role?.name === 'customer';
  }

  // Obtener la URL base
  getBaseUrl(): string {
    return this.http.getBaseUrl();
  }
}