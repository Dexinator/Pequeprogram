import { pool } from '../db';

async function checkRolesTable() {
  try {
    console.log('Verificando tabla de roles...');
    
    // Verificar si la tabla roles existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'roles'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log(`¿La tabla roles existe? ${tableExists}`);
    
    if (!tableExists) {
      console.log('Creando tabla de roles...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS roles (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Tabla de roles creada correctamente');
    }
    
    // Verificar si hay roles en la tabla
    const rolesCount = await pool.query('SELECT COUNT(*) FROM roles');
    console.log(`Número de roles en la tabla: ${rolesCount.rows[0].count}`);
    
    if (parseInt(rolesCount.rows[0].count) === 0) {
      console.log('Insertando roles por defecto...');
      await pool.query(`
        INSERT INTO roles (name, description) 
        VALUES 
          ('admin', 'Administrador con acceso completo al sistema'),
          ('manager', 'Gerente con acceso a la mayoría de las funciones'),
          ('valuator', 'Usuario que puede valorar artículos'),
          ('sales', 'Usuario de ventas')
        ON CONFLICT (name) DO NOTHING;
      `);
      console.log('Roles por defecto insertados correctamente');
    }
    
    // Listar todos los roles
    const roles = await pool.query('SELECT * FROM roles');
    console.log('Roles disponibles:');
    console.table(roles.rows);
    
    // Verificar si el usuario admin existe y tiene un rol asignado
    const adminUser = await pool.query(`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.username = 'admin'
    `);
    
    if (adminUser.rows.length === 0) {
      console.log('El usuario admin no existe');
    } else {
      console.log('Información del usuario admin:');
      console.log({
        id: adminUser.rows[0].id,
        username: adminUser.rows[0].username,
        role_id: adminUser.rows[0].role_id,
        role_name: adminUser.rows[0].role_name
      });
      
      // Si el usuario admin existe pero no tiene un rol asignado, asignarle el rol de admin
      if (!adminUser.rows[0].role_id) {
        const adminRoleId = roles.rows.find(role => role.name === 'admin')?.id;
        
        if (adminRoleId) {
          console.log(`Asignando rol de admin (ID: ${adminRoleId}) al usuario admin`);
          await pool.query(`
            UPDATE users 
            SET role_id = $1 
            WHERE username = 'admin'
          `, [adminRoleId]);
          console.log('Rol asignado correctamente');
        } else {
          console.log('No se encontró el rol de admin');
        }
      }
    }
    
    console.log('Verificación de roles completada');
  } catch (error) {
    console.error('Error al verificar la tabla de roles:', error);
  } finally {
    // Cerrar la conexión al pool
    await pool.end();
  }
}

// Ejecutar la función
checkRolesTable();
