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
    // @ts-ignore: Ignoramos los errores de tipo aquí
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded as JwtPayload;
  } catch (error) {
    console.error('Error verificando token JWT:', error);
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