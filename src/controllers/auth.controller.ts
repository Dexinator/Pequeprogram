import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  /**
   * Registra un nuevo usuario
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, password, first_name, last_name, role_id } = req.body;
      
      // Validar datos requeridos
      if (!username || !email || !password || !first_name || !last_name || !role_id) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos para el registro'
        });
        return;
      }
      
      // Registrar el usuario usando el servicio de autenticación
      const result = await authService.register({
        username,
        email,
        password,
        first_name,
        last_name,
        role_id
      });
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error en controller de registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar la solicitud de registro'
      });
    }
  }
  
  /**
   * Autentica un usuario existente
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;
      
      // Validar datos requeridos
      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'Se requieren nombre de usuario y contraseña'
        });
        return;
      }
      
      // Intentar autenticar al usuario
      const result = await authService.login(username, password);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Error en controller de login:', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar la solicitud de inicio de sesión'
      });
    }
  }
  
  /**
   * Obtiene información del usuario actual (protegido por middleware de autenticación)
   */
  getCurrentUser = (req: Request, res: Response): void => {
    try {
      // El middleware de autenticación ya verificó el token y añadió req.user
      res.status(200).json({
        success: true,
        user: req.user
      });
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener información del usuario'
      });
    }
  }
}

// Exportar una instancia del controlador para uso singleton
export const authController = new AuthController(); 