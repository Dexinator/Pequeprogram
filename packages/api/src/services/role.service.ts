import { BaseService } from './base.service';
import { Role } from '../models';
import { pool } from '../db';

export class RoleService extends BaseService<Role> {
  constructor() {
    super('roles'); // Nombre de la tabla en la base de datos
  }
  
  /**
   * Busca un rol por su nombre
   */
  async findByName(name: string): Promise<Role | null> {
    const query = 'SELECT * FROM roles WHERE name = $1';
    const result = await pool.query(query, [name]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as Role;
  }
}

// Exportar una instancia para uso singleton
export const roleService = new RoleService(); 