import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from './jwt.util';

/**
 * Middleware para verificar la autenticación JWT
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Obtener el token del encabezado de autorización
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado: Token no proporcionado'
      });
    }
    
    // Verificar el token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado: Token inválido o expirado'
      });
    }
    
    // Añadir los datos del usuario decodificados al objeto request
    // para que estén disponibles en los controladores
    req.user = decoded;
    
    // Continuar con la ejecución
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación'
    });
  }
}

/**
 * Middleware para autorización basada en roles
 */
export function roleMiddleware(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // El middleware auth.middleware debe ejecutarse antes
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado: Usuario no autenticado'
        });
      }
      
      // Verificar si el rol del usuario está en los roles permitidos
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Prohibido: No tiene privilegios suficientes'
        });
      }
      
      // El usuario tiene el rol adecuado, continuar
      next();
    } catch (error) {
      console.error('Error en middleware de roles:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en la autorización'
      });
    }
  };
} 