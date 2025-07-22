import { Pool, PoolClient } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import config from './config';

// Configurar Pool de Conexiones
const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined,
});

// Función para inicializar la base de datos y ejecutar migraciones
/*
export async function initializeDatabase(): Promise<void> {
  let client: PoolClient | undefined;
  
  try {
    console.log('Inicializando base de datos...');
    client = await pool.connect();
    
    // Crear tabla de control de migraciones si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Leer y ejecutar scripts de migración
    const migrationsDir = path.join(__dirname, 'migrations');
    
    // Verificar si el directorio existe (especialmente importante en producción)
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Ordenar para ejecutar en secuencia
      
      for (const migrationFile of migrationFiles) {
        // Verificar si la migración ya se ejecutó
        const { rows } = await client.query(
          'SELECT id FROM migrations WHERE name = $1',
          [migrationFile]
        );
        
        if (rows.length === 0) {
          console.log(`Ejecutando migración: ${migrationFile}`);
          
          // Leer contenido del script SQL
          const filePath = path.join(migrationsDir, migrationFile);
          const sqlScript = fs.readFileSync(filePath, 'utf8');
          
          // Ejecutar script en una transacción
          await client.query('BEGIN');
          try {
            await client.query(sqlScript);
            
            // Registrar que se ejecutó la migración
            await client.query(
              'INSERT INTO migrations (name) VALUES ($1)',
              [migrationFile]
            );
            
            await client.query('COMMIT');
            console.log(`Migración ${migrationFile} ejecutada exitosamente`);
          } catch (error) {
            await client.query('ROLLBACK');
            throw error;
          }
        } else {
          console.log(`Migración ${migrationFile} ya fue ejecutada previamente`);
        }
      }
    } else {
      console.warn(`Directorio de migraciones no encontrado: ${migrationsDir}`);
    }
    
    console.log('Inicialización de base de datos completada');
  } catch (error) {
    console.error('Error inicializando la base de datos:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}
*/

// Exportar pool para ser usado en otros módulos
export { pool };

// Método simple para probar la conexión
export async function testConnection(): Promise<boolean> {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Conexión a la base de datos exitosa:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
} 