import { HttpService } from './http.service';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  is_active: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Servicio para manejar autenticación
export class AuthService {
  private http: HttpService;
  private readonly TOKEN_KEY = 'entrepeques_auth_token';
  private readonly USER_KEY = 'entrepeques_user';

  constructor() {
    this.http = new HttpService();
    // Inicializar el token si existe en localStorage
    const token = this.getToken();
    if (token) {
      this.http.setAuthToken(token);
    }
  }

  // Iniciar sesión
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.http.post<AuthResponse>('/auth/login', credentials);
    
    // Guardar token y datos de usuario en localStorage
    this.saveToken(response.token);
    this.saveUser(response.user);
    
    // Actualizar el token en el servicio HTTP
    this.http.setAuthToken(response.token);
    
    return response;
  }

  // Cerrar sesión
  logout(): void {
    // Limpiar datos de autenticación del localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Obtener el token del localStorage
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Guardar el token en localStorage
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Obtener datos del usuario del localStorage
  getUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  // Guardar datos del usuario en localStorage
  saveUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
} 