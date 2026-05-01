import { PoolClient } from 'pg';
import { pool } from '../db';
import config from '../config';
import {
  TicketPayloadV1,
  TicketItem,
  TicketPayment,
} from '../models/ticket.model';

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  credito_tienda: 'Crédito en tienda',
  mixto: 'Pago mixto',
};

const GENERIC_BRAND_NAMES = new Set([
  'sin marca',
  'genérica',
  'generica',
]);

export class TicketService {
  async buildTicketPayload(saleId: number): Promise<TicketPayloadV1 | null> {
    const dbClient = await pool.connect();
    try {
      const saleRow = await this.fetchSale(dbClient, saleId);
      if (!saleRow) return null;

      const items = await this.fetchItems(dbClient, saleId);
      const payments = await this.fetchPayments(dbClient, saleId);
      const storeCredit = saleRow.client_id
        ? await this.fetchStoreCredit(dbClient, saleRow.client_id)
        : null;

      return {
        version: 1,
        business: {
          name: config.business.name,
          address: config.business.address,
          phone: config.business.phone,
          rfc: config.business.rfc,
          website: config.business.website,
          logo_url: config.business.logoUrl,
          footer_lines: config.business.footerLines,
        },
        sale: {
          id: saleRow.id,
          date: new Date(saleRow.sale_date).toISOString(),
          location: saleRow.location,
          cashier: this.formatCashier(saleRow.cashier_first_name, saleRow.cashier_last_name),
          barcode: {
            value: this.encodeSaleBarcode(saleRow.id),
            format: 'CODE128',
          },
        },
        client: saleRow.client_id
          ? {
              id: saleRow.client_id,
              name: saleRow.client_registered_name || saleRow.client_name || 'Cliente',
              phone: saleRow.client_phone || null,
            }
          : saleRow.client_name
          ? { id: null, name: saleRow.client_name, phone: null }
          : null,
        items,
        totals: {
          items_count: items.reduce((sum, it) => sum + it.quantity, 0),
          subtotal: items.reduce((sum, it) => sum + it.total, 0),
          total: parseFloat(saleRow.total_amount),
        },
        payments,
        store_credit_remaining: storeCredit,
        notes: saleRow.notes || null,
      };
    } finally {
      dbClient.release();
    }
  }

  private async fetchSale(dbClient: PoolClient, saleId: number): Promise<any | null> {
    const query = `
      SELECT
        s.id,
        s.client_id,
        s.client_name,
        s.sale_date,
        s.total_amount,
        s.location,
        s.notes,
        u.first_name AS cashier_first_name,
        u.last_name  AS cashier_last_name,
        c.name       AS client_registered_name,
        c.phone      AS client_phone
      FROM sales s
      LEFT JOIN users  u ON s.user_id = u.id
      LEFT JOIN clients c ON s.client_id = c.id
      WHERE s.id = $1
    `;
    const result = await dbClient.query(query, [saleId]);
    return result.rows[0] || null;
  }

  private async fetchItems(dbClient: PoolClient, saleId: number): Promise<TicketItem[]> {
    const query = `
      SELECT
        si.inventario_id          AS sku,
        si.quantity_sold,
        si.unit_price,
        si.total_price,
        sub.id                    AS subcategory_id,
        sub.name                  AS subcategory_name,
        cat.name                  AS category_name,
        b.name                    AS brand_name,
        vi.features               AS features,
        oi.product_name           AS otr_product_name
      FROM sale_items si
      LEFT JOIN inventario       i   ON si.inventario_id = i.id
      LEFT JOIN valuation_items  vi  ON i.valuation_item_id = vi.id
      LEFT JOIN subcategories    sub ON vi.subcategory_id = sub.id
      LEFT JOIN categories       cat ON vi.category_id    = cat.id
      LEFT JOIN brands           b   ON vi.brand_id       = b.id
      LEFT JOIN otherprods_items oi  ON i.id = oi.sku
      WHERE si.sale_id = $1
      ORDER BY si.created_at ASC
    `;
    const result = await dbClient.query(query, [saleId]);

    const subcategoryIds = Array.from(
      new Set(
        result.rows
          .map(r => r.subcategory_id)
          .filter((id): id is number => typeof id === 'number')
      )
    );
    const offerFeatureKeysBySubcategory = await this.fetchOfferFeatureKeys(
      dbClient,
      subcategoryIds
    );

    return result.rows.map(row => ({
      sku: row.sku,
      description: this.buildItemDescription(row, offerFeatureKeysBySubcategory),
      quantity: parseInt(row.quantity_sold, 10),
      unit_price: parseFloat(row.unit_price),
      total: parseFloat(row.total_price),
    }));
  }

  private async fetchOfferFeatureKeys(
    dbClient: PoolClient,
    subcategoryIds: number[]
  ): Promise<Map<number, Array<{ key: string; displayName: string; orderIndex: number }>>> {
    const result = new Map<
      number,
      Array<{ key: string; displayName: string; orderIndex: number }>
    >();
    if (subcategoryIds.length === 0) return result;

    const query = `
      SELECT subcategory_id, name, display_name, order_index
      FROM feature_definitions
      WHERE subcategory_id = ANY($1::int[])
        AND offer_print = TRUE
      ORDER BY subcategory_id, order_index
    `;
    const queryResult = await dbClient.query(query, [subcategoryIds]);

    for (const row of queryResult.rows) {
      const list = result.get(row.subcategory_id) || [];
      list.push({
        key: row.name,
        displayName: row.display_name,
        orderIndex: row.order_index,
      });
      result.set(row.subcategory_id, list);
    }
    return result;
  }

  private buildItemDescription(
    row: any,
    offerFeatureKeysBySubcategory: Map<
      number,
      Array<{ key: string; displayName: string; orderIndex: number }>
    >
  ): string {
    if (typeof row.sku === 'string' && row.sku.startsWith('OTRP')) {
      return row.otr_product_name || `Producto ${row.sku}`;
    }

    const parts: string[] = [];
    const baseName = row.subcategory_name || row.category_name || 'Artículo';
    parts.push(baseName);

    const featureKeys = offerFeatureKeysBySubcategory.get(row.subcategory_id) || [];
    if (featureKeys.length > 0 && row.features && typeof row.features === 'object') {
      const featureBits: string[] = [];
      for (const def of featureKeys) {
        const raw = row.features[def.key];
        if (raw === undefined || raw === null || raw === '') continue;
        featureBits.push(this.formatFeatureValue(def.key, def.displayName, raw));
      }
      if (featureBits.length > 0) {
        parts.push(featureBits.join(', '));
      }
    }

    if (row.brand_name && !GENERIC_BRAND_NAMES.has(String(row.brand_name).toLowerCase())) {
      parts.push(row.brand_name);
    }

    return parts.join(' · ');
  }

  private formatFeatureValue(key: string, displayName: string, value: any): string {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'talla' || lowerKey === 'size') return `Talla ${value}`;
    if (lowerKey === 'edad') return `${value}`;
    if (lowerKey === 'color') return `${value}`;
    return `${displayName}: ${value}`;
  }

  private async fetchPayments(dbClient: PoolClient, saleId: number): Promise<TicketPayment[]> {
    const query = `
      SELECT payment_method, amount, notes
      FROM payment_details
      WHERE sale_id = $1
      ORDER BY created_at ASC
    `;
    const result = await dbClient.query(query, [saleId]);
    return result.rows.map(row => ({
      method: row.payment_method,
      label: PAYMENT_LABELS[row.payment_method] || row.payment_method,
      amount: parseFloat(row.amount),
      notes: row.notes || null,
    }));
  }

  private async fetchStoreCredit(dbClient: PoolClient, clientId: number): Promise<number | null> {
    const result = await dbClient.query(
      'SELECT store_credit FROM clients WHERE id = $1',
      [clientId]
    );
    if (result.rows.length === 0) return null;
    return parseFloat(result.rows[0].store_credit) || 0;
  }

  private formatCashier(firstName?: string | null, lastName?: string | null): string {
    return [firstName, lastName].filter(Boolean).join(' ') || 'Sistema';
  }

  private encodeSaleBarcode(saleId: number): string {
    return `EPV-${String(saleId).padStart(8, '0')}`;
  }
}
