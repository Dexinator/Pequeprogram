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
      console.log('Intentando iniciar sesión con:', credentials);
      console.log('URL de la API:', this.http.getBaseUrl());

      const response = await this.http.post<AuthResponse>('/auth/login', credentials);
      console.log('Respuesta del login:', response);

      // Verificar si la respuesta fue exitosa
      if (response.success && response.token && response.user) {
        // Guardar token y datos de usuario en localStorage
        this.saveToken(response.token);
        this.saveUser(response.user);

        // Actualizar el token en el servicio HTTP
        this.http.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('Error en el servicio de autenticación (login):', error);
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
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Obtener el token del localStorage
  getToken(): string | null {
    // Verificar si estamos en un entorno de navegador
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem(this.TOKEN_KEY);
      console.log('Token obtenido de localStorage:', token ? 'Presente' : 'No encontrado');
      return token;
    }
    console.log('No se pudo obtener el token (no estamos en un navegador)');
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
        const userJson = localStorage.getItem(this.USER_KEY);
        console.log('Datos de usuario obtenidos de localStorage:', userJson ? 'Presentes' : 'No encontrados');

        if (!userJson) {
          return null;
        }

        const user = JSON.parse(userJson);
        console.log('Usuario recuperado de localStorage:', user?.username);
        return user;
      } catch (error) {
        console.error('Error al parsear datos de usuario de localStorage:', error);
        // Si hay un error al parsear, limpiar el localStorage
        localStorage.removeItem(this.USER_KEY);
        return null;
      }
    }
    console.log('No se pudo obtener el usuario (no estamos en un navegador)');
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

  // Obtener la URL base
  getBaseUrl(): string {
    return this.http.getBaseUrl();
  }
}