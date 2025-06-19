import { Pool, PoolClient } from 'pg';
import {
  Sale,
  SaleItem,
  PaymentDetail,
  CreateSaleDto,
  SaleQueryParams,
  InventorySearchParams,
  InventoryItem,
} from '../models/sales.model';
import { BaseService } from './base.service';
import { pool } from '../db';

export class SalesService extends BaseService<Sale> {
  constructor() {
    super('sales');
  }

  async createSale(userId: number, data: CreateSaleDto): Promise<Sale> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Iniciar transacción
      await dbClient.query('BEGIN');
      
      // 1. Validar stock disponible para todos los items
      for (const item of data.items) {
        const stockQuery = 'SELECT quantity FROM inventario WHERE id = $1';
        const stockResult = await dbClient.query(stockQuery, [item.inventario_id]);
        
        if (stockResult.rows.length === 0) {
          throw new Error(`Producto ${item.inventario_id} no encontrado en inventario`);
        }
        
        const availableQuantity = stockResult.rows[0].quantity;
        if (availableQuantity < item.quantity_sold) {
          throw new Error(`Stock insuficiente para producto ${item.inventario_id}. Disponible: ${availableQuantity}, Solicitado: ${item.quantity_sold}`);
        }
      }
      
      // 2. Validar información del cliente
      if (data.client_id && data.client_name) {
        // Si ambos están presentes, verificar que el cliente existe
        const clientQuery = 'SELECT id, name FROM clients WHERE id = $1';
        const clientResult = await dbClient.query(clientQuery, [data.client_id]);
        
        if (clientResult.rows.length === 0) {
          throw new Error('El cliente especificado no existe');
        }
      } else if (data.client_id) {
        // Solo client_id, verificar que existe
        const clientQuery = 'SELECT id FROM clients WHERE id = $1';
        const clientResult = await dbClient.query(clientQuery, [data.client_id]);
        
        if (clientResult.rows.length === 0) {
          throw new Error('El cliente especificado no existe');
        }
      } else if (!data.client_name) {
        throw new Error('Debe especificar client_id o client_name');
      }
      
      // 3. Calcular total y validar payment_details
      const totalAmount = data.items.reduce((sum, item) => sum + (item.unit_price * item.quantity_sold), 0);
      
      // Validar que payment_details esté presente y no esté vacío
      if (!data.payment_details || data.payment_details.length === 0) {
        throw new Error('Debe especificar al menos un método de pago');
      }
      
      // Validar que la suma de los payment_details sea igual al total
      const paymentTotal = data.payment_details.reduce((sum, payment) => sum + payment.amount, 0);
      if (Math.abs(paymentTotal - totalAmount) > 0.01) { // Tolerancia de 1 centavo para errores de redondeo
        throw new Error(`El total de los pagos (${paymentTotal}) no coincide con el total de la venta (${totalAmount})`);
      }
      
      // 4. Crear la venta (mantenemos payment_method para compatibilidad hacia atrás)
      const primaryPaymentMethod = data.payment_details.length === 1 
        ? data.payment_details[0].payment_method 
        : 'mixto';
        
      const saleQuery = `
        INSERT INTO sales (client_id, client_name, user_id, total_amount, payment_method, notes, location)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const saleResult = await dbClient.query(saleQuery, [
        data.client_id || null,
        data.client_name || null,
        userId,
        totalAmount,
        primaryPaymentMethod,
        data.notes || null,
        'Polanco' // location por defecto
      ]);
      
      const sale = saleResult.rows[0];
      
      // 5. Crear los payment_details
      const insertedPayments = [];
      for (const payment of data.payment_details) {
        const paymentQuery = `
          INSERT INTO payment_details (sale_id, payment_method, amount, notes)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        
        const paymentResult = await dbClient.query(paymentQuery, [
          sale.id,
          payment.payment_method,
          payment.amount,
          payment.notes || null
        ]);
        
        insertedPayments.push(paymentResult.rows[0]);
      }
      
      // 6. Crear los items de venta y actualizar inventario
      const insertedItems = [];
      
      for (const item of data.items) {
        // Insertar sale_item
        const itemQuery = `
          INSERT INTO sale_items (sale_id, inventario_id, quantity_sold, unit_price, total_price, notes)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;
        
        const totalPrice = item.unit_price * item.quantity_sold;
        const itemResult = await dbClient.query(itemQuery, [
          sale.id,
          item.inventario_id,
          item.quantity_sold,
          item.unit_price,
          totalPrice,
          item.notes || null
        ]);
        
        insertedItems.push(itemResult.rows[0]);
        
        // Actualizar inventario (reducir stock)
        const updateInventoryQuery = `
          UPDATE inventario 
          SET quantity = quantity - $1, updated_at = NOW()
          WHERE id = $2
        `;
        
        await dbClient.query(updateInventoryQuery, [item.quantity_sold, item.inventario_id]);
      }
      
      // Confirmar transacción
      await dbClient.query('COMMIT');
      
      // Retornar venta completa con items y payment_details
      return {
        ...sale,
        items: insertedItems,
        payment_details: insertedPayments
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

  async getSale(id: number): Promise<Sale | null> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Consultar la venta con información del cliente
      const saleQuery = `
        SELECT 
          s.*,
          c.name as client_registered_name,
          c.phone as client_phone,
          c.email as client_email
        FROM sales s
        LEFT JOIN clients c ON s.client_id = c.id
        WHERE s.id = $1
      `;
      
      const saleResult = await dbClient.query(saleQuery, [id]);
      
      if (saleResult.rows.length === 0) {
        return null;
      }
      
      const saleRow = saleResult.rows[0];
      
      // Consultar los items de la venta con información del producto
      const itemsQuery = `
        SELECT 
          si.*,
          vi.category_id,
          vi.subcategory_id,
          vi.brand_id,
          vi.status,
          vi.features,
          vi.final_sale_price,
          c.name as category_name,
          s.name as subcategory_name,
          b.name as brand_name,
          i.quantity as available_quantity
        FROM sale_items si
        LEFT JOIN inventario i ON si.inventario_id = i.id
        LEFT JOIN valuation_items vi ON i.id LIKE CONCAT(
          (SELECT sku FROM subcategories WHERE id = vi.subcategory_id), '%'
        )
        LEFT JOIN categories c ON vi.category_id = c.id
        LEFT JOIN subcategories s ON vi.subcategory_id = s.id
        LEFT JOIN brands b ON vi.brand_id = b.id
        WHERE si.sale_id = $1
        ORDER BY si.created_at ASC
      `;
      
      const itemsResult = await dbClient.query(itemsQuery, [id]);
      
      // Consultar los payment_details de la venta
      const paymentDetailsQuery = `
        SELECT *
        FROM payment_details
        WHERE sale_id = $1
        ORDER BY created_at ASC
      `;
      
      const paymentDetailsResult = await dbClient.query(paymentDetailsQuery, [id]);
      
      const sale: Sale = {
        id: saleRow.id,
        client_id: saleRow.client_id,
        client_name: saleRow.client_name,
        user_id: saleRow.user_id,
        sale_date: saleRow.sale_date,
        total_amount: parseFloat(saleRow.total_amount),
        payment_method: saleRow.payment_method,
        status: saleRow.status,
        location: saleRow.location,
        notes: saleRow.notes,
        created_at: saleRow.created_at,
        updated_at: saleRow.updated_at,
        items: itemsResult.rows.map(item => ({
          ...item,
          quantity_sold: parseInt(item.quantity_sold),
          unit_price: parseFloat(item.unit_price),
          total_price: parseFloat(item.total_price),
          product_info: {
            category_name: item.category_name,
            subcategory_name: item.subcategory_name,
            brand_name: item.brand_name,
            features: item.features,
            available_quantity: item.available_quantity
          }
        })),
        payment_details: paymentDetailsResult.rows.map(payment => ({
          ...payment,
          amount: parseFloat(payment.amount)
        }))
      };
      
      // Agregar información del cliente si está registrado
      if (saleRow.client_id) {
        sale.client = {
          id: saleRow.client_id,
          name: saleRow.client_registered_name,
          phone: saleRow.client_phone,
          email: saleRow.client_email
        };
      }
      
      return sale;
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async getSales(params: SaleQueryParams): Promise<{ sales: Sale[]; total: number }> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Construir la consulta con filtros opcionales
      let query = `
        SELECT 
          s.*,
          c.name as client_registered_name,
          c.phone as client_phone,
          c.email as client_email,
          COALESCE(item_count.total_items, 0) as items_count
        FROM sales s
        LEFT JOIN clients c ON s.client_id = c.id
        LEFT JOIN (
          SELECT sale_id, SUM(quantity_sold) as total_items
          FROM sale_items
          GROUP BY sale_id
        ) item_count ON s.id = item_count.sale_id
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      if (params.client_id) {
        query += ` AND s.client_id = $${paramIndex++}`;
        queryParams.push(params.client_id);
      }
      
      if (params.user_id) {
        query += ` AND s.user_id = $${paramIndex++}`;
        queryParams.push(params.user_id);
      }
      
      if (params.status) {
        query += ` AND s.status = $${paramIndex++}`;
        queryParams.push(params.status);
      }
      
      if (params.payment_method) {
        query += ` AND s.payment_method = $${paramIndex++}`;
        queryParams.push(params.payment_method);
      }
      
      if (params.location) {
        query += ` AND s.location = $${paramIndex++}`;
        queryParams.push(params.location);
      }
      
      if (params.start_date) {
        query += ` AND s.sale_date >= $${paramIndex++}`;
        queryParams.push(params.start_date);
      }
      
      if (params.end_date) {
        query += ` AND s.sale_date <= $${paramIndex++}`;
        queryParams.push(params.end_date);
      }
      
      // Búsqueda por texto (ID, nombre del cliente)
      if (params.search) {
        query += ` AND (s.id::text LIKE $${paramIndex++} OR COALESCE(c.name, s.client_name) ILIKE $${paramIndex++})`;
        const searchTerm = `%${params.search}%`;
        queryParams.push(searchTerm, searchTerm);
        // No necesitamos incrementar paramIndex aquí porque ya se incrementó 2 veces arriba
      }
      
      // Obtener el total de resultados
      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
      const countResult = await dbClient.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);
      
      // Aplicar paginación
      const page = params.page && params.page > 0 ? params.page : 1;
      const limit = params.limit && params.limit > 0 ? params.limit : 10;
      const offset = (page - 1) * limit;
      
      query += ` ORDER BY s.sale_date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      queryParams.push(limit, offset);
      
      const result = await dbClient.query(query, queryParams);
      
      // Formatear los resultados
      const sales = result.rows.map(row => ({
        id: row.id,
        client_id: row.client_id,
        client_name: row.client_name,
        user_id: row.user_id,
        sale_date: row.sale_date,
        total_amount: parseFloat(row.total_amount),
        payment_method: row.payment_method,
        status: row.status,
        location: row.location,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        client: row.client_id ? {
          id: row.client_id,
          name: row.client_registered_name,
          phone: row.client_phone,
          email: row.client_email
        } : undefined,
        items: [], // Los items se cargan individualmente si se necesitan
        items_count: parseInt(row.items_count)
      }));
      
      return {
        sales,
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

  async searchInventory(params: InventorySearchParams): Promise<{ items: InventoryItem[]; total: number }> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Construir consulta para buscar en inventario con información del producto
      let query = `
        SELECT 
          i.*,
          vi.category_id,
          vi.subcategory_id,
          vi.brand_id,
          vi.status,
          vi.features,
          vi.final_sale_price,
          c.name as category_name,
          s.name as subcategory_name,
          b.name as brand_name
        FROM inventario i
        LEFT JOIN valuation_items vi ON i.id LIKE CONCAT(
          (SELECT sku FROM subcategories WHERE id = vi.subcategory_id), '%'
        )
        LEFT JOIN categories c ON vi.category_id = c.id
        LEFT JOIN subcategories s ON vi.subcategory_id = s.id
        LEFT JOIN brands b ON vi.brand_id = b.id
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      if (params.available_only) {
        query += ` AND i.quantity > 0`;
      }
      
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
      
      if (params.q) {
        query += ` AND (i.id ILIKE $${paramIndex++} OR c.name ILIKE $${paramIndex++} OR s.name ILIKE $${paramIndex++} OR b.name ILIKE $${paramIndex++})`;
        const searchTerm = `%${params.q}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        // No necesitamos incrementar paramIndex aquí porque ya se incrementó 4 veces arriba
      }
      
      // Obtener el total de resultados
      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
      const countResult = await dbClient.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);
      
      // Aplicar paginación
      const page = params.page && params.page > 0 ? params.page : 1;
      const limit = params.limit && params.limit > 0 ? params.limit : 20;
      const offset = (page - 1) * limit;
      
      query += ` ORDER BY i.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      queryParams.push(limit, offset);
      
      const result = await dbClient.query(query, queryParams);
      
      // Formatear los resultados
      const items = result.rows.map(row => ({
        id: row.id,
        quantity: parseInt(row.quantity),
        location: row.location,
        created_at: row.created_at,
        updated_at: row.updated_at,
        valuation_item: {
          category_id: row.category_id,
          subcategory_id: row.subcategory_id,
          brand_id: row.brand_id,
          status: row.status,
          features: row.features,
          final_sale_price: parseFloat(row.final_sale_price),
          category_name: row.category_name,
          subcategory_name: row.subcategory_name,
          brand_name: row.brand_name
        }
      }));
      
      return {
        items,
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
}