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
      
      // Consultar los items de la valuación con información de categorías, subcategorías y marcas
      const itemsQuery = `
        SELECT 
          vi.*,
          c.name as category_name,
          s.name as subcategory_name,
          b.name as brand_name
        FROM valuation_items vi
        LEFT JOIN categories c ON vi.category_id = c.id
        LEFT JOIN subcategories s ON vi.subcategory_id = s.id
        LEFT JOIN brands b ON vi.brand_id = b.id
        WHERE vi.valuation_id = $1
        ORDER BY vi.created_at ASC
      `;
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
      console.log('Calculando valuación para:', data);
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
      console.log('Factores obtenidos:', factorsResult.rows);
      
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
      const isNew = data.status.toLowerCase() === 'nuevo';
      console.log('isNew', isNew);
      const gap = isNew ? subcategory.gap_new : subcategory.gap_used;
      const margin = isNew ? subcategory.margin_new : subcategory.margin_used;
      console.log('gap', gap);
      console.log('margin', margin);
      
      // 4. Aplicar fórmulas de cálculo
      // Precio Venta = Precio_Nuevo × (1 - GAP + Calificación_Venta/100)
      const salePriceMultiplier = 1 - gap + saleScore / 100;
      const salePrice = data.new_price * salePriceMultiplier;
      
      // Precio Compra = Precio_Venta × (1 - Margen + Calificación_Compra/100)
      const purchasePriceMultiplier = 1 - margin + purchaseScore / 100;
      const purchasePrice = salePrice * purchasePriceMultiplier;
      
      // 5. Calcular precios para diferentes modalidades
      // NOTA: consignment_price ahora es solo el precio de venta sugerido
      // El pago real al proveedor será 50% del precio de venta real
      const consignmentPrice = salePrice; // Precio de venta sugerido para consignación
      const storeCreditPrice = purchasePrice * 1.2; // 20% más que compra directa
      
      return {
        purchase_score: purchaseScore,
        sale_score: saleScore,
        suggested_purchase_price: Math.round(purchasePrice * 100) / 100,
        suggested_sale_price: Math.round(salePrice * 100) / 100,
        consignment_price: Math.round(consignmentPrice * 100) / 100, // Ahora es precio de venta sugerido
        store_credit_price: Math.round(storeCreditPrice * 100) / 100
      };
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async calculateBatch(products: any[]): Promise<any[]> {
    let dbClient: PoolClient | undefined;
    const calculatedProducts = [];
    
    try {
      dbClient = await pool.connect();
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        try {
          // Usar el método de cálculo existente para cada producto
          const calculation = await this.calculateValuation({
            subcategory_id: product.subcategory_id,
            status: product.status,
            condition_state: product.condition_state,
            demand: product.demand,
            cleanliness: product.cleanliness,
            new_price: product.new_price
          });

          // Obtener nombres de categoría y subcategoría si no están disponibles
          let categoryName = product.categoryName || '';
          let subcategoryName = product.subcategoryName || '';
          let brandName = product.brandName || '';

          if (!subcategoryName && product.subcategory_id) {
            const subcategoryQuery = `
              SELECT s.name as subcategory_name, c.name as category_name
              FROM subcategories s
              LEFT JOIN categories c ON s.category_id = c.id
              WHERE s.id = $1
            `;
            const subcategoryResult = await dbClient.query(subcategoryQuery, [product.subcategory_id]);
            if (subcategoryResult.rows.length > 0) {
              subcategoryName = subcategoryResult.rows[0].subcategory_name || '';
              if (!categoryName) {
                categoryName = subcategoryResult.rows[0].category_name || '';
              }
            }
          }

          if (!brandName && product.brand_id) {
            const brandQuery = 'SELECT name FROM brands WHERE id = $1';
            const brandResult = await dbClient.query(brandQuery, [product.brand_id]);
            if (brandResult.rows.length > 0) {
              brandName = brandResult.rows[0].name || '';
            }
          }

          // Combinar datos del producto con cálculos
          calculatedProducts.push({
            ...product,
            ...calculation,
            // Agregar un ID temporal para el frontend
            id: `temp_${Date.now()}_${i}`,
            // Agregar nombres obtenidos de la base de datos
            categoryName,
            subcategoryName,
            brandName
          });
        } catch (error) {
          console.error(`Error calculando producto ${i + 1}:`, error);
          // En caso de error, incluir el producto con valores por defecto
          calculatedProducts.push({
            ...product,
            id: `temp_${Date.now()}_${i}`,
            purchase_score: 0,
            sale_score: 0,
            suggested_purchase_price: 0,
            suggested_sale_price: 0,
            consignment_price: 0,
            store_credit_price: 0,
            categoryName: '',
            subcategoryName: '',
            brandName: '',
            error: 'Error en cálculo'
          });
        }
      }
      
      return calculatedProducts;
    } catch (error) {
      throw error;
    } finally {
      if (dbClient) {
        dbClient.release();
      }
    }
  }

  async finalizeComplete(userId: number, clientId: number, products: any[], notes: string): Promise<any> {
    let dbClient: PoolClient | undefined;
    try {
      dbClient = await pool.connect();
      
      // Iniciar transacción
      await dbClient.query('BEGIN');
      
      // 1. Crear la valuación
      const valuationQuery = `
        INSERT INTO valuations (client_id, user_id, status, notes, created_at, updated_at)
        VALUES ($1, $2, 'completed', $3, NOW(), NOW())
        RETURNING *
      `;
      
      const valuationResult = await dbClient.query(valuationQuery, [clientId, userId, notes]);
      const valuation = valuationResult.rows[0];
      
      console.log('Valuación creada:', valuation);
      
      // 2. Insertar todos los items con cálculo de precios
      const insertedItems = [];
      
      for (const product of products) {
        // Calcular precios para el producto
        const calculation = await this.calculateValuation({
          subcategory_id: product.subcategory_id,
          status: product.status,
          condition_state: product.condition_state,
          demand: product.demand,
          cleanliness: product.cleanliness,
          new_price: product.new_price
        });
        
        // Obtener SKU de la subcategoría para generar ID del inventario
        const skuQuery = 'SELECT sku FROM subcategories WHERE id = $1';
        const skuResult = await dbClient.query(skuQuery, [product.subcategory_id]);
        
        if (skuResult.rows.length === 0) {
          throw new Error(`Subcategoría ${product.subcategory_id} no encontrada`);
        }
        
        const sku = skuResult.rows[0].sku;
        
        // Contar productos existentes en inventario para esta subcategoría para generar número secuencial
        const countQuery = `
          SELECT COUNT(*) as count
          FROM inventario
          WHERE id LIKE $1
        `;
        const countResult = await dbClient.query(countQuery, [`${sku}%`]);
        const productCount = parseInt(countResult.rows[0].count) + 1;
        
        // Generar ID del inventario (SKU + número secuencial)
        const inventarioId = `${sku}${productCount.toString().padStart(3, '0')}`;
        
        // Insertar el item con precios calculados y location
        const itemQuery = `
          INSERT INTO valuation_items (
            valuation_id, category_id, subcategory_id, brand_id, status, brand_renown,
            modality, condition_state, demand, cleanliness, new_price, quantity, features, notes, images,
            purchase_score, sale_score, suggested_purchase_price, suggested_sale_price, 
            consignment_price, store_credit_price, final_purchase_price, final_sale_price, location,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW(), NOW())
          RETURNING *
        `;
        
        const itemValues = [
          valuation.id,
          product.category_id,
          product.subcategory_id,
          product.brand_id || null,
          product.status,
          product.brand_renown,
          product.modality,
          product.condition_state,
          product.demand,
          product.cleanliness,
          product.new_price,
          product.quantity || 1,
          JSON.stringify(product.features || {}),
          product.notes || '',
          JSON.stringify(product.images || []),
          calculation.purchase_score,
          calculation.sale_score,
          calculation.suggested_purchase_price,
          calculation.suggested_sale_price,
          calculation.consignment_price,
          calculation.store_credit_price,
          product.final_purchase_price || calculation.suggested_purchase_price,
          product.final_sale_price || calculation.suggested_sale_price,
          'Polanco' // location por defecto
        ];
        
        const itemResult = await dbClient.query(itemQuery, itemValues);
        const insertedItem = itemResult.rows[0];
        insertedItems.push(insertedItem);
        
        // Insertar en tabla inventario con valuation_item_id
        const inventarioQuery = `
          INSERT INTO inventario (id, quantity, location, valuation_item_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
        `;
        
        await dbClient.query(inventarioQuery, [
          inventarioId,
          product.quantity || 1,
          'Polanco', // location por defecto
          insertedItem.id // valuation_item_id
        ]);
      }
      
      // 3. Calcular totales finales (multiplicar por cantidad)
      const totalsQuery = `
        SELECT 
          SUM(CASE WHEN modality = 'compra directa' THEN 
            COALESCE(final_purchase_price, suggested_purchase_price) * quantity ELSE 0 END) as total_purchase,
          SUM(CASE WHEN modality = 'crédito en tienda' THEN 
            COALESCE(final_purchase_price, store_credit_price) * quantity ELSE 0 END) as total_store_credit,
          SUM(CASE WHEN modality = 'consignación' THEN 
            COALESCE(consignment_price, 0) * quantity ELSE 0 END) as total_consignment
        FROM valuation_items
        WHERE valuation_id = $1
      `;
      
      const totalsResult = await dbClient.query(totalsQuery, [valuation.id]);
      const totals = totalsResult.rows[0];
      
      // 4. Actualizar la valuación con los totales
      const updateQuery = `
        UPDATE valuations
        SET 
          total_purchase_amount = $1,
          total_store_credit_amount = $2,
          total_consignment_amount = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `;
      
      const finalValuationResult = await dbClient.query(updateQuery, [
        parseFloat(totals.total_purchase) || 0,
        parseFloat(totals.total_store_credit) || 0,
        parseFloat(totals.total_consignment) || 0,
        valuation.id
      ]);
      
      // 5. Si hay crédito en tienda, actualizar el saldo del cliente
      if (totals.total_store_credit && parseFloat(totals.total_store_credit) > 0) {
        const updateClientCreditQuery = `
          UPDATE clients 
          SET store_credit = COALESCE(store_credit, 0) + $1
          WHERE id = $2
        `;
        
        await dbClient.query(updateClientCreditQuery, [
          parseFloat(totals.total_store_credit),
          clientId
        ]);
        
        console.log(`Actualizado crédito del cliente ${clientId}: +${totals.total_store_credit}`);
      }
      
      // Confirmar transacción
      await dbClient.query('COMMIT');
      
      // Retornar valuación completa con items
      return {
        ...finalValuationResult.rows[0],
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
          quantity, features, new_price, purchase_score, sale_score,
          suggested_purchase_price, suggested_sale_price, consignment_price, store_credit_price,
          images, notes, location
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
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
        data.quantity || 1,
        data.features ? JSON.stringify(data.features) : null,
        data.new_price,
        calculation.purchase_score,
        calculation.sale_score,
        calculation.suggested_purchase_price,
        calculation.suggested_sale_price,
        calculation.consignment_price,
        calculation.store_credit_price,
        data.images ? JSON.stringify(data.images) : null,
        data.notes || null,
        'Polanco' // location por defecto
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
              modality = $3,
              updated_at = NOW()
            WHERE id = $4 AND valuation_id = $5
          `;
          
          await dbClient.query(updateItemQuery, [
            item.final_purchase_price || null,
            item.final_sale_price || null,
            item.modality || 'compra directa',
            item.id,
            id
          ]);
        }
      }
      
      // 2. Calcular totales (multiplicar por cantidad)
      const totalsQuery = `
        SELECT 
          SUM(CASE WHEN modality = 'compra directa' THEN 
            COALESCE(final_purchase_price, suggested_purchase_price) * quantity ELSE 0 END) as total_purchase,
          SUM(CASE WHEN modality = 'crédito en tienda' THEN 
            COALESCE(final_purchase_price, store_credit_price) * quantity ELSE 0 END) as total_store_credit,
          SUM(CASE WHEN modality = 'consignación' THEN 
            COALESCE(consignment_price, 0) * quantity ELSE 0 END) as total_consignment
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
          total_store_credit_amount = $4,
          total_consignment_amount = $5,
          updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `;
      
      const result = await dbClient.query(updateQuery, [
        data.status,
        data.notes || null,
        totals.total_purchase || 0,
        totals.total_store_credit || 0,
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
      
      // Construir la consulta con filtros opcionales, incluyendo información del cliente y conteo de items
      let query = `
        SELECT 
          v.*,
          c.name as client_name,
          c.phone as client_phone,
          c.email as client_email,
          c.identification as client_identification,
          c.store_credit as client_store_credit,
          COALESCE(item_count.total_items, 0) as items_count
        FROM valuations v
        JOIN clients c ON v.client_id = c.id
        LEFT JOIN (
          SELECT valuation_id, SUM(quantity) as total_items
          FROM valuation_items
          GROUP BY valuation_id
        ) item_count ON v.id = item_count.valuation_id
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
      
      // Búsqueda por texto (ID, nombre del cliente o teléfono)
      if (params.search) {
        query += ` AND (v.id::text LIKE $${paramIndex++} OR c.name ILIKE $${paramIndex++} OR c.phone LIKE $${paramIndex++})`;
        const searchTerm = `%${params.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
        // No need to adjust paramIndex since it was already incremented 3 times above
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
      
      // Formatear los resultados para incluir información del cliente como objeto
      const valuations = result.rows.map(row => ({
        id: row.id,
        client_id: row.client_id,
        user_id: row.user_id,
        valuation_date: row.valuation_date,
        total_purchase_amount: row.total_purchase_amount,
        total_consignment_amount: row.total_consignment_amount,
        status: row.status,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        client: {
          id: row.client_id,
          name: row.client_name,
          phone: row.client_phone,
          email: row.client_email,
          identification: row.client_identification,
          store_credit: row.client_store_credit ? parseFloat(row.client_store_credit) : 0
        },
        items: [], // Los items se cargan individualmente si se necesitan
        items_count: parseInt(row.items_count)
      }));
      
      return {
        valuations,
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