import bcrypt from 'bcrypt';
import { User } from '../models';
import { userService } from './user.service';
import { generateToken, JwtPayload } from '../utils/jwt.util';

export interface LoginResult {
  success: boolean;
  message: string;
  token?: string;
  user?: Partial<User>;
}

export interface RegisterResult {
  success: boolean;
  message: string;
  user?: Partial<User>;
}

export class AuthService {
  /**
   * Registra un nuevo usuario en el sistema
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role_id: number;
  }): Promise<RegisterResult> {
    try {
      // Verificar si el nombre de usuario ya existe
      const existingUsername = await userService.findByUsername(userData.username);
      if (existingUsername) {
        return { 
          success: false, 
          message: 'El nombre de usuario ya está en uso' 
        };
      }
      
      // Verificar si el email ya existe
      const existingEmail = await userService.findByEmail(userData.email);
      if (existingEmail) {
        return { 
          success: false, 
          message: 'El correo electrónico ya está registrado' 
        };
      }
      
      // Hashear la contraseña
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);
      
      // Crear el nuevo usuario
      const newUser = await userService.create({
        ...userData,
        password_hash: passwordHash,
        is_active: true
      });
      
      // Eliminar datos sensibles antes de devolver
      const { password_hash, ...userWithoutPassword } = newUser;
      
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return {
        success: false,
        message: 'Error al registrar usuario. Por favor, inténtelo de nuevo.'
      };
    }
  }
  
  /**
   * Autentica un usuario y genera un token JWT si es válido
   */
  async login(username: string, password: string): Promise<LoginResult> {
    try {
      // Buscar usuario por nombre de usuario
      const user = await userService.findByUsername(username);
      
      if (!user) {
        return { 
          success: false, 
          message: 'Nombre de usuario o contraseña incorrectos' 
        };
      }
      
      // Verificar contraseña
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordMatch) {
        return { 
          success: false, 
          message: 'Nombre de usuario o contraseña incorrectos' 
        };
      }
      
      // Obtener el rol del usuario
      const userWithRole = await userService.findByIdWithRole(user.id);
      if (!userWithRole || !userWithRole.role) {
        return { 
          success: false, 
          message: 'Error al obtener información del usuario' 
        };
      }
      
      // Generar token JWT
      const payload: JwtPayload = {
        userId: user.id,
        username: user.username,
        role: userWithRole.role.name
      };
      
      const token = generateToken(payload);
      
      // Eliminar datos sensibles antes de devolver
      const { password_hash, ...userWithoutPassword } = user;
      
      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          ...userWithoutPassword,
          role: userWithRole.role
        }
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error al iniciar sesión. Por favor, inténtelo de nuevo.'
      };
    }
  }
}

// Exportar una instancia para uso singleton
export const authService = new AuthService(); 