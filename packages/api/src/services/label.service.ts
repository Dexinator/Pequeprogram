import { PoolClient } from 'pg';
import { pool } from '../db';
import config from '../config';
import { LabelPayloadV1, LabelModality } from '../models/label.model';
import { buildProductDescription, OfferFeatureDef } from '../utils/product-description';

const SIZE_FEATURE_KEYS = ['talla', 'size'];

export class LabelService {
  async buildLabelPayload(inventoryId: string): Promise<LabelPayloadV1 | null> {
    const dbClient = await pool.connect();
    try {
      const row = await this.fetchInventoryRow(dbClient, inventoryId);
      if (!row) return null;

      const offerDefs = row.subcategory_id
        ? await this.fetchOfferFeatureKeys(dbClient, row.subcategory_id)
        : [];

      const description = buildProductDescription({
        sku: row.id,
        subcategoryName: row.subcategory_name,
        categoryName: row.category_name,
        brandName: row.brand_name,
        features: row.features,
        offerFeatureDefs: offerDefs,
        otrProductName: row.otr_product_name,
      });

      const priceAmount = this.resolvePrice(row);

      return {
        version: 1,
        business_name: config.business.name,
        sku: row.id,
        description,
        brand: this.cleanBrand(row.brand_name),
        size: this.extractSize(row.features),
        price: {
          amount: priceAmount,
          currency: 'MXN',
          formatted: this.formatPrice(priceAmount),
        },
        modality: this.mapModality(row.modality, row.id),
        barcode: {
          value: row.id,
          format: 'CODE128',
        },
      };
    } finally {
      dbClient.release();
    }
  }

  private async fetchInventoryRow(
    dbClient: PoolClient,
    inventoryId: string
  ): Promise<any | null> {
    const query = `
      SELECT
        i.id,
        i.quantity,
        i.location,
        vi.subcategory_id,
        vi.modality,
        vi.features,
        vi.final_sale_price,
        sub.name AS subcategory_name,
        cat.name AS category_name,
        b.name   AS brand_name,
        oi.product_name    AS otr_product_name,
        oi.sale_unit_price AS otr_sale_price
      FROM inventario i
      LEFT JOIN valuation_items  vi  ON i.valuation_item_id = vi.id
      LEFT JOIN subcategories    sub ON vi.subcategory_id   = sub.id
      LEFT JOIN categories       cat ON vi.category_id      = cat.id
      LEFT JOIN brands           b   ON vi.brand_id         = b.id
      LEFT JOIN otherprods_items oi  ON i.id = oi.sku
      WHERE i.id = $1
      LIMIT 1
    `;
    const result = await dbClient.query(query, [inventoryId]);
    return result.rows[0] || null;
  }

  private async fetchOfferFeatureKeys(
    dbClient: PoolClient,
    subcategoryId: number
  ): Promise<OfferFeatureDef[]> {
    const result = await dbClient.query(
      `SELECT name, display_name, order_index
       FROM feature_definitions
       WHERE subcategory_id = $1 AND offer_print = TRUE
       ORDER BY order_index`,
      [subcategoryId]
    );
    return result.rows.map(r => ({
      key: r.name,
      displayName: r.display_name,
      orderIndex: r.order_index,
    }));
  }

  private resolvePrice(row: any): number {
    if (typeof row.id === 'string' && row.id.startsWith('OTRP')) {
      return parseFloat(row.otr_sale_price) || 0;
    }
    return parseFloat(row.final_sale_price) || 0;
  }

  private formatPrice(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  private cleanBrand(brand: string | null | undefined): string | null {
    if (!brand) return null;
    const lower = brand.toLowerCase();
    if (lower === 'sin marca' || lower === 'genérica' || lower === 'generica') return null;
    return brand;
  }

  private extractSize(features: Record<string, any> | null | undefined): string | null {
    if (!features || typeof features !== 'object') return null;
    for (const key of SIZE_FEATURE_KEYS) {
      const value = features[key];
      if (value !== undefined && value !== null && value !== '') {
        return `Talla ${value}`;
      }
    }
    return null;
  }

  private mapModality(modality: string | null | undefined, sku: string): LabelModality {
    if (typeof sku === 'string' && sku.startsWith('OTRP')) return 'otros';
    if (!modality) return 'desconocida';
    const lower = modality.toLowerCase();
    if (lower.includes('consignaci')) return 'consignacion';
    if (lower.includes('crédito') || lower.includes('credito')) return 'credito_tienda';
    if (lower.includes('compra')) return 'compra';
    return 'desconocida';
  }
}
