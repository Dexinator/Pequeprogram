import { pool } from '../db';

export interface ConsignmentProduct {
  id: number;
  valuation_id: number;
  client_id: number;
  client_name: string;
  client_phone: string;
  category_name: string;
  subcategory_name: string;
  brand_name: string;
  features: any;
  consignment_price: number;
  final_sale_price: number;
  location: string;
  status: 'available' | 'sold_unpaid' | 'sold_paid';
  sold_date?: Date;
  sale_id?: number;
  sale_price?: number;
  notes?: string;
  consignment_paid: boolean;
  consignment_paid_date?: Date;
  consignment_paid_amount?: number;
  consignment_paid_notes?: string;
  // New percentage-based fields
  consignment_percentage?: number;
  actual_sale_price?: number;
  calculated_consignment_amount?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ConsignmentFilters {
  status?: string;
  location?: string;
  client_id?: number;
}

export class ConsignmentService {
  async getAllConsignments(offset: number, limit: number, filters: ConsignmentFilters) {
    let whereConditions: string[] = ["vi.modality = 'consignación'"];
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'available') {
        whereConditions.push(`si.id IS NULL`); // No sale record means it's available
      } else if (filters.status === 'sold_unpaid') {
        whereConditions.push(`si.id IS NOT NULL AND vi.consignment_paid = FALSE`); // Sold but not paid
      } else if (filters.status === 'sold_paid') {
        whereConditions.push(`si.id IS NOT NULL AND vi.consignment_paid = TRUE`); // Sold and paid
      } else if (filters.status === 'sold') {
        whereConditions.push(`si.id IS NOT NULL`); // Any sold status
      }
    }

    if (filters.location) {
      whereConditions.push(`vi.location = $${paramIndex}`);
      queryParams.push(filters.location);
      paramIndex++;
    }

    if (filters.client_id) {
      whereConditions.push(`v.client_id = $${paramIndex}`);
      queryParams.push(filters.client_id);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM valuation_items vi
      JOIN valuations v ON vi.valuation_id = v.id
      JOIN clients c ON v.client_id = c.id
      LEFT JOIN inventario inv ON inv.valuation_item_id = vi.id
      LEFT JOIN sale_items si ON si.inventario_id = inv.id
      LEFT JOIN sales s ON si.sale_id = s.id
      ${whereClause}
    `;

    // Data query
    const dataQuery = `
      SELECT 
        vi.id,
        vi.valuation_id,
        v.client_id,
        c.name as client_name,
        c.phone as client_phone,
        c.email as client_email,
        cat.name as category_name,
        sub.name as subcategory_name,
        b.name as brand_name,
        vi.features,
        vi.consignment_price,
        vi.final_sale_price,
        vi.location,
        vi.notes,
        vi.created_at,
        vi.updated_at,
        vi.images,
        -- Payment information
        vi.consignment_paid,
        vi.consignment_paid_date,
        vi.consignment_paid_amount,
        vi.consignment_paid_notes,
        -- New percentage-based fields
        COALESCE(vi.consignment_percentage, 50.00) as consignment_percentage,
        vi.actual_sale_price,
        vi.calculated_consignment_amount,
        -- Sale information if sold
        s.id as sale_id,
        s.sale_date as sold_date,
        si.unit_price as sale_price,
        si.notes as sale_notes
      FROM valuation_items vi
      JOIN valuations v ON vi.valuation_id = v.id
      JOIN clients c ON v.client_id = c.id
      JOIN categories cat ON vi.category_id = cat.id
      JOIN subcategories sub ON vi.subcategory_id = sub.id
      LEFT JOIN brands b ON vi.brand_id = b.id
      LEFT JOIN inventario inv ON inv.valuation_item_id = vi.id
      LEFT JOIN sale_items si ON si.inventario_id = inv.id
      LEFT JOIN sales s ON si.sale_id = s.id
      ${whereClause}
      ORDER BY vi.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    try {
      const [countResult, dataResult] = await Promise.all([
        pool.query(countQuery, queryParams.slice(0, -2)),
        pool.query(dataQuery, queryParams)
      ]);

      const total = parseInt(countResult.rows[0].total);
      
      const consignments: ConsignmentProduct[] = dataResult.rows.map(row => {
        let status: 'available' | 'sold_unpaid' | 'sold_paid' = 'available';
        
        if (row.sale_id) {
          status = row.consignment_paid ? 'sold_paid' : 'sold_unpaid';
        }

        return {
          id: row.id,
          valuation_id: row.valuation_id,
          client_id: row.client_id,
          client_name: row.client_name,
          client_phone: row.client_phone,
          category_name: row.category_name,
          subcategory_name: row.subcategory_name,
          brand_name: row.brand_name || 'Sin marca',
          features: row.features || {},
          consignment_price: parseFloat(row.consignment_price || 0),
          final_sale_price: parseFloat(row.final_sale_price || 0),
          location: row.location,
          status,
          sold_date: row.sold_date,
          sale_id: row.sale_id,
          sale_price: row.sale_price ? parseFloat(row.sale_price) : undefined,
          notes: row.notes,
          consignment_paid: row.consignment_paid || false,
          consignment_paid_date: row.consignment_paid_date,
          consignment_paid_amount: row.consignment_paid_amount ? parseFloat(row.consignment_paid_amount) : undefined,
          consignment_paid_notes: row.consignment_paid_notes,
          // New percentage-based fields
          consignment_percentage: parseFloat(row.consignment_percentage || 50),
          actual_sale_price: row.actual_sale_price ? parseFloat(row.actual_sale_price) : undefined,
          calculated_consignment_amount: row.calculated_consignment_amount ? parseFloat(row.calculated_consignment_amount) : undefined,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
      });

      return {
        consignments,
        total
      };
    } catch (error) {
      console.error('Error fetching consignments:', error);
      throw new Error('Error al obtener productos en consignación');
    }
  }

  async getConsignmentById(id: number): Promise<ConsignmentProduct | null> {
    const query = `
      SELECT 
        vi.id,
        vi.valuation_id,
        v.client_id,
        c.name as client_name,
        c.phone as client_phone,
        c.email as client_email,
        cat.name as category_name,
        sub.name as subcategory_name,
        b.name as brand_name,
        vi.features,
        vi.consignment_price,
        vi.final_sale_price,
        vi.location,
        vi.notes,
        vi.created_at,
        vi.updated_at,
        vi.images,
        -- Payment information
        vi.consignment_paid,
        vi.consignment_paid_date,
        vi.consignment_paid_amount,
        vi.consignment_paid_notes,
        -- New percentage-based fields
        COALESCE(vi.consignment_percentage, 50.00) as consignment_percentage,
        vi.actual_sale_price,
        vi.calculated_consignment_amount,
        -- Sale information if sold
        s.id as sale_id,
        s.sale_date as sold_date,
        si.unit_price as sale_price
      FROM valuation_items vi
      JOIN valuations v ON vi.valuation_id = v.id
      JOIN clients c ON v.client_id = c.id
      JOIN categories cat ON vi.category_id = cat.id
      JOIN subcategories sub ON vi.subcategory_id = sub.id
      LEFT JOIN brands b ON vi.brand_id = b.id
      LEFT JOIN inventario inv ON inv.valuation_item_id = vi.id
      LEFT JOIN sale_items si ON si.inventario_id = inv.id
      LEFT JOIN sales s ON si.sale_id = s.id
      WHERE vi.id = $1 AND vi.modality = 'consignación'
    `;

    try {
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      
      let status: 'available' | 'sold_unpaid' | 'sold_paid' = 'available';
      if (row.sale_id) {
        status = row.consignment_paid ? 'sold_paid' : 'sold_unpaid';
      }
      
      return {
        id: row.id,
        valuation_id: row.valuation_id,
        client_id: row.client_id,
        client_name: row.client_name,
        client_phone: row.client_phone,
        category_name: row.category_name,
        subcategory_name: row.subcategory_name,
        brand_name: row.brand_name || 'Sin marca',
        features: row.features || {},
        consignment_price: parseFloat(row.consignment_price || 0),
        final_sale_price: parseFloat(row.final_sale_price || 0),
        location: row.location,
        status,
        sold_date: row.sold_date,
        sale_id: row.sale_id,
        sale_price: row.sale_price ? parseFloat(row.sale_price) : undefined,
        notes: row.notes,
        consignment_paid: row.consignment_paid || false,
        consignment_paid_date: row.consignment_paid_date,
        consignment_paid_amount: row.consignment_paid_amount ? parseFloat(row.consignment_paid_amount) : undefined,
        consignment_paid_notes: row.consignment_paid_notes,
        // New percentage-based fields
        consignment_percentage: parseFloat(row.consignment_percentage || 50),
        actual_sale_price: row.actual_sale_price ? parseFloat(row.actual_sale_price) : undefined,
        calculated_consignment_amount: row.calculated_consignment_amount ? parseFloat(row.calculated_consignment_amount) : undefined,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error('Error fetching consignment by ID:', error);
      throw new Error('Error al obtener producto en consignación');
    }
  }

  async markAsPaid(id: number, paidAmount: number | null, notes?: string): Promise<ConsignmentProduct | null> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // First, check if the consignment exists, is sold but not paid, and get the sale price
      const checkQuery = `
        SELECT 
          vi.id,
          si.unit_price as sale_price,
          COALESCE(vi.consignment_percentage, 50.00) as percentage
        FROM valuation_items vi
        LEFT JOIN inventario inv ON inv.valuation_item_id = vi.id
        LEFT JOIN sale_items si ON si.inventario_id = inv.id
        WHERE vi.id = $1 AND vi.modality = 'consignación' AND si.id IS NOT NULL AND vi.consignment_paid = FALSE
      `;
      const checkResult = await client.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const row = checkResult.rows[0];
      const salePrice = parseFloat(row.sale_price);
      const percentage = parseFloat(row.percentage);
      
      // Calculate the payment amount if not provided (50% of sale price by default)
      const calculatedAmount = salePrice * (percentage / 100);
      const finalPaidAmount = paidAmount !== null ? paidAmount : calculatedAmount;

      // Update the valuation item with payment information and actual sale price
      const updateQuery = `
        UPDATE valuation_items 
        SET 
          consignment_paid = TRUE,
          consignment_paid_date = NOW(),
          consignment_paid_amount = $2,
          consignment_paid_notes = $3,
          actual_sale_price = $4,
          calculated_consignment_amount = $5,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      
      await client.query(updateQuery, [id, finalPaidAmount, notes, salePrice, calculatedAmount]);

      await client.query('COMMIT');
      
      // Return the updated consignment
      return await this.getConsignmentById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error marking consignment as paid:', error);
      throw new Error('Error al marcar consignación como pagada');
    } finally {
      client.release();
    }
  }

  async getConsignmentStats() {
    const query = `
      SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN si.id IS NULL THEN 1 END) as available_items,
        COUNT(CASE WHEN si.id IS NOT NULL AND vi.consignment_paid = FALSE THEN 1 END) as sold_unpaid_items,
        COUNT(CASE WHEN si.id IS NOT NULL AND vi.consignment_paid = TRUE THEN 1 END) as sold_paid_items,
        SUM(CASE WHEN si.id IS NULL THEN vi.consignment_price ELSE 0 END) as total_available_value,
        -- For unpaid items, calculate 50% of the actual sale price
        SUM(CASE 
          WHEN si.id IS NOT NULL AND vi.consignment_paid = FALSE 
          THEN si.unit_price * (COALESCE(vi.consignment_percentage, 50.00) / 100)
          ELSE 0 
        END) as total_unpaid_value,
        SUM(CASE WHEN si.id IS NOT NULL AND vi.consignment_paid = TRUE THEN vi.consignment_paid_amount ELSE 0 END) as total_paid_value,
        SUM(CASE WHEN si.id IS NOT NULL THEN si.unit_price ELSE 0 END) as total_sold_value
      FROM valuation_items vi
      LEFT JOIN inventario inv ON inv.valuation_item_id = vi.id
      LEFT JOIN sale_items si ON si.inventario_id = inv.id
      LEFT JOIN sales s ON si.sale_id = s.id
      WHERE vi.modality = 'consignación'
    `;

    try {
      const result = await pool.query(query);
      const row = result.rows[0];
      
      return {
        total_items: parseInt(row.total_items || 0),
        available_items: parseInt(row.available_items || 0),
        sold_unpaid_items: parseInt(row.sold_unpaid_items || 0),
        sold_paid_items: parseInt(row.sold_paid_items || 0),
        total_available_value: parseFloat(row.total_available_value || 0),
        total_unpaid_value: parseFloat(row.total_unpaid_value || 0),
        total_paid_value: parseFloat(row.total_paid_value || 0),
        total_sold_value: parseFloat(row.total_sold_value || 0)
      };
    } catch (error) {
      console.error('Error fetching consignment stats:', error);
      throw new Error('Error al obtener estadísticas de consignación');
    }
  }
}