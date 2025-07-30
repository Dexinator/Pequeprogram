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
  corsOrigin: [
    // Producción - Apps en Vercel
    'https://valuador-entrepeques.vercel.app',
    'https://admin-entrepeques.vercel.app',
    'https://tienda-entrepeques.vercel.app',
    'https://pos-entrepeques.vercel.app',
    // Producción - Dominios finales (cuando los configures)
    'https://valuador.entrepeques.com',
    'https://admin.entrepeques.com',
    'https://tienda.entrepeques.com',
    'https://pos.entrepeques.com',
    'https://entrepeques.com',
    'https://www.entrepeques.com',
    // Desarrollo local
    'http://localhost:4321', // valuador
    'http://localhost:4322', // admin
    'http://localhost:4323', // tienda
    'http://localhost:4324'  // pos
  ],
};

// En producción con Heroku, modificar la URL de la base de datos si es necesario
if (config.nodeEnv === 'production' && config.databaseUrl.startsWith('postgres://')) {
  // Heroku proporciona la URL en formato postgres://, pero node-postgres requiere postgresql://
  config.databaseUrl = config.databaseUrl.replace('postgres://', 'postgresql://');
}

// Log para depuración
console.log('process.env.CORS_ORIGIN:', process.env.CORS_ORIGIN);
console.log('config.corsOrigin antes de procesar:', config.corsOrigin);

// Procesar CORS_ORIGIN si viene como string desde variable de entorno
if (process.env.CORS_ORIGIN) {
  if (process.env.CORS_ORIGIN.includes(',')) {
    config.corsOrigin = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  } else {
    config.corsOrigin = process.env.CORS_ORIGIN;
  }
}

console.log('config.corsOrigin después de procesar:', config.corsOrigin);

export default config; 