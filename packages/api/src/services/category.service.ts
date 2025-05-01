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
  
  /**
   * Obtiene categorías de nivel superior (sin padre)
   */
  async findRootCategories(): Promise<Category[]> {
    const query = 'SELECT * FROM categories WHERE parent_id IS NULL AND is_active = true';
    const result = await pool.query(query);
    return result.rows as Category[];
  }
  
  /**
   * Obtiene subcategorías de una categoría
   */
  async findSubcategories(parentId: number): Promise<Category[]> {
    const query = 'SELECT * FROM categories WHERE parent_id = $1 AND is_active = true';
    const result = await pool.query(query, [parentId]);
    return result.rows as Category[];
  }
  
  /**
   * Obtiene una categoría con sus subcategorías
   */
  async findByIdWithSubcategories(id: number): Promise<Category | null> {
    // Obtener la categoría
    const category = await this.findById(id);
    if (!category) {
      return null;
    }
    
    // Obtener subcategorías
    category.subcategories = await this.findSubcategories(id);
    
    return category;
  }
}

// Exportar una instancia para uso singleton
export const categoryService = new CategoryService(); 