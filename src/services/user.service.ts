import { BaseService } from './base.service';
import { User } from '../models';
import { pool } from '../db';

export class UserService extends BaseService<User> {
  constructor() {
    super('users');
  }

  /**
   * Busca un usuario por su nombre de usuario
   */
  async findByUsername(username: string): Promise<User | null> {
    try {
      console.log(`Buscando usuario por nombre de usuario: ${username}`);
      const query = 'SELECT * FROM users WHERE username = $1 AND is_active = true';
      console.log(`Ejecutando consulta: ${query}`);

      const result = await pool.query(query, [username]);
      console.log(`Resultado de la consulta: ${result.rows.length} filas encontradas`);

      if (result.rows.length === 0) {
        console.log(`No se encontró ningún usuario con el nombre de usuario: ${username}`);
        return null;
      }

      console.log(`Usuario encontrado: ${JSON.stringify({
        id: result.rows[0].id,
        username: result.rows[0].username,
        role_id: result.rows[0].role_id
      })}`);

      return result.rows[0] as User;
    } catch (error) {
      console.error(`Error al buscar usuario por nombre de usuario: ${username}`, error);
      throw error;
    }
  }

  /**
   * Busca un usuario por su email
   */
  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as User;
  }

  /**
   * Actualiza la contraseña de un usuario
   */
  async updatePassword(id: number, newPasswordHash: string): Promise<boolean> {
    try {
      console.log(`Actualizando contraseña para usuario ID: ${id}`);
      const query = `
        UPDATE users
        SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;

      const result = await pool.query(query, [newPasswordHash, id]);
      const success = result.rowCount !== null && result.rowCount > 0;

      console.log(`Resultado de actualización de contraseña: ${success ? 'Exitoso' : 'Fallido'}`);
      return success;
    } catch (error) {
      console.error(`Error al actualizar contraseña para usuario ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario con su información de rol
   */
  async findByIdWithRole(id: number): Promise<User | null> {
    try {
      console.log(`Buscando usuario con rol por ID: ${id}`);
      const query = `
        SELECT u.*, r.name as role_name, r.description as role_description
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1 AND u.is_active = true
      `;
      console.log(`Ejecutando consulta: ${query.replace(/\s+/g, ' ').trim()}`);

      const result = await pool.query(query, [id]);
      console.log(`Resultado de la consulta: ${result.rows.length} filas encontradas`);

      if (result.rows.length === 0) {
        console.log(`No se encontró ningún usuario con el ID: ${id}`);
        return null;
      }

      console.log(`Datos del usuario encontrado: ${JSON.stringify({
        id: result.rows[0].id,
        username: result.rows[0].username,
        role_id: result.rows[0].role_id,
        role_name: result.rows[0].role_name,
        role_description: result.rows[0].role_description
      })}`);

      const user = result.rows[0] as User;

      // Verificar si los campos del rol están presentes
      if (!result.rows[0].role_name) {
        console.error(`El campo role_name no está presente en el resultado de la consulta para el usuario ID: ${id}`);
        console.log(`Resultado completo: ${JSON.stringify(result.rows[0])}`);
        throw new Error(`El campo role_name no está presente en el resultado de la consulta`);
      }

      user.role = {
        id: user.role_id,
        name: result.rows[0].role_name,
        description: result.rows[0].role_description
      };

      console.log(`Usuario con rol: ${JSON.stringify({
        id: user.id,
        username: user.username,
        role: user.role
      })}`);

      return user;
    } catch (error) {
      console.error(`Error al buscar usuario con rol por ID: ${id}`, error);
      throw error;
    }
  }
}

// Exportar una instancia para uso singleton
export const userService = new UserService();