import * as jwt from 'jsonwebtoken';
import config from '../config';

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

/**
 * Genera un token JWT con la carga útil especificada
 */
export function generateToken(payload: JwtPayload): string {
  try {
    console.log('Generando token JWT con la siguiente configuración:');
    console.log('JWT Secret:', config.jwtSecret ? `${config.jwtSecret.substring(0, 3)}...` : 'No definido');
    console.log('JWT Expires In:', config.jwtExpiresIn);
    console.log('Payload:', JSON.stringify(payload));

    if (!config.jwtSecret) {
      throw new Error('JWT_SECRET no está definido en la configuración');
    }

    // @ts-ignore: Ignoramos los errores de tipo aquí
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
    console.log('Token generado correctamente');
    return token;
  } catch (error) {
    console.error('Error generando JWT:', error);
    throw new Error('No se pudo generar el token de autenticación: ' + (error instanceof Error ? error.message : 'Error desconocido'));
  }
}

/**
 * Verifica un token JWT y devuelve la carga útil decodificada
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    console.log('🔐 verifyToken() - Iniciando verificación...');
    console.log('🔐 Token recibido:', `${token.substring(0, 50)}...`);
    console.log('🔐 JWT Secret configurado:', config.jwtSecret ? `${config.jwtSecret.substring(0, 3)}...` : 'No definido');
    
    if (!config.jwtSecret) {
      console.error('❌ JWT_SECRET no está definido en la configuración');
      return null;
    }
    
    // @ts-ignore: Ignoramos los errores de tipo aquí
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log('✅ Token verificado exitosamente');
    console.log('🔐 Payload decodificado:', decoded);
    
    return decoded as JwtPayload;
  } catch (error) {
    console.error('❌ Error verificando token JWT:', error);
    console.error('❌ Tipo de error:', error instanceof Error ? error.name : 'Unknown');
    console.error('❌ Mensaje de error:', error instanceof Error ? error.message : 'Unknown');
    
    // Información adicional para debugging
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        console.error('🕐 Token expirado - exp:', (error as any).expiredAt);
      } else if (error.name === 'JsonWebTokenError') {
        console.error('🔧 Error de formato JWT');
      } else if (error.name === 'NotBeforeError') {
        console.error('⏰ Token no válido antes de:', (error as any).date);
      }
    }
    
    return null;
  }
}

/**
 * Extrae el token JWT del encabezado de autorización
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
}