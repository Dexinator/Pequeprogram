import { PoolClient } from 'pg';
import {
  Return,
  CreateReturnDto,
  ReturnQueryParams,
  ReturnableSale,
} from '../models/returns.model';
import { pool } from '../db';
import { BusinessError } from '../utils/errors';

export class ReturnsService {
  /**
   * Arma la pantalla de devolución a partir de una venta: sus renglones con
   * cuánto se vendió, cuánto ya se devolvió y cuánto queda por devolver.
   */
  async getSaleForReturn(saleId: number): Promise<ReturnableSale | null> {
    const dbClient = await pool.connect();
    try {
      const saleResult = await dbClient.query(
        `SELECT s.id, s.sale_date, s.client_id, s.total_amount,
                COALESCE(c.name, s.client_name) AS client_name
         FROM sales s
         LEFT JOIN clients c ON c.id = s.client_id
         WHERE s.id = $1`,
        [saleId]
      );
      if (saleResult.rows.length === 0) return null;
      const sale = saleResult.rows[0];

      // Renglones con lo ya devuelto. El LEFT JOIN agregado evita traer las
      // devoluciones por separado y restar en memoria.
      const itemsResult = await dbClient.query(
        `SELECT
           si.id   AS sale_item_id,
           si.inventario_id,
           si.quantity_sold,
           si.unit_price,
           COALESCE(ret.devuelto, 0)::int AS quantity_returned,
           COALESCE(sc.name, oi.product_name, si.inventario_id) AS description
         FROM sale_items si
         LEFT JOIN (
           SELECT sale_item_id, SUM(quantity_returned) AS devuelto
           FROM return_items
           GROUP BY sale_item_id
         ) ret ON ret.sale_item_id = si.id
         LEFT JOIN inventario i        ON i.id = si.inventario_id
         LEFT JOIN valuation_items vi  ON vi.id = i.valuation_item_id
         LEFT JOIN subcategories sc    ON sc.id = vi.subcategory_id
         LEFT JOIN otherprods_items oi ON oi.sku = si.inventario_id
         WHERE si.sale_id = $1
         ORDER BY si.id`,
        [saleId]
      );

      const paymentsResult = await dbClient.query(
        'SELECT payment_method, amount FROM payment_details WHERE sale_id = $1',
        [saleId]
      );

      const previousResult = await dbClient.query(
        `SELECT id, return_date, total_amount, refund_method
         FROM returns WHERE sale_id = $1 ORDER BY return_date DESC`,
        [saleId]
      );

      return {
        sale_id: sale.id,
        sale_date: sale.sale_date,
        client_id: sale.client_id,
        client_name: sale.client_name,
        total_amount: parseFloat(sale.total_amount),
        payments: paymentsResult.rows.map(p => ({
          payment_method: p.payment_method,
          amount: parseFloat(p.amount),
        })),
        items: itemsResult.rows.map(r => ({
          sale_item_id: r.sale_item_id,
          inventario_id: r.inventario_id,
          description: r.description,
          quantity_sold: parseInt(r.quantity_sold),
          quantity_returned: r.quantity_returned,
          quantity_returnable: parseInt(r.quantity_sold) - r.quantity_returned,
          unit_price: parseFloat(r.unit_price),
        })),
        previous_returns: previousResult.rows.map(r => ({
          id: r.id,
          return_date: r.return_date,
          total_amount: parseFloat(r.total_amount),
          refund_method: r.refund_method,
        })),
      };
    } finally {
      dbClient.release();
    }
  }

  /**
   * Registra una devolución. Todo ocurre en una transacción: si algo falla,
   * no queda ni la devolución, ni el stock movido, ni el crédito abonado.
   *
   * La venta original NO se toca: es histórico.
   */
  async createReturn(userId: number, data: CreateReturnDto): Promise<Return> {
    if (!data.items || data.items.length === 0) {
      throw new BusinessError('Debe indicar al menos un artículo a devolver');
    }

    const dbClient = await pool.connect();
    try {
      await dbClient.query('BEGIN');

      const saleResult = await dbClient.query(
        'SELECT id, client_id, location FROM sales WHERE id = $1',
        [data.sale_id]
      );
      if (saleResult.rows.length === 0) {
        throw new BusinessError('La venta indicada no existe');
      }
      const sale = saleResult.rows[0];

      // Validar cada renglón contra lo vendido y lo ya devuelto. Se bloquea la
      // fila (FOR UPDATE) para que dos devoluciones simultáneas del mismo
      // ticket no puedan pasarse del total vendido.
      let totalAmount = 0;
      const validated: {
        sale_item_id: number;
        inventario_id: string;
        quantity: number;
        unit_price: number;
        total: number;
        restocked: boolean;
        condition_notes: string | null;
      }[] = [];

      for (const item of data.items) {
        const rowResult = await dbClient.query(
          `SELECT si.id, si.inventario_id, si.quantity_sold, si.unit_price,
                  COALESCE((SELECT SUM(quantity_returned) FROM return_items ri
                             WHERE ri.sale_item_id = si.id), 0)::int AS ya_devuelto
             FROM sale_items si
            WHERE si.id = $1 AND si.sale_id = $2
            FOR UPDATE OF si`,
          [item.sale_item_id, data.sale_id]
        );

        if (rowResult.rows.length === 0) {
          throw new BusinessError(`El artículo ${item.sale_item_id} no pertenece a esta venta`);
        }

        const row = rowResult.rows[0];
        const cantidad = parseInt(String(item.quantity_returned));
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
          throw new BusinessError('La cantidad a devolver debe ser mayor a cero');
        }

        const disponible = parseInt(row.quantity_sold) - row.ya_devuelto;
        if (cantidad > disponible) {
          throw new BusinessError(
            `No se puede devolver ${cantidad} de ${row.inventario_id}: se vendieron ${row.quantity_sold} y ya se devolvieron ${row.ya_devuelto}`
          );
        }

        const unitPrice = parseFloat(row.unit_price);
        const total = Math.round(unitPrice * cantidad * 100) / 100;
        totalAmount += total;

        validated.push({
          sale_item_id: row.id,
          inventario_id: row.inventario_id,
          quantity: cantidad,
          unit_price: unitPrice,
          total,
          // Por defecto reingresa; en garantía la pantalla propone lo contrario
          restocked: item.restocked !== false,
          condition_notes: item.condition_notes || null,
        });
      }

      totalAmount = Math.round(totalAmount * 100) / 100;

      // Devolver en crédito exige cliente registrado: si no, no hay a quién
      // abonarle el saldo.
      if (data.refund_method === 'credito_tienda' && !sale.client_id) {
        throw new BusinessError(
          'Esta venta fue a cliente ocasional: no hay a quién abonarle el crédito. Devuelve en efectivo o registra al cliente.'
        );
      }

      const returnResult = await dbClient.query(
        `INSERT INTO returns
           (sale_id, client_id, user_id, total_amount, return_type, refund_method,
            location, reason, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          data.sale_id,
          sale.client_id || null,
          userId,
          totalAmount,
          data.return_type,
          data.refund_method,
          data.location || sale.location || null,
          data.reason || null,
          data.notes || null,
        ]
      );
      const devolucion = returnResult.rows[0];

      for (const v of validated) {
        await dbClient.query(
          `INSERT INTO return_items
             (return_id, sale_item_id, inventario_id, quantity_returned,
              unit_price, total_price, restocked, condition_notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [devolucion.id, v.sale_item_id, v.inventario_id, v.quantity, v.unit_price, v.total, v.restocked, v.condition_notes]
        );

        // Regresar al inventario solo lo que vuelve a venderse. Es el mismo
        // UPDATE que hace una venta, en sentido inverso.
        if (v.restocked) {
          await dbClient.query(
            'UPDATE inventario SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2',
            [v.quantity, v.inventario_id]
          );
        }
      }

      // Devolución en crédito: se abona al saldo del cliente y queda el
      // movimiento auditado, igual que cualquier otro ajuste.
      if (data.refund_method === 'credito_tienda' && sale.client_id) {
        const creditResult = await dbClient.query(
          'UPDATE clients SET store_credit = store_credit + $1, updated_at = NOW() WHERE id = $2 RETURNING store_credit',
          [totalAmount, sale.client_id]
        );
        const balanceAfter = parseFloat(creditResult.rows[0].store_credit);

        await dbClient.query(
          `INSERT INTO client_credit_movements
             (client_id, user_id, movement_type, amount, balance_after, sale_id, reason, notes)
           VALUES ($1, $2, 'sale_refund', $3, $4, $5, $6, $7)`,
          [
            sale.client_id,
            userId,
            totalAmount,
            balanceAfter,
            data.sale_id,
            `Devolución de la venta #${data.sale_id}`,
            data.reason || null,
          ]
        );
      }

      await dbClient.query('COMMIT');

      return { ...devolucion, total_amount: parseFloat(devolucion.total_amount) };
    } catch (error) {
      await dbClient.query('ROLLBACK');
      throw error;
    } finally {
      dbClient.release();
    }
  }

  async getReturns(params: ReturnQueryParams): Promise<{ returns: Return[]; total: number }> {
    const dbClient = await pool.connect();
    try {
      const where: string[] = ['1=1'];
      const values: any[] = [];

      const add = (clause: string, value: any) => {
        values.push(value);
        where.push(clause.replace('?', `$${values.length}`));
      };

      if (params.sale_id) add('r.sale_id = ?', params.sale_id);
      if (params.client_id) add('r.client_id = ?', params.client_id);
      if (params.return_type) add('r.return_type = ?', params.return_type);
      if (params.refund_method) add('r.refund_method = ?', params.refund_method);
      if (params.location) add('r.location = ?', params.location);
      if (params.start_date) add('r.return_date >= ?', params.start_date);
      if (params.end_date) add('r.return_date <= ?', `${params.end_date} 23:59:59`);

      const whereSql = where.join(' AND ');

      const countResult = await dbClient.query(
        `SELECT COUNT(*)::int AS total FROM returns r WHERE ${whereSql}`,
        values
      );
      const total = countResult.rows[0]?.total || 0;

      const page = params.page && params.page > 0 ? params.page : 1;
      const limit = params.limit && params.limit > 0 ? params.limit : 20;

      const listResult = await dbClient.query(
        `SELECT r.*,
                COALESCE(c.name, s.client_name) AS client_name,
                TRIM(CONCAT(u.first_name, ' ', u.last_name)) AS user_name,
                (SELECT COUNT(*)::int FROM return_items ri WHERE ri.return_id = r.id) AS items_count
         FROM returns r
         LEFT JOIN clients c ON c.id = r.client_id
         LEFT JOIN sales s   ON s.id = r.sale_id
         LEFT JOIN users u   ON u.id = r.user_id
         WHERE ${whereSql}
         ORDER BY r.return_date DESC
         LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, limit, (page - 1) * limit]
      );

      return {
        returns: listResult.rows.map(r => ({ ...r, total_amount: parseFloat(r.total_amount) })),
        total,
      };
    } finally {
      dbClient.release();
    }
  }

  async getReturnById(id: number): Promise<Return | null> {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        `SELECT r.*,
                COALESCE(c.name, s.client_name) AS client_name,
                TRIM(CONCAT(u.first_name, ' ', u.last_name)) AS user_name
         FROM returns r
         LEFT JOIN clients c ON c.id = r.client_id
         LEFT JOIN sales s   ON s.id = r.sale_id
         LEFT JOIN users u   ON u.id = r.user_id
         WHERE r.id = $1`,
        [id]
      );
      if (result.rows.length === 0) return null;

      const itemsResult = await dbClient.query(
        `SELECT ri.*,
                COALESCE(sc.name, oi.product_name, ri.inventario_id) AS description
           FROM return_items ri
           LEFT JOIN inventario i        ON i.id = ri.inventario_id
           LEFT JOIN valuation_items vi  ON vi.id = i.valuation_item_id
           LEFT JOIN subcategories sc    ON sc.id = vi.subcategory_id
           LEFT JOIN otherprods_items oi ON oi.sku = ri.inventario_id
          WHERE ri.return_id = $1
          ORDER BY ri.id`,
        [id]
      );

      return {
        ...result.rows[0],
        total_amount: parseFloat(result.rows[0].total_amount),
        items: itemsResult.rows.map(it => ({
          ...it,
          quantity_returned: parseInt(it.quantity_returned),
          unit_price: parseFloat(it.unit_price),
          total_price: parseFloat(it.total_price),
        })),
      };
    } finally {
      dbClient.release();
    }
  }

  /** Totales para el encabezado del historial de devoluciones. */
  async getReturnsStats(): Promise<any> {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        `SELECT
           COUNT(*)::int                                                              AS total_returns,
           COALESCE(SUM(total_amount), 0)                                             AS total_amount,
           COALESCE(SUM(total_amount) FILTER (WHERE refund_method = 'efectivo'), 0)   AS total_cash,
           COALESCE(SUM(total_amount) FILTER (WHERE refund_method = 'tarjeta'), 0)    AS total_card,
           COALESCE(SUM(total_amount) FILTER (WHERE refund_method = 'credito_tienda'), 0) AS total_credit,
           COUNT(*) FILTER (WHERE return_type = 'garantia')::int                      AS garantias,
           COUNT(*) FILTER (WHERE return_date >= date_trunc('month', NOW()))::int     AS este_mes
         FROM returns`
      );
      const r = result.rows[0];
      return {
        total_returns: r.total_returns,
        total_amount: parseFloat(r.total_amount),
        total_cash: parseFloat(r.total_cash),
        total_card: parseFloat(r.total_card),
        total_credit: parseFloat(r.total_credit),
        garantias: r.garantias,
        este_mes: r.este_mes,
      };
    } finally {
      dbClient.release();
    }
  }
}

export const returnsService = new ReturnsService();
