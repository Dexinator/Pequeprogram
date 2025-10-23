import dotenv from 'dotenv';

// Cargar variables de entorno desde .env en desarrollo
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string | string[] | RegExp | boolean | ((origin: any, callback: any) => void);
}

// Lista base de orígenes permitidos
const baseOrigins = [
  // Producción - Apps en Vercel (pequeprogram)
  'https://pequeprogram-valuador.vercel.app',
  'https://pequeprogram-admin.vercel.app',
  'https://pequeprogram-tienda.vercel.app',
  'https://pequeprogram-pos.vercel.app',
  // Producción - Apps en Vercel (entrepeques - legacy)
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
  // Producción - Dominios .mx
  'https://entrepeques.mx',
  'https://www.entrepeques.mx',
  // Desarrollo local
  'http://localhost:4321', // valuador
  'http://localhost:4322', // admin
  'http://localhost:4323', // tienda
  'http://localhost:4324', // pos
  'http://127.0.0.1:4321',
  'http://127.0.0.1:4322',
  'http://127.0.0.1:4323',
  'http://127.0.0.1:4324'
];

// Configuración por defecto
const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/entrepeques_dev',
  jwtSecret: process.env.JWT_SECRET || 'entrepeques_development_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  corsOrigin: baseOrigins,
};

// En producción con Heroku, modificar la URL de la base de datos si es necesario
if (config.nodeEnv === 'production' && config.databaseUrl.startsWith('postgres://')) {
  // Heroku proporciona la URL en formato postgres://, pero node-postgres requiere postgresql://
  config.databaseUrl = config.databaseUrl.replace('postgres://', 'postgresql://');
}

// Procesar CORS_ORIGIN si viene desde variable de entorno
// Si se proporciona CORS_ORIGIN, agregarlo a la lista base en lugar de reemplazarla
let allOrigins = [...baseOrigins];
if (process.env.CORS_ORIGIN) {
  const additionalOrigins = process.env.CORS_ORIGIN.includes(',')
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : [process.env.CORS_ORIGIN];

  // Combinar orígenes base con adicionales, eliminando duplicados
  allOrigins = [...new Set([...baseOrigins, ...additionalOrigins])];
}

// Función para validar origen dinámicamente
config.corsOrigin = function(origin: any, callback: any) {
  // Permitir requests sin origen (Postman, curl, etc.)
  if (!origin) return callback(null, true);

  // Lista de orígenes permitidos (incluye los de las variables de entorno si existen)
  const allowedOrigins = allOrigins;
  
  // En desarrollo, permitir cualquier localhost
  if (config.nodeEnv === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    return callback(null, true);
  }
  
  // Permitir orígenes de Vercel (pequeprogram-*.vercel.app)
  if (origin.includes('pequeprogram') && origin.includes('vercel.app')) {
    return callback(null, true);
  }
  
  // Verificar si el origen está en la lista permitida
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  
  // Log para debug
  console.log('CORS: Origen no permitido:', origin);
  callback(new Error('Not allowed by CORS'));
};

// Log para depuración
console.log('Configuración CORS:', {
  nodeEnv: config.nodeEnv,
  corsOriginType: typeof config.corsOrigin,
  corsOriginValue: typeof config.corsOrigin === 'function' ? 'dynamic function' : config.corsOrigin
});

export default config; 