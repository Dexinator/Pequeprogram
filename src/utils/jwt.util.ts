import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Obtener la clave secreta del .env o usar una predeterminada (solo para desarrollo)
const JWT_SECRET = process.env.JWT_SECRET || 'entrepeques_development_secret';
// Tiempo de expiración: 24 horas por defecto
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

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
    // @ts-ignore: Ignoramos los errores de tipo aquí
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  } catch (error) {
    console.error('Error generando JWT:', error);
    throw new Error('No se pudo generar el token de autenticación');
  }
}

/**
 * Verifica un token JWT y devuelve la carga útil decodificada
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    // @ts-ignore: Ignoramos los errores de tipo aquí
    const decoded = jwt.verify(token, JWT_SECRET);
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