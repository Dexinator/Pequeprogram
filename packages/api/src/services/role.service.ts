import { BaseService } from './base.service';
import { Role } from '../models';
import { pool } from '../db';

export class RoleService extends BaseService<Role> {
  constructor() {
    super('roles'); // Nombre de la tabla en la base de datos
  }
  
  /**
   * Override findAll para no usar is_active ya que roles no tiene esa columna
   */
  async findAll(): Promise<Role[]> {
    const query = `SELECT * FROM ${this.tableName} ORDER BY hierarchy_level, id`;
    const result = await pool.query(query);
    return result.rows as Role[];
  }
  
  /**
   * Override findById para no usar is_active
   */
  async findById(id: number): Promise<Role | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as Role;
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