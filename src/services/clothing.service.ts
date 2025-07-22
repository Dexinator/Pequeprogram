import { pool } from '../db';

export interface ClothingPrice {
  id: number;
  category_group: string;
  garment_type: string;
  quality_level: string;
  purchase_price: number;
  sale_price: number;
  is_active: boolean;
}

export interface ClothingSize {
  id: number;
  category_group: string;
  size_value: string;
  display_order: number;
}

export class ClothingService {

  async getClothingPrices(categoryGroup?: string): Promise<ClothingPrice[]> {
    try {
      let query = 'SELECT * FROM clothing_valuation_prices WHERE is_active = TRUE';
      const params: any[] = [];

      if (categoryGroup) {
        query += ' AND category_group = $1';
        params.push(categoryGroup);
      }

      query += ' ORDER BY category_group, garment_type, quality_level';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting clothing prices:', error);
      throw error;
    }
  }

  async getClothingPriceByType(
    categoryGroup: string,
    garmentType: string,
    qualityLevel: string
  ): Promise<ClothingPrice | null> {
    try {
      const query = `
        SELECT * FROM clothing_valuation_prices 
        WHERE is_active = TRUE 
        AND category_group = $1 
        AND garment_type = $2 
        AND quality_level = $3
      `;

      const result = await pool.query(query, [categoryGroup, garmentType, qualityLevel]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting clothing price by type:', error);
      throw error;
    }
  }

  async getGarmentTypes(categoryGroup: string): Promise<string[]> {
    try {
      const query = `
        SELECT DISTINCT garment_type 
        FROM clothing_valuation_prices 
        WHERE is_active = TRUE 
        AND category_group = $1 
        ORDER BY garment_type
      `;

      const result = await pool.query(query, [categoryGroup]);
      return result.rows.map(row => row.garment_type);
    } catch (error) {
      console.error('Error getting garment types:', error);
      throw error;
    }
  }

  async getClothingSizes(categoryGroup: string): Promise<ClothingSize[]> {
    try {
      // For general clothing, use 'general' group, for shoes use 'calzado', etc.
      const group = categoryGroup === 'calzado' ? 'calzado' : 
                    categoryGroup === 'dama_maternidad' ? 'dama_maternidad' : 
                    'general';

      const query = `
        SELECT * FROM clothing_sizes 
        WHERE category_group = $1 
        ORDER BY display_order
      `;

      const result = await pool.query(query, [group]);
      return result.rows;
    } catch (error) {
      console.error('Error getting clothing sizes:', error);
      throw error;
    }
  }

  async isClothingCategory(subcategoryId: number): Promise<boolean> {
    try {
      const query = `
        SELECT is_clothing 
        FROM subcategories 
        WHERE id = $1
      `;

      const result = await pool.query(query, [subcategoryId]);
      return result.rows[0]?.is_clothing || false;
    } catch (error) {
      console.error('Error checking if clothing category:', error);
      throw error;
    }
  }

  async getCategoryGroupBySubcategory(subcategoryId: number): Promise<string | null> {
    try {
      const query = `
        SELECT s.name 
        FROM subcategories s 
        WHERE s.id = $1
      `;

      const result = await pool.query(query, [subcategoryId]);
      if (!result.rows[0]) return null;

      const subcategoryName = result.rows[0].name.toLowerCase();

      // Map subcategory names to category groups
      if (subcategoryName.includes('cuerpo completo')) {
        return 'cuerpo_completo';
      } else if (subcategoryName.includes('arriba de cintura')) {
        return 'arriba_cintura';
      } else if (subcategoryName.includes('abajo de cintura')) {
        return 'abajo_cintura';
      } else if (subcategoryName.includes('calzado')) {
        return 'calzado';
      } else if (subcategoryName.includes('dama') || subcategoryName.includes('maternidad')) {
        return 'dama_maternidad';
      }

      return null;
    } catch (error) {
      console.error('Error getting category group:', error);
      throw error;
    }
  }

  async calculateClothingValuation(
    subcategoryId: number,
    garmentType: string,
    qualityLevel: string,
    status: string,
    conditionState: string,
    demand: string,
    cleanliness: string
  ): Promise<{
    purchasePrice: number;
    suggestedSalePrice: number;
    storeCreditPrice: number;
    consignmentPrice: number;
  }> {
    try {
      // Get category group
      const categoryGroup = await this.getCategoryGroupBySubcategory(subcategoryId);
      if (!categoryGroup) {
        throw new Error('Invalid clothing subcategory');
      }

      // Get fixed purchase and sale prices
      const clothingPrice = await this.getClothingPriceByType(
        categoryGroup,
        garmentType,
        qualityLevel
      );

      if (!clothingPrice) {
        throw new Error('No price found for this clothing configuration');
      }

      const purchasePrice = clothingPrice.purchase_price;
      const suggestedSalePrice = clothingPrice.sale_price; // Now using predefined sale price

      // Calculate store credit and consignment prices based on purchase price
      const storeCreditPrice = purchasePrice * 1.1; // +10%
      const consignmentPrice = purchasePrice * 1.2; // +20%

      return {
        purchasePrice: Math.round(purchasePrice * 100) / 100,
        suggestedSalePrice: Math.round(suggestedSalePrice * 100) / 100,
        storeCreditPrice: Math.round(storeCreditPrice * 100) / 100,
        consignmentPrice: Math.round(consignmentPrice * 100) / 100
      };
    } catch (error) {
      console.error('Error calculating clothing valuation:', error);
      throw error;
    }
  }
}