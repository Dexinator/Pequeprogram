import { Pool, PoolClient } from 'pg';
import {
  Valuation,
  ValuationItem,
  Client,
  CreateValuationDto,
  AddValuationItemDto,
  ValuationCalculationResult,
  CalculateValuationDto,
  FinalizeValuationDto,
  ValuationQueryParams,
} from '../models/valuation.model';
import { BaseService } from './base.service';
import { pool } from '../db';

export class ValuationService extends BaseService<Valuation> {
  constructor() {
    super('valuations');
  }

  async createClient(client: Partial<Client>): Promise<Client> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Verificar si el cliente ya existe por teléfono
      const existingClientQuery = 'SELECT * FROM clients WHERE phone = $1';
      const existingResult = await dbClient.query(existingClientQuery, [client.phone]);
      
      if (existingResult.rows.length > 0) {
        return existingResult.rows[0];
      }
      
      const query = `
        INSERT INTO clients (name, phone, email, identification, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const result = await dbClient.query(query, [
        client.name,
        client.phone,
        client.email || null,
        client.identification || null,
        true
      ]);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async getClient(id: number): Promise<Client | null> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      const query = 'SELECT * FROM clients WHERE id = $1';
      const result = await dbClient.query(query, [id]);
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async searchClients(searchTerm: string): Promise<Client[]> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      const query = `
        SELECT * FROM clients 
        WHERE name ILIKE $1 OR phone LIKE $2
        ORDER BY name
        LIMIT 10
      `;
      
      const result = await dbClient.query(query, [
        `%${searchTerm}%`,
        `%${searchTerm}%`
      ]);
      
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async createValuation(userId: number, data: CreateValuationDto): Promise<Valuation> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Verificar que el cliente existe
      const clientQuery = 'SELECT id FROM clients WHERE id = $1';
      const clientResult = await dbClient.query(clientQuery, [data.client_id]);
      
      if (clientResult.rows.length === 0) {
        throw new Error('El cliente especificado no existe');
      }
      
      const query = `
        INSERT INTO valuations (client_id, user_id, status, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const result = await dbClient.query(query, [
        data.client_id,
        userId,
        'pending',
        data.notes || null
      ]);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async getValuation(id: number): Promise<Valuation | null> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Consultar la valuación
      const query = 'SELECT * FROM valuations WHERE id = $1';
      const result = await dbClient.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const valuation: Valuation = result.rows[0];
      
      // Consultar los items de la valuación
      const itemsQuery = 'SELECT * FROM valuation_items WHERE valuation_id = $1';
      const itemsResult = await dbClient.query(itemsQuery, [id]);
      
      valuation.items = itemsResult.rows;
      
      return valuation;
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async calculateValuation(data: CalculateValuationDto): Promise<ValuationCalculationResult> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // 1. Obtener los puntajes de los factores
      const factorsQuery = `
        SELECT factor_type, score 
        FROM valuation_factors 
        WHERE subcategory_id = $1 
          AND (
            (factor_type = 'estado' AND factor_value = $2) OR
            (factor_type = 'demanda' AND factor_value = $3) OR
            (factor_type = 'limpieza' AND factor_value = $4)
          )
      `;
      
      const factorsResult = await dbClient.query(factorsQuery, [
        data.subcategory_id,
        data.condition_state,
        data.demand,
        data.cleanliness
      ]);
      
      // 2. Calcular puntajes de compra y venta
      let purchaseScore = 0;
      let saleScore = 0;
      
      factorsResult.rows.forEach(factor => {
        if (factor.factor_type === 'estado' || factor.factor_type === 'demanda') {
          // Para el puntaje de venta se consideran estado y demanda
          saleScore += factor.score;
          // Para el puntaje de compra se consideran todos los factores
          purchaseScore += factor.score;
        } else if (factor.factor_type === 'limpieza') {
          // La limpieza solo afecta al puntaje de compra
          purchaseScore += factor.score;
        }
      });
      
      // 3. Obtener GAP y Margen según la subcategoría y estado (nuevo/usado)
      const subcategoryQuery = `
        SELECT gap_new, gap_used, margin_new, margin_used
        FROM subcategories
        WHERE id = $1
      `;
      
      const subcategoryResult = await dbClient.query(subcategoryQuery, [data.subcategory_id]);
      
      if (subcategoryResult.rows.length === 0) {
        throw new Error('La subcategoría especificada no existe');
      }
      
      const subcategory = subcategoryResult.rows[0];
      
      // Determinar si es nuevo o usado
      const isNew = data.status.toLowerCase().includes('nuevo');
      
      const gap = isNew ? subcategory.gap_new : subcategory.gap_used;
      const margin = isNew ? subcategory.margin_new : subcategory.margin_used;
      
      // 4. Aplicar fórmulas de cálculo
      // Precio Venta = Precio_Nuevo × (1 - GAP + Calificación_Venta/100)
      const salePriceMultiplier = 1 - gap + saleScore / 100;
      const salePrice = data.new_price * salePriceMultiplier;
      
      // Precio Compra = Precio_Venta × (1 - Margen + Calificación_Compra/100)
      const purchasePriceMultiplier = 1 - margin + purchaseScore / 100;
      const purchasePrice = salePrice * purchasePriceMultiplier;
      
      // 5. Calcular precio de consignación (generalmente un 15-25% más alto que el de compra)
      const consignmentPrice = purchasePrice * 1.2;
      
      return {
        purchase_score: purchaseScore,
        sale_score: saleScore,
        suggested_purchase_price: Math.round(purchasePrice * 100) / 100,
        suggested_sale_price: Math.round(salePrice * 100) / 100,
        consignment_price: Math.round(consignmentPrice * 100) / 100
      };
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async addValuationItem(valuationId: number, data: AddValuationItemDto): Promise<ValuationItem> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // 1. Verificar que la valuación existe y está en estado pendiente
      const valuationQuery = 'SELECT status FROM valuations WHERE id = $1';
      const valuationResult = await dbClient.query(valuationQuery, [valuationId]);
      
      if (valuationResult.rows.length === 0) {
        throw new Error('La valuación especificada no existe');
      }
      
      if (valuationResult.rows[0].status !== 'pending') {
        throw new Error('No se pueden agregar items a una valuación que no está pendiente');
      }
      
      // 2. Calcular la valuación
      const calculationData: CalculateValuationDto = {
        subcategory_id: data.subcategory_id,
        status: data.status,
        condition_state: data.condition_state,
        demand: data.demand,
        cleanliness: data.cleanliness,
        new_price: data.new_price
      };
      
      const calculation = await this.calculateValuation(calculationData);
      
      // 3. Insertar el item de valuación
      const query = `
        INSERT INTO valuation_items (
          valuation_id, category_id, subcategory_id, brand_id, 
          status, brand_renown, modality, condition_state, demand, cleanliness,
          features, new_price, purchase_score, sale_score,
          suggested_purchase_price, suggested_sale_price, consignment_price,
          images, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *
      `;
      
      const result = await dbClient.query(query, [
        valuationId,
        data.category_id,
        data.subcategory_id,
        data.brand_id || null,
        data.status,
        data.brand_renown,
        data.modality,
        data.condition_state,
        data.demand,
        data.cleanliness,
        data.features ? JSON.stringify(data.features) : null,
        data.new_price,
        calculation.purchase_score,
        calculation.sale_score,
        calculation.suggested_purchase_price,
        calculation.suggested_sale_price,
        calculation.consignment_price,
        data.images ? JSON.stringify(data.images) : null,
        data.notes || null
      ]);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async finalizeValuation(id: number, data: FinalizeValuationDto): Promise<Valuation> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Iniciar transacción
      await dbClient.query('BEGIN');
      
      // 1. Actualizar los precios finales de los items si se proporcionaron
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          const updateItemQuery = `
            UPDATE valuation_items
            SET 
              final_purchase_price = $1,
              final_sale_price = $2,
              updated_at = NOW()
            WHERE id = $3 AND valuation_id = $4
          `;
          
          await dbClient.query(updateItemQuery, [
            item.final_purchase_price || null,
            item.final_sale_price || null,
            item.id,
            id
          ]);
        }
      }
      
      // 2. Calcular totales
      const totalsQuery = `
        SELECT 
          SUM(CASE WHEN modality = 'compra directa' THEN 
            COALESCE(final_purchase_price, suggested_purchase_price) ELSE 0 END) as total_purchase,
          SUM(CASE WHEN modality = 'consignación' THEN 
            COALESCE(consignment_price, 0) ELSE 0 END) as total_consignment
        FROM valuation_items
        WHERE valuation_id = $1
      `;
      
      const totalsResult = await dbClient.query(totalsQuery, [id]);
      const totals = totalsResult.rows[0];
      
      // 3. Actualizar la valuación
      const updateQuery = `
        UPDATE valuations
        SET 
          status = $1,
          notes = $2,
          total_purchase_amount = $3,
          total_consignment_amount = $4,
          updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `;
      
      const result = await dbClient.query(updateQuery, [
        data.status,
        data.notes || null,
        totals.total_purchase || 0,
        totals.total_consignment || 0,
        id
      ]);
      
      // Confirmar transacción
      await dbClient.query('COMMIT');
      
      // Obtener la valuación completa con sus items
      return await this.getValuation(id) as Valuation;
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

  async getValuations(params: ValuationQueryParams): Promise<{ valuations: Valuation[]; total: number }> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Construir la consulta con filtros opcionales
      let query = `
        SELECT v.*, c.name as client_name
        FROM valuations v
        JOIN clients c ON v.client_id = c.id
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      if (params.client_id) {
        query += ` AND v.client_id = $${paramIndex++}`;
        queryParams.push(params.client_id);
      }
      
      if (params.user_id) {
        query += ` AND v.user_id = $${paramIndex++}`;
        queryParams.push(params.user_id);
      }
      
      if (params.status) {
        query += ` AND v.status = $${paramIndex++}`;
        queryParams.push(params.status);
      }
      
      if (params.start_date) {
        query += ` AND v.valuation_date >= $${paramIndex++}`;
        queryParams.push(params.start_date);
      }
      
      if (params.end_date) {
        query += ` AND v.valuation_date <= $${paramIndex++}`;
        queryParams.push(params.end_date);
      }
      
      // Obtener el total de resultados
      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
      const countResult = await dbClient.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);
      
      // Aplicar paginación
      const page = params.page && params.page > 0 ? params.page : 1;
      const limit = params.limit && params.limit > 0 ? params.limit : 10;
      const offset = (page - 1) * limit;
      
      query += ` ORDER BY v.valuation_date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      queryParams.push(limit, offset);
      
      const result = await dbClient.query(query, queryParams);
      
      return {
        valuations: result.rows,
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