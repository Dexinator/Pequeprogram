import { BaseService } from './base.service';
import { Category } from '../models';
import { pool } from '../db';

export class CategoryService extends BaseService<Category> {
  constructor() {
    super('categories');
  }
  
  /**
   * Busca una categoría por su nombre
   */
  async findByName(name: string): Promise<Category | null> {
    const query = 'SELECT * FROM categories WHERE name = $1 AND is_active = true';
    const result = await pool.query(query, [name]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as Category;
  }
}

// Exportar una instancia para uso singleton
export const categoryService = new CategoryService(); 