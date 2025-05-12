import dotenv from 'dotenv';

// Cargar variables de entorno desde .env en desarrollo
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string | string[] | RegExp;
}

// Configuración por defecto
const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/entrepeques_dev',
  jwtSecret: process.env.JWT_SECRET || 'entrepeques_development_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  corsOrigin: process.env.CORS_ORIGIN || ['https://valuador-entrepeques.vercel.app', 'http://localhost:4321'],
};

// En producción con Heroku, modificar la URL de la base de datos si es necesario
if (config.nodeEnv === 'production' && config.databaseUrl.startsWith('postgres://')) {
  // Heroku proporciona la URL en formato postgres://, pero node-postgres requiere postgresql://
  config.databaseUrl = config.databaseUrl.replace('postgres://', 'postgresql://');
}

// Procesar CORS_ORIGIN si viene como string separado por comas
if (typeof config.corsOrigin === 'string' && config.corsOrigin.includes(',')) {
  config.corsOrigin = config.corsOrigin.split(',').map(origin => origin.trim());
}

export default config; 