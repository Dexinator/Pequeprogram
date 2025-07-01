import { Pool, PoolClient } from 'pg';
import {
  OtherProd,
  OtherProdItem,
  CreateOtherProdDto,
  OtherProdQueryParams,
  OtherProdStats
} from '../models/otherprods.model';
import { BaseService } from './base.service';
import { pool } from '../db';

export class OtherProdsService extends BaseService<OtherProd> {
  constructor() {
    super('otherprods');
  }

  async createPurchase(userId: number, data: CreateOtherProdDto): Promise<OtherProd> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Iniciar transacción
      await dbClient.query('BEGIN');
      
      // 1. Calcular el total de la compra
      const totalAmount = data.items.reduce((sum, item) => {
        return sum + (item.purchase_unit_price * item.quantity);
      }, 0);
      
      // 2. Crear el registro de compra principal
      const purchaseQuery = `
        INSERT INTO otherprods (user_id, supplier_name, total_amount, payment_method, location, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const purchaseResult = await dbClient.query(purchaseQuery, [
        userId,
        data.supplier_name,
        totalAmount,
        data.payment_method,
        data.location || 'Polanco',
        data.notes || null
      ]);
      
      const purchase = purchaseResult.rows[0];
      
      // 3. Crear los items de la compra y agregarlos al inventario
      const insertedItems = [];
      
      for (const item of data.items) {
        // Calcular precio total del item
        const totalPurchasePrice = item.purchase_unit_price * item.quantity;
        
        // Insertar item en otherprods_items (el SKU se genera automáticamente)
        const itemQuery = `
          INSERT INTO otherprods_items (
            otherprod_id, product_name, quantity, 
            purchase_unit_price, sale_unit_price, total_purchase_price
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;
        
        const itemResult = await dbClient.query(itemQuery, [
          purchase.id,
          item.product_name,
          item.quantity,
          item.purchase_unit_price,
          item.sale_unit_price,
          totalPurchasePrice
        ]);
        
        const insertedItem = itemResult.rows[0];
        insertedItems.push(insertedItem);
        
        // 4. Agregar al inventario general
        // Verificar si ya existe en inventario
        const checkInventoryQuery = 'SELECT * FROM inventario WHERE id = $1';
        const inventoryCheck = await dbClient.query(checkInventoryQuery, [insertedItem.sku]);
        
        if (inventoryCheck.rows.length > 0) {
          // Si ya existe, actualizar la cantidad
          const updateInventoryQuery = `
            UPDATE inventario 
            SET quantity = quantity + $1, updated_at = NOW()
            WHERE id = $2
          `;
          await dbClient.query(updateInventoryQuery, [item.quantity, insertedItem.sku]);
        } else {
          // Si no existe, crear nuevo registro
          const insertInventoryQuery = `
            INSERT INTO inventario (id, quantity, location)
            VALUES ($1, $2, $3)
          `;
          await dbClient.query(insertInventoryQuery, [
            insertedItem.sku,
            item.quantity,
            data.location || 'Polanco'
          ]);
        }
      }
      
      // Confirmar transacción
      await dbClient.query('COMMIT');
      
      // Retornar compra completa con items
      return {
        ...purchase,
        items: insertedItems
      };
      
    } catch (error) {
      // Rollback en caso de error
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

  async getPurchase(id: number): Promise<OtherProd | null> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Consultar la compra con información del usuario
      const purchaseQuery = `
        SELECT 
          o.*,
          u.first_name as user_first_name,
          u.last_name as user_last_name
        FROM otherprods o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = $1
      `;
      
      const purchaseResult = await dbClient.query(purchaseQuery, [id]);
      
      if (purchaseResult.rows.length === 0) {
        return null;
      }
      
      const purchaseRow = purchaseResult.rows[0];
      
      // Consultar los items de la compra
      const itemsQuery = `
        SELECT * FROM otherprods_items
        WHERE otherprod_id = $1
        ORDER BY created_at ASC
      `;
      
      const itemsResult = await dbClient.query(itemsQuery, [id]);
      
      const purchase: OtherProd = {
        id: purchaseRow.id,
        user_id: purchaseRow.user_id,
        supplier_name: purchaseRow.supplier_name,
        purchase_date: purchaseRow.purchase_date,
        total_amount: parseFloat(purchaseRow.total_amount),
        payment_method: purchaseRow.payment_method,
        location: purchaseRow.location,
        notes: purchaseRow.notes,
        created_at: purchaseRow.created_at,
        updated_at: purchaseRow.updated_at,
        items: itemsResult.rows.map(item => ({
          ...item,
          quantity: parseInt(item.quantity),
          purchase_unit_price: parseFloat(item.purchase_unit_price),
          sale_unit_price: parseFloat(item.sale_unit_price),
          total_purchase_price: parseFloat(item.total_purchase_price)
        })),
        user: {
          first_name: purchaseRow.user_first_name,
          last_name: purchaseRow.user_last_name
        }
      };
      
      return purchase;
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async getPurchases(params: OtherProdQueryParams): Promise<{ purchases: OtherProd[]; total: number }> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Construir la consulta con filtros opcionales
      let query = `
        SELECT 
          o.*,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          COALESCE(item_count.total_items, 0) as items_count,
          COALESCE(item_count.total_quantity, 0) as total_quantity
        FROM otherprods o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN (
          SELECT otherprod_id, COUNT(*) as total_items, SUM(quantity) as total_quantity
          FROM otherprods_items
          GROUP BY otherprod_id
        ) item_count ON o.id = item_count.otherprod_id
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      if (params.supplier_name) {
        query += ` AND o.supplier_name ILIKE $${paramIndex++}`;
        queryParams.push(`%${params.supplier_name}%`);
      }
      
      if (params.location) {
        query += ` AND o.location = $${paramIndex++}`;
        queryParams.push(params.location);
      }
      
      if (params.start_date) {
        query += ` AND o.purchase_date >= $${paramIndex++}`;
        queryParams.push(params.start_date);
      }
      
      if (params.end_date) {
        query += ` AND o.purchase_date <= $${paramIndex++}`;
        queryParams.push(params.end_date);
      }
      
      // Obtener el total de resultados
      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
      const countResult = await dbClient.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);
      
      // Aplicar paginación
      const page = params.page && params.page > 0 ? params.page : 1;
      const limit = params.limit && params.limit > 0 ? params.limit : 20;
      const offset = (page - 1) * limit;
      
      query += ` ORDER BY o.purchase_date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      queryParams.push(limit, offset);
      
      const result = await dbClient.query(query, queryParams);
      
      // Formatear los resultados
      const purchases = result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        supplier_name: row.supplier_name,
        purchase_date: row.purchase_date,
        total_amount: parseFloat(row.total_amount),
        payment_method: row.payment_method,
        location: row.location,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user: {
          first_name: row.user_first_name,
          last_name: row.user_last_name
        },
        items_count: parseInt(row.items_count),
        total_quantity: parseInt(row.total_quantity)
      }));
      
      return {
        purchases,
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

  async getStats(): Promise<OtherProdStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    
    // Total general
    const totalQuery = `
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as total,
        COALESCE(SUM(item_count.total_items), 0) as total_items
      FROM otherprods o
      LEFT JOIN (
        SELECT otherprod_id, COUNT(*) as total_items
        FROM otherprods_items
        GROUP BY otherprod_id
      ) item_count ON o.id = item_count.otherprod_id
    `;
    
    // Compras de hoy
    const todayQuery = `
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as total
      FROM otherprods
      WHERE purchase_date >= $1
    `;
    
    // Compras de la semana
    const weekQuery = `
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as total
      FROM otherprods
      WHERE purchase_date >= $1
    `;
    
    // Top productos más comprados
    const topProductsQuery = `
      SELECT 
        oi.product_name,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.quantity * oi.sale_unit_price) as total_revenue
      FROM otherprods_items oi
      GROUP BY oi.product_name
      ORDER BY total_quantity DESC
      LIMIT 5
    `;
    
    const [totalResult, todayResult, weekResult, topProductsResult] = await Promise.all([
      pool.query(totalQuery),
      pool.query(todayQuery, [today]),
      pool.query(weekQuery, [weekAgo]),
      pool.query(topProductsQuery)
    ]);
    
    return {
      total_purchases: parseInt(totalResult.rows[0].count),
      total_amount: parseFloat(totalResult.rows[0].total),
      total_items: parseInt(totalResult.rows[0].total_items),
      purchases_today: parseInt(todayResult.rows[0].count),
      amount_today: parseFloat(todayResult.rows[0].total),
      purchases_week: parseInt(weekResult.rows[0].count),
      amount_week: parseFloat(weekResult.rows[0].total),
      top_products: topProductsResult.rows.map(row => ({
        product_name: row.product_name,
        total_quantity: parseInt(row.total_quantity),
        total_revenue: parseFloat(row.total_revenue)
      }))
    };
  }
}