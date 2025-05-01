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
    const query = 'SELECT * FROM users WHERE username = $1 AND is_active = true';
    const result = await pool.query(query, [username]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as User;
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
   * Obtiene un usuario con su información de rol
   */
  async findByIdWithRole(id: number): Promise<User | null> {
    const query = `
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1 AND u.is_active = true
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0] as User;
    user.role = {
      id: user.role_id,
      name: result.rows[0].role_name,
      description: result.rows[0].role_description
    };
    
    return user;
  }
}

// Exportar una instancia para uso singleton
export const userService = new UserService(); 