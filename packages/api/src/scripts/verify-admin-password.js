// Script para verificar si el hash de la contraseña del usuario admin es compatible con bcrypt
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Configurar conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

async function verifyAdminPassword() {
  let client;
  try {
    // Obtener el hash de la contraseña del usuario admin
    client = await pool.connect();
    const result = await client.query('SELECT password_hash FROM users WHERE username = $1', ['admin']);
    
    if (result.rows.length === 0) {
      console.log('No se encontró el usuario admin en la base de datos');
      return;
    }
    
    const storedHash = result.rows[0].password_hash;
    console.log('Hash almacenado en la base de datos:', storedHash);
    
    // Verificar si el hash es compatible con bcrypt
    const isBcryptHash = storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$');
    console.log('¿El hash es compatible con bcrypt?', isBcryptHash);
    
    // Verificar si la contraseña 'admin123' coincide con el hash almacenado
    const passwordToCheck = 'admin123';
    try {
      const passwordMatch = await bcrypt.compare(passwordToCheck, storedHash);
      console.log(`¿La contraseña '${passwordToCheck}' coincide con el hash almacenado?`, passwordMatch);
    } catch (error) {
      console.error('Error al comparar la contraseña con bcrypt:', error);
      console.log('El hash almacenado no es compatible con bcrypt o está corrupto');
    }
    
    // Generar un nuevo hash para la contraseña 'admin123'
    const saltRounds = 10;
    const newHash = await bcrypt.hash(passwordToCheck, saltRounds);
    console.log('Nuevo hash generado para la contraseña admin123:', newHash);
    
    // Verificar si el nuevo hash funciona
    const newPasswordMatch = await bcrypt.compare(passwordToCheck, newHash);
    console.log('¿La contraseña coincide con el nuevo hash?', newPasswordMatch);
    
    // Actualizar la contraseña del usuario admin si es necesario
    if (!isBcryptHash || !await bcrypt.compare(passwordToCheck, storedHash)) {
      console.log('Actualizando la contraseña del usuario admin...');
      await client.query('UPDATE users SET password_hash = $1 WHERE username = $2', [newHash, 'admin']);
      console.log('Contraseña actualizada correctamente');
    } else {
      console.log('No es necesario actualizar la contraseña del usuario admin');
    }
  } catch (error) {
    console.error('Error al verificar la contraseña del usuario admin:', error);
  } finally {
    if (client) {
      client.release();
    }
    // Cerrar la conexión al pool
    await pool.end();
  }
}

// Ejecutar la función
verifyAdminPassword();
