import { PoolClient } from 'pg';
import {
  Layaway,
  CreateLayawayDto,
  AddLayawayPaymentDto,
  CancelLayawayDto,
  LayawayQueryParams,
} from '../models/layaway.model';
import { pool } from '../db';
import { BusinessError } from '../utils/errors';
import { SalesService } from './sales.service';

const salesService = new SalesService();

const round2 = (n: number) => Math.round(n * 100) / 100;

export class LayawayService {
  /**
   * Aparta artículos reservándolos con un anticipo.
   *
   * **Descuenta el stock de inmediato**, igual que una venta. Sin eso el
   * artículo seguiría apareciendo disponible y podría venderse otra vez, en
   * mostrador o en la tienda en línea.
   */
  async createLayaway(userId: number, data: CreateLayawayDto): Promise<Layaway> {
    if (!data.items || data.items.length === 0) {
      throw new BusinessError('Debe apartar al menos un artículo');
    }
    if (!data.client_id) {
      throw new BusinessError(
        'Un apartado necesita cliente registrado: sin él no hay a quién cobrarle el resto ni a quién devolverle el anticipo'
      );
    }

    const dbClient = await pool.connect();
    try {
      await dbClient.query('BEGIN');

      const clientResult = await dbClient.query(
        'SELECT id, store_credit FROM clients WHERE id = $1',
        [data.client_id]
      );
      if (clientResult.rows.length === 0) {
        throw new BusinessError('El cliente especificado no existe');
      }

      // Validar y bloquear existencias. El FOR UPDATE evita que dos cajeras
      // aparten el mismo artículo al mismo tiempo.
      let totalAmount = 0;
      for (const item of data.items) {
        const stockResult = await dbClient.query(
          'SELECT quantity FROM inventario WHERE id = $1 FOR UPDATE',
          [item.inventario_id]
        );
        if (stockResult.rows.length === 0) {
          throw new BusinessError(`Producto ${item.inventario_id} no encontrado en inventario`);
        }
        const disponible = parseInt(stockResult.rows[0].quantity);
        if (disponible < item.quantity) {
          throw new BusinessError(
            `Stock insuficiente para ${item.inventario_id}. Disponible: ${disponible}, solicitado: ${item.quantity}`
          );
        }
        totalAmount += item.unit_price * item.quantity;
      }
      totalAmount = round2(totalAmount);

      const deposit = round2(Number(data.deposit_amount) || 0);
      if (deposit < 0) {
        throw new BusinessError('El anticipo no puede ser negativo');
      }
      if (deposit > totalAmount) {
        throw new BusinessError(
          `El anticipo (${deposit}) no puede ser mayor al total del apartado (${totalAmount})`
        );
      }

      // Si el anticipo se paga con crédito de tienda hay que validarlo y
      // descontarlo, igual que en una venta.
      const depositMethod = data.deposit_method || 'efectivo';
      if (deposit > 0 && depositMethod === 'credito_tienda') {
        const saldo = parseFloat(clientResult.rows[0].store_credit) || 0;
        if (deposit > saldo) {
          throw new BusinessError(
            `Crédito insuficiente. Disponible: $${saldo.toFixed(2)}, solicitado: $${deposit.toFixed(2)}`
          );
        }
      }

      const layawayResult = await dbClient.query(
        `INSERT INTO layaways
           (client_id, user_id, location, total_amount, paid_amount, status, due_date, notes)
         VALUES ($1, $2, $3, $4, $5, 'active', $6, $7)
         RETURNING *`,
        [
          data.client_id,
          userId,
          data.location || 'Polanco',
          totalAmount,
          deposit,
          data.due_date || null,
          data.notes || null,
        ]
      );
      const layaway = layawayResult.rows[0];

      for (const item of data.items) {
        const totalPrice = round2(item.unit_price * item.quantity);
        await dbClient.query(
          `INSERT INTO layaway_items (layaway_id, inventario_id, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [layaway.id, item.inventario_id, item.quantity, item.unit_price, totalPrice]
        );

        // Aquí es donde el artículo sale del inventario disponible
        await dbClient.query(
          'UPDATE inventario SET quantity = quantity - $1, updated_at = NOW() WHERE id = $2',
          [item.quantity, item.inventario_id]
        );
      }

      if (deposit > 0) {
        await dbClient.query(
          `INSERT INTO layaway_payments (layaway_id, user_id, payment_method, amount, notes)
           VALUES ($1, $2, $3, $4, $5)`,
          [layaway.id, userId, depositMethod, deposit, 'Anticipo inicial']
        );

        if (depositMethod === 'credito_tienda') {
          await this.moverCredito(dbClient, data.client_id, userId, -deposit,
            `Anticipo del apartado #${layaway.id}`);
        }
      }

      await dbClient.query('COMMIT');
      return this.hydrate(layaway);
    } catch (error) {
      await dbClient.query('ROLLBACK');
      throw error;
    } finally {
      dbClient.release();
    }
  }

  /**
   * Registra un abono. Si con él se cubre el total, el apartado se liquida
   * solo: se convierte en venta sin volver a descontar stock.
   */
  async addPayment(userId: number, layawayId: number, data: AddLayawayPaymentDto): Promise<Layaway> {
    const amount = round2(Number(data.amount) || 0);
    if (amount <= 0) {
      throw new BusinessError('El abono debe ser mayor a cero');
    }

    const dbClient = await pool.connect();
    try {
      await dbClient.query('BEGIN');

      const result = await dbClient.query(
        'SELECT * FROM layaways WHERE id = $1 FOR UPDATE',
        [layawayId]
      );
      if (result.rows.length === 0) {
        throw new BusinessError('El apartado no existe');
      }
      const layaway = result.rows[0];

      if (layaway.status !== 'active') {
        throw new BusinessError(
          layaway.status === 'completed'
            ? 'Este apartado ya está liquidado'
            : 'Este apartado está cancelado'
        );
      }

      const pagado = parseFloat(layaway.paid_amount) || 0;
      const total = parseFloat(layaway.total_amount) || 0;
      const resta = round2(total - pagado);

      if (amount > resta) {
        throw new BusinessError(
          `El abono (${amount}) excede lo que falta por pagar (${resta})`
        );
      }

      if (data.payment_method === 'credito_tienda') {
        const saldoResult = await dbClient.query(
          'SELECT store_credit FROM clients WHERE id = $1 FOR UPDATE',
          [layaway.client_id]
        );
        const saldo = parseFloat(saldoResult.rows[0]?.store_credit) || 0;
        if (amount > saldo) {
          throw new BusinessError(
            `Crédito insuficiente. Disponible: $${saldo.toFixed(2)}, solicitado: $${amount.toFixed(2)}`
          );
        }
        await this.moverCredito(dbClient, layaway.client_id, userId, -amount,
          `Abono al apartado #${layawayId}`);
      }

      await dbClient.query(
        `INSERT INTO layaway_payments (layaway_id, user_id, payment_method, amount, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [layawayId, userId, data.payment_method, amount, data.notes || null]
      );

      const nuevoPagado = round2(pagado + amount);
      await dbClient.query(
        'UPDATE layaways SET paid_amount = $1, updated_at = NOW() WHERE id = $2',
        [nuevoPagado, layawayId]
      );

      // Liquidado: se vuelve venta real para que aparezca en historial y
      // estadísticas, sin volver a descontar stock (ya salió al apartar).
      if (nuevoPagado >= total - 0.01) {
        await this.completar(dbClient, userId, layawayId);
      }

      await dbClient.query('COMMIT');
      return (await this.getLayawayById(layawayId)) as Layaway;
    } catch (error) {
      await dbClient.query('ROLLBACK');
      throw error;
    } finally {
      dbClient.release();
    }
  }

  /** Convierte el apartado liquidado en una venta. Corre dentro de una transacción. */
  private async completar(dbClient: PoolClient, userId: number, layawayId: number): Promise<void> {
    const layawayResult = await dbClient.query('SELECT * FROM layaways WHERE id = $1', [layawayId]);
    const layaway = layawayResult.rows[0];

    const itemsResult = await dbClient.query(
      'SELECT * FROM layaway_items WHERE layaway_id = $1',
      [layawayId]
    );
    const paymentsResult = await dbClient.query(
      'SELECT payment_method, amount FROM layaway_payments WHERE layaway_id = $1 ORDER BY id',
      [layawayId]
    );
    const clientResult = await dbClient.query('SELECT name FROM clients WHERE id = $1', [layaway.client_id]);

    const payments = paymentsResult.rows.map(p => ({
      payment_method: p.payment_method,
      amount: parseFloat(p.amount),
      notes: 'Abono de apartado',
    }));

    const { sale } = await salesService.insertSaleRecord(dbClient, {
      clientId: layaway.client_id,
      clientName: clientResult.rows[0]?.name || null,
      userId,
      totalAmount: parseFloat(layaway.total_amount),
      paymentMethod: payments.length === 1 ? payments[0].payment_method : 'mixto',
      notes: `Liquidación del apartado #${layawayId}`,
      location: layaway.location,
      payments,
      items: itemsResult.rows.map(it => ({
        inventario_id: it.inventario_id,
        quantity_sold: parseInt(it.quantity),
        unit_price: parseFloat(it.unit_price),
      })),
      // El stock ya se descontó al apartar: volver a hacerlo lo dejaría en
      // negativo y descuadraría el inventario.
      updateStock: false,
    });

    await dbClient.query(
      `UPDATE layaways
          SET status = 'completed', sale_id = $1, completed_at = NOW(), updated_at = NOW()
        WHERE id = $2`,
      [sale.id, layawayId]
    );
  }

  /**
   * Cancela un apartado: el artículo regresa al inventario y la cajera decide
   * qué pasa con lo ya abonado (devolverlo en efectivo, pasarlo a crédito, o
   * que se quede la tienda).
   */
  async cancelLayaway(userId: number, layawayId: number, data: CancelLayawayDto): Promise<Layaway> {
    if (!['efectivo', 'credito_tienda', 'forfeited'].includes(data.refund_method)) {
      throw new BusinessError("Indica qué se hace con el anticipo: 'efectivo', 'credito_tienda' o 'forfeited'");
    }

    const dbClient = await pool.connect();
    try {
      await dbClient.query('BEGIN');

      const result = await dbClient.query('SELECT * FROM layaways WHERE id = $1 FOR UPDATE', [layawayId]);
      if (result.rows.length === 0) {
        throw new BusinessError('El apartado no existe');
      }
      const layaway = result.rows[0];

      if (layaway.status !== 'active') {
        throw new BusinessError(
          layaway.status === 'completed'
            ? 'Este apartado ya se liquidó: si el cliente quiere devolver, usa el módulo de Devoluciones'
            : 'Este apartado ya estaba cancelado'
        );
      }

      // Los artículos vuelven a estar disponibles
      const itemsResult = await dbClient.query(
        'SELECT inventario_id, quantity FROM layaway_items WHERE layaway_id = $1',
        [layawayId]
      );
      for (const item of itemsResult.rows) {
        await dbClient.query(
          'UPDATE inventario SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2',
          [item.quantity, item.inventario_id]
        );
      }

      const pagado = parseFloat(layaway.paid_amount) || 0;
      if (pagado > 0 && data.refund_method === 'credito_tienda') {
        await this.moverCredito(dbClient, layaway.client_id, userId, pagado,
          `Cancelación del apartado #${layawayId}`, data.reason);
      }
      // 'efectivo' queda registrado en el apartado; 'forfeited' no mueve nada

      await dbClient.query(
        `UPDATE layaways
            SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW(),
                cancel_refund_method = $1,
                notes = COALESCE(notes || E'\\n', '') || $2
          WHERE id = $3`,
        [data.refund_method, `Cancelado: ${data.reason || 'sin motivo indicado'}`, layawayId]
      );

      await dbClient.query('COMMIT');
      return (await this.getLayawayById(layawayId)) as Layaway;
    } catch (error) {
      await dbClient.query('ROLLBACK');
      throw error;
    } finally {
      dbClient.release();
    }
  }

  /** Mueve el saldo del cliente dejando el movimiento auditado. */
  private async moverCredito(
    dbClient: PoolClient,
    clientId: number,
    userId: number,
    delta: number,
    reason: string,
    notes?: string
  ): Promise<void> {
    const updated = await dbClient.query(
      'UPDATE clients SET store_credit = store_credit + $1, updated_at = NOW() WHERE id = $2 RETURNING store_credit',
      [delta, clientId]
    );
    const balanceAfter = parseFloat(updated.rows[0].store_credit);

    await dbClient.query(
      `INSERT INTO client_credit_movements
         (client_id, user_id, movement_type, amount, balance_after, reason, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        clientId,
        userId,
        delta >= 0 ? 'manual_add' : 'manual_subtract',
        delta,
        balanceAfter,
        reason,
        notes || null,
      ]
    );
  }

  private hydrate(row: any): Layaway {
    const total = parseFloat(row.total_amount) || 0;
    const paid = parseFloat(row.paid_amount) || 0;
    return {
      ...row,
      total_amount: total,
      paid_amount: paid,
      balance_due: round2(total - paid),
      is_overdue:
        row.status === 'active' && row.due_date
          ? new Date(row.due_date) < new Date(new Date().toDateString())
          : false,
    };
  }

  async getLayaways(params: LayawayQueryParams): Promise<{ layaways: Layaway[]; total: number }> {
    const dbClient = await pool.connect();
    try {
      const where: string[] = ['1=1'];
      const values: any[] = [];

      if (params.client_id) {
        values.push(params.client_id);
        where.push(`l.client_id = $${values.length}`);
      }
      if (params.status) {
        values.push(params.status);
        where.push(`l.status = $${values.length}`);
      }
      if (params.overdue) {
        where.push(`l.status = 'active' AND l.due_date IS NOT NULL AND l.due_date < CURRENT_DATE`);
      }
      if (params.search) {
        values.push(`%${params.search}%`);
        where.push(`(c.name ILIKE $${values.length} OR c.phone ILIKE $${values.length})`);
      }

      const whereSql = where.join(' AND ');

      const countResult = await dbClient.query(
        `SELECT COUNT(*)::int AS total FROM layaways l LEFT JOIN clients c ON c.id = l.client_id WHERE ${whereSql}`,
        values
      );
      const total = countResult.rows[0]?.total || 0;

      const page = params.page && params.page > 0 ? params.page : 1;
      const limit = params.limit && params.limit > 0 ? params.limit : 20;

      const listResult = await dbClient.query(
        `SELECT l.*, c.name AS client_name, c.phone AS client_phone,
                TRIM(CONCAT(u.first_name, ' ', u.last_name)) AS user_name,
                (SELECT COUNT(*)::int FROM layaway_items li WHERE li.layaway_id = l.id) AS items_count
           FROM layaways l
           LEFT JOIN clients c ON c.id = l.client_id
           LEFT JOIN users u   ON u.id = l.user_id
          WHERE ${whereSql}
          ORDER BY (l.status = 'active') DESC, l.due_date NULLS LAST, l.created_at DESC
          LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, limit, (page - 1) * limit]
      );

      return { layaways: listResult.rows.map(r => this.hydrate(r)), total };
    } finally {
      dbClient.release();
    }
  }

  async getLayawayById(id: number): Promise<Layaway | null> {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        `SELECT l.*, c.name AS client_name, c.phone AS client_phone,
                TRIM(CONCAT(u.first_name, ' ', u.last_name)) AS user_name
           FROM layaways l
           LEFT JOIN clients c ON c.id = l.client_id
           LEFT JOIN users u   ON u.id = l.user_id
          WHERE l.id = $1`,
        [id]
      );
      if (result.rows.length === 0) return null;

      const itemsResult = await dbClient.query(
        `SELECT li.*,
                COALESCE(sc.name, oi.product_name, li.inventario_id) AS description
           FROM layaway_items li
           LEFT JOIN inventario i        ON i.id = li.inventario_id
           LEFT JOIN valuation_items vi  ON vi.id = i.valuation_item_id
           LEFT JOIN subcategories sc    ON sc.id = vi.subcategory_id
           LEFT JOIN otherprods_items oi ON oi.sku = li.inventario_id
          WHERE li.layaway_id = $1
          ORDER BY li.id`,
        [id]
      );

      const paymentsResult = await dbClient.query(
        `SELECT lp.*, TRIM(CONCAT(u.first_name, ' ', u.last_name)) AS user_name
           FROM layaway_payments lp
           LEFT JOIN users u ON u.id = lp.user_id
          WHERE lp.layaway_id = $1
          ORDER BY lp.id`,
        [id]
      );

      return {
        ...this.hydrate(result.rows[0]),
        items: itemsResult.rows.map(it => ({
          ...it,
          quantity: parseInt(it.quantity),
          unit_price: parseFloat(it.unit_price),
          total_price: parseFloat(it.total_price),
        })),
        payments: paymentsResult.rows.map(p => ({ ...p, amount: parseFloat(p.amount) })),
      };
    } finally {
      dbClient.release();
    }
  }

  async getStats(): Promise<any> {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'active')::int                        AS activos,
           COALESCE(SUM(total_amount - paid_amount) FILTER (WHERE status = 'active'), 0) AS por_cobrar,
           COALESCE(SUM(paid_amount) FILTER (WHERE status = 'active'), 0)        AS abonado,
           COUNT(*) FILTER (WHERE status = 'active' AND due_date IS NOT NULL AND due_date < CURRENT_DATE)::int AS vencidos,
           COUNT(*) FILTER (WHERE status = 'completed')::int                     AS liquidados
         FROM layaways`
      );
      const r = result.rows[0];
      return {
        activos: r.activos,
        por_cobrar: parseFloat(r.por_cobrar),
        abonado: parseFloat(r.abonado),
        vencidos: r.vencidos,
        liquidados: r.liquidados,
      };
    } finally {
      dbClient.release();
    }
  }
}

export const layawayService = new LayawayService();
