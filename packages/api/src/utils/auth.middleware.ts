import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from './jwt.util';

/**
 * Middleware para verificar la autenticación JWT
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('🛡️ authMiddleware - Verificando autenticación...');
    console.log('🛡️ URL solicitada:', req.method, req.path);
    console.log('🛡️ Headers de autorización:', req.headers.authorization ? 'Presente' : 'Ausente');
    
    // Obtener el token del encabezado de autorización
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    console.log('🛡️ Token extraído:', token ? `${token.substring(0, 50)}...` : 'null');
    
    if (!token) {
      console.log('❌ No se proporcionó token');
      return res.status(401).json({
        success: false,
        message: 'No autorizado: Token no proporcionado'
      });
    }
    
    console.log('🛡️ Llamando a verifyToken()...');
    // Verificar el token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.log('❌ Token inválido o expirado');
      return res.status(401).json({
        success: false,
        message: 'No autorizado: Token inválido o expirado'
      });
    }
    
    console.log('✅ Token verificado correctamente');
    console.log('🛡️ Usuario autenticado:', decoded.username, 'ID:', decoded.userId, 'Rol:', decoded.role);
    
    // Añadir los datos del usuario decodificados al objeto request
    // para que estén disponibles en los controladores
    req.user = decoded;
    
    console.log('✅ Continuando con la ejecución...');
    // Continuar con la ejecución
    next();
  } catch (error) {
    console.error('💥 Error en middleware de autenticación:', error);
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

// Alias para compatibilidad con otros módulos
export const protect = authMiddleware;
export const authorize = roleMiddleware; 