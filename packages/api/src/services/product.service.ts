import { BaseService } from './base.service';
import { Product } from '../models';
import { pool } from '../db';

export class ProductService extends BaseService<Product> {
  constructor() {
    super('products');
  }
  
  /**
   * Busca productos por categoría
   */
  async findByCategory(categoryId: number): Promise<Product[]> {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE category_id = $1 AND is_active = true 
      ORDER BY id
    `;
    
    const result = await pool.query(query, [categoryId]);
    return result.rows as Product[];
  }
  
  /**
   * Busca productos por nombre (búsqueda parcial)
   */
  async findByName(name: string): Promise<Product[]> {
    const query = "SELECT * FROM products WHERE name ILIKE $1 AND is_active = true";
    const result = await pool.query(query, [`%${name}%`]);
    return result.rows as Product[];
  }
  
  /**
   * Busca productos por marca
   */
  async findByBrand(brand: string): Promise<Product[]> {
    const query = "SELECT * FROM products WHERE brand ILIKE $1 AND is_active = true";
    const result = await pool.query(query, [`%${brand}%`]);
    return result.rows as Product[];
  }
  
  /**
   * Obtiene un producto con su información de categoría
   */
  async findByIdWithCategory(id: number): Promise<Product | null> {
    const query = `
      SELECT p.*, c.name as category_name, c.description as category_description
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1 AND p.is_active = true
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const product = result.rows[0] as Product;
    product.category = {
      id: product.category_id,
      name: result.rows[0].category_name,
      description: result.rows[0].category_description,
      is_active: true
    };
    
    return product;
  }
}

// Exportar una instancia para uso singleton
export const productService = new ProductService(); 