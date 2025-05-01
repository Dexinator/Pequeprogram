import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Pool, PoolClient } from 'pg'; // Importar Pool y PoolClient

dotenv.config(); // Cargar variables de entorno desde .env

// Configurar Pool de Conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Opcional: configurar SSL para producción si es necesario (ej. Heroku)
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Verificar conexión al iniciar (opcional pero útil)
pool.connect((err: Error | undefined, client: PoolClient | undefined, release: (release?: any) => void) => {
  if (err) {
    return console.error('Error adquiriendo cliente', err.stack);
  }
  if (!client) {
    // Aunque pool.connect raramente devuelve undefined client sin error, lo manejamos.
    return console.error('Cliente no disponible después de conectar');
  }
  console.log('Conectado a la base de datos PostgreSQL');
  client.query('SELECT NOW()', (err: Error | undefined, result) => { // result tiene tipo QueryResult implícito
    release(); // Liberar cliente de vuelta al pool
    if (err) {
      return console.error('Error ejecutando query', err.stack);
    }
    console.log('Prueba de query exitosa:', result?.rows); // Usar optional chaining por si acaso
  });
});

const app = express();
const port = process.env.PORT || 5000; // Usar puerto de .env o default 5000

app.get('/', (req: Request, res: Response) => {
  res.send('¡API de Entrepeques funcionando!');
});

// Ruta de prueba para la base de datos
app.get('/db-test', async (req: Request, res: Response) => {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error conectando o consultando la base de datos');
  } finally {
    // Asegurar que el cliente se libera incluso si hay un error
    if (client) {
      client.release();
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor API escuchando en http://localhost:${port}`);
}); 