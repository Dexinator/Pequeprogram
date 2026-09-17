import express, { Request, Response, NextFunction } from 'express';
// @ts-ignore
import cors from 'cors';
import { pool, testConnection } from './db';
import apiRoutes from './routes';
import config from './config';

const app = express();
const port = config.port;

// Log para depuración de CORS
console.log('CORS configurado con orígenes:', config.corsOrigin);

// Configuración de CORS
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-idempotency-key', 'Cache-Control', 'Pragma', 'Expires'],
  credentials: true
}));

// Middleware para imprimir información de las solicitudes (solo en desarrollo)
if (config.nodeEnv === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Body:', req.body);
    }
    next();
  });
}

// Middleware para parsear JSON
app.use(express.json());

// Rutas básicas
app.get('/', (req: Request, res: Response) => {
  res.send('¡API de Entrepeques funcionando!');
});

// Ruta de prueba para la base de datos
app.get('/db-test', async (req: Request, res: Response) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error conectando o consultando la base de datos');
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Montar las rutas de la API bajo /api
app.use('/api', apiRoutes);

// Middleware para manejar rutas no encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware para manejo centralizado de errores.
// Los controllers usan el patrón `res.status(400); throw new Error('...')`
// (express-async-handler). Antes este handler ignoraba ese status y respondía
// SIEMPRE 500 "Error interno del servidor", así que un teléfono duplicado o un
// campo faltante se veían en el POS como error interno sin explicación.
// Ahora: si el controller ya fijó un 4xx, se respeta y se devuelve su mensaje.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const isClientError = res.statusCode >= 400 && res.statusCode < 500;
  const status = isClientError ? res.statusCode : 500;

  if (isClientError) {
    console.warn(`Error ${status} en ${req.method} ${req.originalUrl}:`, err.message);
  } else {
    console.error('Error no controlado:', err);
  }

  res.status(status).json({
    success: false,
    message: isClientError ? err.message : 'Error interno del servidor',
    error: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// Iniciar el servidor
async function startServer() {
  try {
    // Verificar conexión a la BD
    const connected = await testConnection();
    if (!connected) {
      console.error('No se pudo conectar a la base de datos. Verificar configuración.');
      process.exit(1);
    }

    /*
    // Inicializar base de datos y ejecutar migraciones
    await initializeDatabase();
    */

    // Iniciar servidor Express
    app.listen(port, () => {
      console.log(`Entorno: ${config.nodeEnv}`);
      console.log(`Servidor API escuchando en http://localhost:${port}`);
      console.log(`Rutas de autenticación disponibles en http://localhost:${port}/api/auth`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar la aplicación
startServer();