import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  /**
   * Registra un nuevo usuario
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Recibida solicitud de registro:', {
        body: req.body,
        headers: {
          'content-type': req.headers['content-type'],
          'user-agent': req.headers['user-agent']
        }
      });

      const { username, email, password, first_name, last_name, role_id } = req.body;

      // Validar datos requeridos
      if (!username || !email || !password || !first_name || !last_name || !role_id) {
        console.log('Faltan datos requeridos para el registro:', {
          username: !!username,
          email: !!email,
          password: !!password,
          first_name: !!first_name,
          last_name: !!last_name,
          role_id: !!role_id
        });

        res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos para el registro'
        });
        return;
      }

      // Registrar el usuario usando el servicio de autenticación
      console.log('Enviando datos para registro de usuario:', {
        username,
        email,
        password: password ? '********' : null,
        first_name,
        last_name,
        role_id
      });

      try {
        const result = await authService.register({
          username,
          email,
          password,
          first_name,
          last_name,
          role_id
        });

        console.log('Resultado del registro:', {
          success: result.success,
          message: result.message,
          hasUser: !!result.user
        });

        if (result.success) {
          res.status(201).json(result);
        } else {
          res.status(400).json(result);
        }
      } catch (registerError) {
        console.error('Error específico en el registro:', registerError);
        res.status(500).json({
          success: false,
          message: 'Error en el proceso de registro',
          error: registerError instanceof Error ? registerError.message : 'Error desconocido'
        });
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
      console.log('Recibida solicitud de login:', {
        body: req.body,
        headers: {
          'content-type': req.headers['content-type'],
          'user-agent': req.headers['user-agent']
        }
      });

      const { username, password } = req.body;

      // Validar datos requeridos
      if (!username || !password) {
        console.log('Faltan datos requeridos para el login:', { username: !!username, password: !!password });
        res.status(400).json({
          success: false,
          message: 'Se requieren nombre de usuario y contraseña'
        });
        return;
      }

      console.log(`Intentando autenticar al usuario: ${username}`);

      // Intentar autenticar al usuario
      try {
        const result = await authService.login(username, password);

        console.log(`Resultado de autenticación para ${username}:`, {
          success: result.success,
          message: result.message,
          hasToken: !!result.token,
          hasUser: !!result.user
        });

        if (result.success) {
          res.status(200).json(result);
        } else {
          res.status(401).json(result);
        }
      } catch (authError) {
        console.error(`Error específico en la autenticación para ${username}:`, authError);
        res.status(500).json({
          success: false,
          message: 'Error en el proceso de autenticación',
          error: authError instanceof Error ? authError.message : 'Error desconocido'
        });
      }
    } catch (error) {
      console.error('Error general en controller de login:', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar la solicitud de inicio de sesión',
        error: error instanceof Error ? error.message : 'Error desconocido'
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