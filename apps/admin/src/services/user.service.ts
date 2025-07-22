import { HttpService } from './http.service';
import type { User, Role } from './auth.service';

export interface CreateUserData {
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
  is_active?: boolean;
}

export interface UpdateUserData {
  username?: string;
  password?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role_id?: number;
  is_active?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Servicio para manejar usuarios
export class UserService {
  private http: HttpService;

  constructor() {
    this.http = new HttpService();
    
    // Si hay un token guardado, configurarlo
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
    }
  }

  // Método para asegurar que el token esté actualizado
  private ensureTokenIsSet(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) {
        this.http.setAuthToken(token);
      }
    }
  }

  // Obtener todos los usuarios
  async getUsers(): Promise<User[]> {
    try {
      // Asegurar que el token esté configurado antes de hacer la petición
      this.ensureTokenIsSet();
      
      console.log('Obteniendo usuarios desde:', this.http.getBaseUrl() + '/users');
      const response = await this.http.get<ApiResponse<User[]>>('/users');
      console.log('Respuesta de getUsers:', response);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }

  // Obtener un usuario por ID
  async getUserById(id: number): Promise<User | null> {
    try {
      this.ensureTokenIsSet();
      console.log('Obteniendo usuario con ID:', id);
      const response = await this.http.get<ApiResponse<User>>(`/users/${id}`);
      console.log('Respuesta de getUserById:', response);
      return response.data || null;
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      return null;
    }
  }

  // Crear un nuevo usuario
  async createUser(userData: CreateUserData): Promise<User | null> {
    try {
      this.ensureTokenIsSet();
      console.log('Creando usuario:', userData);
      console.log('URL de la API:', this.http.getBaseUrl());
      const response = await this.http.post<ApiResponse<User>>('/users', userData);
      console.log('Respuesta de createUser:', response);
      return response.data || null;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  // Actualizar un usuario existente
  async updateUser(id: number, userData: UpdateUserData): Promise<User | null> {
    try {
      this.ensureTokenIsSet();
      console.log('Actualizando usuario con ID:', id, userData);
      const response = await this.http.put<ApiResponse<User>>(`/users/${id}`, userData);
      console.log('Respuesta de updateUser:', response);
      return response.data || null;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // Eliminar un usuario
  async deleteUser(id: number): Promise<boolean> {
    try {
      this.ensureTokenIsSet();
      console.log('Eliminando usuario con ID:', id);
      const response = await this.http.delete<ApiResponse<void>>(`/users/${id}`);
      console.log('Respuesta de deleteUser:', response);
      return response.success;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  // Cambiar la contraseña de un usuario
  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      this.ensureTokenIsSet();
      console.log('Cambiando contraseña para usuario con ID:', id);
      const response = await this.http.post<ApiResponse<void>>(`/users/${id}/change-password`, {
        oldPassword,
        newPassword
      });
      console.log('Respuesta de changePassword:', response);
      return response.success;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }

  // Obtener todos los roles
  async getRoles(): Promise<Role[]> {
    try {
      this.ensureTokenIsSet();
      console.log('Obteniendo roles desde:', this.http.getBaseUrl() + '/roles');
      const response = await this.http.get<ApiResponse<Role[]>>('/roles');
      console.log('Respuesta de getRoles:', response);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener roles:', error);
      return [];
    }
  }
}