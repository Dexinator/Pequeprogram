import { pool } from '../db';
import { BaseModel } from '../models';
import { QueryResult } from 'pg';

/**
 * Servicio base genérico que proporciona operaciones CRUD básicas
 * para cualquier modelo de datos.
 */
export abstract class BaseService<T extends BaseModel> {
  protected tableName: string;
  
  constructor(tableName: string) {
    this.tableName = tableName;
  }
  
  /**
   * Obtiene todos los registros de la tabla
   */
  async findAll(): Promise<T[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE is_active = true ORDER BY id`;
    const result = await pool.query(query);
    return result.rows as T[];
  }
  
  /**
   * Obtiene un registro por su ID
   */
  async findById(id: number): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1 AND is_active = true`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as T;
  }
  
  /**
   * Crea un nuevo registro
   */
  async create(data: Partial<T>): Promise<T> {
    // Construye dinámicamente la consulta INSERT
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    
    const query = `
      INSERT INTO ${this.tableName} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] as T;
  }
  
  /**
   * Actualiza un registro existente
   */
  async update(id: number, data: Partial<T>): Promise<T | null> {
    // Construye dinámicamente la consulta UPDATE
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as T;
  }
  
  /**
   * Elimina lógicamente un registro (soft delete)
   */
  async delete(id: number): Promise<boolean> {
    const query = `
      UPDATE ${this.tableName}
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  /**
   * Elimina físicamente un registro de la base de datos
   * (usar con precaución)
   */
  async hardDelete(id: number): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
} 