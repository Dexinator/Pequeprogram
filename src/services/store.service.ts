import { pool } from '../db';
import { PoolClient } from 'pg';

export interface PendingProductsParams {
  page: number;
  limit: number;
  location?: string;
  category_id?: number;
  subcategory_id?: number;
}

export interface OnlineProductsParams {
  page: number;
  limit: number;
  category_id?: number;
  subcategory_id?: number;
  min_price?: number;
  max_price?: number;
  search?: string;
  condition_state?: string;
  status?: string;
  location?: string;
  brand_id?: number;
  sort?: string;
  features?: Record<string, any>;
}

export interface PrepareProductData {
  weight_grams: number;
  images: string[];
  online_price: number;
  online_featured?: boolean;
}

export class StoreService {
  async getPendingProducts(params: PendingProductsParams) {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Build query with filters
      let query = `
        SELECT 
          vi.id,
          vi.category_id,
          vi.subcategory_id,
          vi.brand_id,
          vi.status,
          vi.condition_state,
          vi.features,
          vi.final_sale_price,
          vi.images,
          c.name as category_name,
          s.name as subcategory_name,
          s.sku as subcategory_sku,
          b.name as brand_name,
          i.id as inventory_id,
          i.quantity,
          i.location
        FROM valuation_items vi
        INNER JOIN inventario i ON i.valuation_item_id = vi.id
        LEFT JOIN categories c ON vi.category_id = c.id
        LEFT JOIN subcategories s ON vi.subcategory_id = s.id
        LEFT JOIN brands b ON vi.brand_id = b.id
        WHERE vi.online_store_ready = false
        AND i.quantity > 0
      `;
      
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      if (params.location) {
        query += ` AND i.location = $${paramIndex++}`;
        queryParams.push(params.location);
      }
      
      if (params.category_id) {
        query += ` AND vi.category_id = $${paramIndex++}`;
        queryParams.push(params.category_id);
      }
      
      if (params.subcategory_id) {
        query += ` AND vi.subcategory_id = $${paramIndex++}`;
        queryParams.push(params.subcategory_id);
      }
      
      // Count total
      const countQuery = `SELECT COUNT(*) as total FROM (${query}) as subquery`;
      const countResult = await dbClient.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);
      
      // Add pagination
      query += ` ORDER BY vi.id DESC`;
      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      queryParams.push(params.limit);
      queryParams.push((params.page - 1) * params.limit);
      
      const result = await dbClient.query(query, queryParams);
      
      return {
        products: result.rows.map(row => ({
          ...row,
          quantity: parseInt(row.quantity),
          final_sale_price: parseFloat(row.final_sale_price)
        })),
        total
      };
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async getOnlineProducts(params: OnlineProductsParams) {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();

      let query = `
        SELECT
          vi.id,
          vi.category_id,
          vi.subcategory_id,
          vi.brand_id,
          vi.status,
          vi.condition_state,
          vi.features,
          vi.online_price,
          vi.weight_grams,
          vi.images,
          c.name as category_name,
          s.name as subcategory_name,
          b.name as brand_name,
          i.id as inventory_id,
          i.quantity,
          i.location
        FROM valuation_items vi
        INNER JOIN inventario i ON i.valuation_item_id = vi.id
        LEFT JOIN categories c ON vi.category_id = c.id
        LEFT JOIN subcategories s ON vi.subcategory_id = s.id
        LEFT JOIN brands b ON vi.brand_id = b.id
        WHERE vi.online_store_ready = true
        AND i.quantity > 0
      `;

      const queryParams: any[] = [];
      let paramIndex = 1;

      if (params.category_id) {
        query += ` AND vi.category_id = $${paramIndex++}`;
        queryParams.push(params.category_id);
      }

      if (params.subcategory_id) {
        query += ` AND vi.subcategory_id = $${paramIndex++}`;
        queryParams.push(params.subcategory_id);
      }

      if (params.min_price !== undefined) {
        query += ` AND vi.online_price >= $${paramIndex++}`;
        queryParams.push(params.min_price);
      }

      if (params.max_price !== undefined) {
        query += ` AND vi.online_price <= $${paramIndex++}`;
        queryParams.push(params.max_price);
      }

      if (params.condition_state) {
        query += ` AND vi.condition_state = $${paramIndex++}`;
        queryParams.push(params.condition_state);
      }

      if (params.status) {
        query += ` AND vi.status = $${paramIndex++}`;
        queryParams.push(params.status);
      }

      if (params.location) {
        query += ` AND i.location = $${paramIndex++}`;
        queryParams.push(params.location);
      }

      if (params.brand_id) {
        query += ` AND vi.brand_id = $${paramIndex++}`;
        queryParams.push(params.brand_id);
      }

      if (params.search) {
        query += ` AND (
          s.name ILIKE $${paramIndex} OR
          b.name ILIKE $${paramIndex} OR
          vi.features::text ILIKE $${paramIndex}
        )`;
        queryParams.push(`%${params.search}%`);
        paramIndex++;
      }

      // Filtros dinámicos por features (JSONB)
      if (params.features && Object.keys(params.features).length > 0) {
        Object.entries(params.features).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query += ` AND vi.features->>'${key}' ILIKE $${paramIndex++}`;
            queryParams.push(`%${value}%`);
          }
        });
      }

      // Count total
      const countQuery = `SELECT COUNT(*) as total FROM (${query}) as subquery`;
      const countResult = await dbClient.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Ordenamiento
      let orderBy = 'vi.online_prepared_at DESC'; // Default: más recientes
      if (params.sort) {
        switch (params.sort) {
          case 'price_asc':
            orderBy = 'vi.online_price ASC';
            break;
          case 'price_desc':
            orderBy = 'vi.online_price DESC';
            break;
          case 'name_asc':
            orderBy = 's.name ASC, b.name ASC';
            break;
          case 'name_desc':
            orderBy = 's.name DESC, b.name DESC';
            break;
          default:
            orderBy = 'vi.online_prepared_at DESC';
        }
      }

      // Add pagination
      query += ` ORDER BY ${orderBy}`;
      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      queryParams.push(params.limit);
      queryParams.push((params.page - 1) * params.limit);

      const result = await dbClient.query(query, queryParams);

      return {
        products: result.rows.map(row => ({
          ...row,
          quantity: parseInt(row.quantity),
          online_price: parseFloat(row.online_price),
          weight_grams: parseInt(row.weight_grams)
        })),
        total
      };
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async getOnlineProductDetail(inventoryId: string) {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      const query = `
        SELECT 
          vi.id,
          vi.category_id,
          vi.subcategory_id,
          vi.brand_id,
          vi.status,
          vi.condition_state,
          vi.features,
          vi.online_price,
          vi.weight_grams,
          vi.images,
          c.name as category_name,
          s.name as subcategory_name,
          b.name as brand_name,
          i.id as inventory_id,
          i.quantity,
          i.location
        FROM inventario i
        INNER JOIN valuation_items vi ON i.valuation_item_id = vi.id
        LEFT JOIN categories c ON vi.category_id = c.id
        LEFT JOIN subcategories s ON vi.subcategory_id = s.id
        LEFT JOIN brands b ON vi.brand_id = b.id
        WHERE i.id = $1
        AND vi.online_store_ready = true
        AND i.quantity > 0
      `;
      
      const result = await dbClient.query(query, [inventoryId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        ...row,
        quantity: parseInt(row.quantity),
        online_price: parseFloat(row.online_price),
        weight_grams: parseInt(row.weight_grams || 0),
        images: row.images || []
      };
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async getRelatedProducts(productId: number, limit: number = 8) {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Primero obtener información del producto actual
      const productQuery = `
        SELECT category_id, subcategory_id, brand_id
        FROM valuation_items
        WHERE id = $1
      `;
      
      const productResult = await dbClient.query(productQuery, [productId]);
      
      if (productResult.rows.length === 0) {
        return [];
      }
      
      const { category_id, subcategory_id, brand_id } = productResult.rows[0];
      
      // Buscar productos relacionados
      // Prioridad: misma subcategoría > misma categoría > otros
      const query = `
        SELECT 
          vi.id,
          vi.category_id,
          vi.subcategory_id,
          vi.brand_id,
          vi.status,
          vi.condition_state,
          vi.features,
          vi.online_price,
          vi.weight_grams,
          vi.images,
          c.name as category_name,
          s.name as subcategory_name,
          b.name as brand_name,
          i.id as inventory_id,
          i.quantity,
          i.location,
          CASE 
            WHEN vi.subcategory_id = $2 THEN 3
            WHEN vi.category_id = $3 THEN 2
            ELSE 1
          END as relevance
        FROM inventario i
        INNER JOIN valuation_items vi ON i.valuation_item_id = vi.id
        LEFT JOIN categories c ON vi.category_id = c.id
        LEFT JOIN subcategories s ON vi.subcategory_id = s.id
        LEFT JOIN brands b ON vi.brand_id = b.id
        WHERE vi.id != $1
        AND vi.online_store_ready = true
        AND i.quantity > 0
        ORDER BY relevance, RANDOM()
        LIMIT $4
      `;
      
      const result = await dbClient.query(query, [productId, subcategory_id, category_id, limit]);
      
      return result.rows.map(row => ({
        ...row,
        quantity: parseInt(row.quantity),
        online_price: parseFloat(row.online_price),
        weight_grams: parseInt(row.weight_grams || 0),
        images: row.images || []
      }));
    } catch (error) {
      console.error('Error al obtener productos relacionados:', error);
      return [];
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async getRelatedProductsByInventoryId(inventoryId: string, limit: number = 8) {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Primero obtener información del producto actual usando inventory_id
      const productQuery = `
        SELECT vi.category_id, vi.subcategory_id, vi.brand_id, vi.id as valuation_item_id
        FROM valuation_items vi
        JOIN inventario i ON i.valuation_item_id = vi.id
        WHERE i.id = $1
      `;
      
      const productResult = await dbClient.query(productQuery, [inventoryId]);
      
      if (productResult.rows.length === 0) {
        return [];
      }
      
      const { category_id, subcategory_id, brand_id, valuation_item_id } = productResult.rows[0];
      
      // Buscar productos relacionados
      // Prioridad: misma subcategoría > misma categoría > otros
      const query = `
        SELECT 
          vi.id,
          vi.category_id,
          vi.subcategory_id,
          vi.brand_id,
          vi.status,
          vi.condition_state,
          vi.features,
          vi.online_price,
          vi.weight_grams,
          vi.images,
          c.name as category_name,
          s.name as subcategory_name,
          b.name as brand_name,
          i.id as inventory_id,
          i.quantity,
          i.location,
          CASE 
            WHEN vi.subcategory_id = $2 THEN 1
            WHEN vi.category_id = $3 THEN 2
            ELSE 3
          END as relevance
        FROM inventario i
        INNER JOIN valuation_items vi ON i.valuation_item_id = vi.id
        LEFT JOIN categories c ON vi.category_id = c.id
        LEFT JOIN subcategories s ON vi.subcategory_id = s.id
        LEFT JOIN brands b ON vi.brand_id = b.id
        WHERE vi.id != $1
        AND vi.online_store_ready = true
        AND i.quantity > 0
        ORDER BY relevance, RANDOM()
        LIMIT $4
      `;
      
      const result = await dbClient.query(query, [valuation_item_id, subcategory_id, category_id, limit]);
      
      return result.rows.map(row => ({
        ...row,
        quantity: parseInt(row.quantity),
        online_price: parseFloat(row.online_price),
        weight_grams: parseInt(row.weight_grams || 0),
        images: row.images || []
      }));
    } catch (error) {
      console.error('Error al obtener productos relacionados:', error);
      return [];
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async getProductForPreparation(inventoryId: string) {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      const query = `
        SELECT 
          vi.*,
          c.name as category_name,
          s.name as subcategory_name,
          s.sku as subcategory_sku,
          b.name as brand_name,
          i.id as inventory_id,
          i.quantity,
          i.location
        FROM inventario i
        INNER JOIN valuation_items vi ON i.valuation_item_id = vi.id
        LEFT JOIN categories c ON vi.category_id = c.id
        LEFT JOIN subcategories s ON vi.subcategory_id = s.id
        LEFT JOIN brands b ON vi.brand_id = b.id
        WHERE i.id = $1
        AND vi.online_store_ready = false
        AND i.quantity > 0
      `;
      
      const result = await dbClient.query(query, [inventoryId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        ...row,
        quantity: parseInt(row.quantity),
        final_sale_price: parseFloat(row.final_sale_price),
        suggested_online_price: Math.round(parseFloat(row.final_sale_price) * 1.1) // Suggest 10% markup
      };
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async prepareProductForStore(inventoryId: string, userId: number, data: PrepareProductData) {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Start transaction
      await dbClient.query('BEGIN');
      
      // Get valuation_item_id from inventory
      const inventoryQuery = `
        SELECT valuation_item_id 
        FROM inventario 
        WHERE id = $1
      `;
      const inventoryResult = await dbClient.query(inventoryQuery, [inventoryId]);
      
      if (inventoryResult.rows.length === 0) {
        throw new Error('Producto no encontrado en inventario');
      }
      
      const valuationItemId = inventoryResult.rows[0].valuation_item_id;
      
      // Update valuation_items
      const updateQuery = `
        UPDATE valuation_items
        SET 
          weight_grams = $1,
          images = $2,
          online_price = $3,
          online_store_ready = true,
          online_featured = $4,
          online_prepared_by = $5,
          online_prepared_at = NOW(),
          updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `;
      
      const updateResult = await dbClient.query(updateQuery, [
        data.weight_grams,
        JSON.stringify(data.images),
        data.online_price,
        data.online_featured || false,
        userId,
        valuationItemId
      ]);
      
      // Commit transaction
      await dbClient.query('COMMIT');
      
      return updateResult.rows[0];
    } catch (error) {
      if (dbClient) {
        await dbClient.query('ROLLBACK');
      }
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async getFeaturedProducts(limit: number = 8) {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      const query = `
        SELECT 
          vi.id,
          vi.category_id,
          vi.subcategory_id,
          vi.brand_id,
          vi.status,
          vi.condition_state,
          vi.features,
          vi.online_price,
          vi.weight_grams,
          vi.images,
          vi.online_featured,
          c.name as category_name,
          s.name as subcategory_name,
          b.name as brand_name,
          i.id as inventory_id,
          i.quantity,
          i.location
        FROM inventario i
        INNER JOIN valuation_items vi ON i.valuation_item_id = vi.id
        LEFT JOIN categories c ON vi.category_id = c.id
        LEFT JOIN subcategories s ON vi.subcategory_id = s.id
        LEFT JOIN brands b ON vi.brand_id = b.id
        WHERE vi.online_store_ready = true
        AND vi.online_featured = true
        AND i.quantity > 0
        ORDER BY vi.online_prepared_at DESC
        LIMIT $1
      `;
      
      const result = await dbClient.query(query, [limit]);
      
      return result.rows.map(row => ({
        ...row,
        quantity: parseInt(row.quantity),
        online_price: parseFloat(row.online_price),
        weight_grams: parseInt(row.weight_grams || 0),
        images: row.images || []
      }));
    } catch (error) {
      console.error('Error al obtener productos destacados:', error);
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async getStoreStats() {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();

      const query = `
        SELECT
          COUNT(CASE WHEN vi.online_store_ready = false AND i.quantity > 0 THEN 1 END) as pending_products,
          COUNT(CASE WHEN vi.online_store_ready = true AND i.quantity > 0 THEN 1 END) as online_products,
          COUNT(CASE WHEN vi.online_prepared_at >= CURRENT_DATE THEN 1 END) as prepared_today,
          COUNT(CASE WHEN vi.online_prepared_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as prepared_week,
          SUM(CASE WHEN vi.online_store_ready = true AND i.quantity > 0 THEN vi.online_price * i.quantity ELSE 0 END) as total_inventory_value
        FROM valuation_items vi
        LEFT JOIN inventario i ON i.valuation_item_id = vi.id
      `;

      const result = await dbClient.query(query);

      return {
        pending_products: parseInt(result.rows[0].pending_products),
        online_products: parseInt(result.rows[0].online_products),
        prepared_today: parseInt(result.rows[0].prepared_today),
        prepared_week: parseInt(result.rows[0].prepared_week),
        total_inventory_value: parseFloat(result.rows[0].total_inventory_value || 0)
      };
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async getAvailableStatuses() {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();

      const query = `
        SELECT DISTINCT vi.status, COUNT(*) as count
        FROM valuation_items vi
        INNER JOIN inventario i ON i.valuation_item_id = vi.id
        WHERE vi.online_store_ready = true
        AND i.quantity > 0
        GROUP BY vi.status
        ORDER BY count DESC, vi.status ASC
      `;

      const result = await dbClient.query(query);

      return result.rows.map(row => ({
        status: row.status,
        count: parseInt(row.count)
      }));
    } catch (error) {
      console.error('Error al obtener estados disponibles:', error);
      return [];
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }
}