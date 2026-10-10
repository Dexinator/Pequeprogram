import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { pool } from '../db';
import { PoolClient } from 'pg';

// @desc    Search clients
// @route   GET /api/clients/search
// @access  Private
export const searchClients = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  
  if (!q) {
    res.status(400);
    throw new Error('Query parameter is required');
  }
  
  // El teléfono se compara también por dígitos: un cliente guardado como
  // "55 1234 5678" (desde citas) debe encontrarse tecleando "5512345678".
  const term = String(q).trim();
  const digits = term.replace(/\D/g, '');

  const searchQuery = `
    SELECT id, name, phone, email, identification, notes, store_credit, created_at
    FROM clients
    WHERE name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1
       OR ($2 <> '' AND regexp_replace(phone, '\\D', '', 'g') LIKE $3)
    ORDER BY name
    LIMIT 20
  `;
  
  const result = await pool.query(searchQuery, [`%${term}%`, digits, `%${digits}%`]);
  
  res.json({
    success: true,
    data: result.rows
  });
});

// @desc    Listado paginado de clientes
// @route   GET /api/clients
// @access  Private
// @note    /search existe aparte y sirve al autocompletado de una venta (20
//          resultados, sin paginar). Este es para la pantalla de Clientes.
export const listClients = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;
  const search = (req.query.search as string || '').trim();
  const withCredit = req.query.with_credit === 'true';

  const sortable: Record<string, string> = {
    name: 'c.name',
    credit: 'c.store_credit',
    created: 'c.created_at'
  };
  const sortBy = sortable[req.query.sort_by as string] || 'c.name';
  const sortDir = (req.query.sort_dir as string) === 'desc' ? 'DESC' : 'ASC';

  const where: string[] = ['1=1'];
  const params: any[] = [];

  if (search) {
    // Igual que en /search: el teléfono también se compara por dígitos, para
    // que "55 1234 5678" se encuentre tecleando "5512345678".
    const digits = search.replace(/\D/g, '');
    params.push(`%${search}%`, digits, `%${digits}%`);
    where.push(`(
      c.name ILIKE $${params.length - 2}
      OR c.phone ILIKE $${params.length - 2}
      OR c.email ILIKE $${params.length - 2}
      OR ($${params.length - 1} <> '' AND regexp_replace(c.phone, '\\D', '', 'g') LIKE $${params.length})
    )`);
  }

  if (withCredit) {
    where.push('c.store_credit > 0');
  }

  const whereSql = where.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM clients c WHERE ${whereSql}`,
    params
  );
  const total = countResult.rows[0]?.total || 0;

  const listResult = await pool.query(
    `SELECT c.id, c.name, c.phone, c.email, c.identification, c.notes,
            c.store_credit, c.created_at
     FROM clients c
     WHERE ${whereSql}
     ORDER BY ${sortBy} ${sortDir} NULLS LAST, c.id
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  res.json({
    success: true,
    data: listResult.rows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Resumen del cliente para el encabezado de su ficha
// @route   GET /api/clients/:id/summary
// @access  Private
// @note    Un solo viaje en vez de cinco: la ficha pinta los contadores de
//          inmediato y cada pestaña carga su detalle cuando se abre.
export const getClientSummary = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400);
    throw new Error('ID de cliente inválido');
  }

  const clientResult = await pool.query(
    'SELECT id, name, store_credit FROM clients WHERE id = $1',
    [id]
  );
  if (clientResult.rows.length === 0) {
    res.status(404);
    throw new Error('Cliente no encontrado');
  }

  const summaryResult = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM sales WHERE client_id = $1)                        AS purchases_count,
       (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE client_id = $1)       AS purchases_total,
       (SELECT MAX(sale_date) FROM sales WHERE client_id = $1)                       AS last_purchase_date,
       (SELECT COUNT(*)::int FROM valuations WHERE client_id = $1)                   AS valuations_count,
       (SELECT COALESCE(SUM(total_purchase_amount), 0) FROM valuations WHERE client_id = $1) AS valuations_total,
       (SELECT COUNT(*)::int
          FROM valuation_items vi
          JOIN valuations v ON v.id = vi.valuation_id
         WHERE v.client_id = $1 AND vi.modality = 'consignación')                    AS consignments_count,
       (SELECT COUNT(*)::int
          FROM valuation_items vi
          JOIN valuations v ON v.id = vi.valuation_id
         WHERE v.client_id = $1 AND vi.modality = 'consignación'
           AND COALESCE(vi.consignment_paid, FALSE) = FALSE)                         AS consignments_unpaid`,
    [id]
  );

  const row = summaryResult.rows[0] || {};

  res.json({
    success: true,
    data: {
      client_id: id,
      store_credit: parseFloat(clientResult.rows[0].store_credit) || 0,
      purchases_count: row.purchases_count || 0,
      purchases_total: parseFloat(row.purchases_total) || 0,
      last_purchase_date: row.last_purchase_date || null,
      valuations_count: row.valuations_count || 0,
      valuations_total: parseFloat(row.valuations_total) || 0,
      consignments_count: row.consignments_count || 0,
      consignments_unpaid: row.consignments_unpaid || 0
    }
  });
});

// @desc    Get client by ID
// @route   GET /api/clients/:id
// @access  Private
export const getClient = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    res.status(400);
    throw new Error('ID de cliente inválido');
  }
  
  const query = `
    SELECT id, name, phone, email, identification, notes, store_credit, created_at
    FROM clients
    WHERE id = $1
  `;
  
  const result = await pool.query(query, [id]);
  
  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Cliente no encontrado');
  }
  
  res.json({
    success: true,
    data: result.rows[0]
  });
});

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
export const createClient = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, email, identification, notes } = req.body;
  
  if (!name || !String(name).trim()) {
    res.status(400);
    throw new Error('El nombre es obligatorio');
  }

  // clients.phone es NOT NULL en la base de datos: sin esta validación el
  // INSERT fallaba y el POS mostraba "Error interno del servidor".
  const phoneClean = phone ? String(phone).trim() : '';
  if (!phoneClean) {
    res.status(400);
    throw new Error('El teléfono es obligatorio');
  }

  // Duplicado por dígitos (mismo criterio que la búsqueda). Se devuelve el
  // cliente existente para que el POS pueda ofrecer usarlo directamente.
  const duplicate = await pool.query(
    `SELECT id, name, phone, email, identification, notes, store_credit, created_at
     FROM clients
     WHERE regexp_replace(phone, '\\D', '', 'g') = $1
     ORDER BY id
     LIMIT 1`,
    [phoneClean.replace(/\D/g, '')]
  );
  
  if (duplicate.rows.length > 0) {
    const existing = duplicate.rows[0];
    res.status(409).json({
      success: false,
      code: 'PHONE_EXISTS',
      message: `Ya existe un cliente con ese teléfono: ${existing.name}`,
      data: existing
    });
    return;
  }
  
  const insertQuery = `
    INSERT INTO clients (name, phone, email, identification, notes)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, phone, email, identification, notes, store_credit, created_at
  `;
  
  const result = await pool.query(insertQuery, [
    String(name).trim(),
    phoneClean,
    email ? String(email).trim() || null : null,
    identification ? String(identification).trim() || null : null,
    notes ? String(notes).trim() || null : null
  ]);
  
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, phone, email, identification, notes } = req.body;
  
  if (isNaN(id)) {
    res.status(400);
    throw new Error('ID de cliente inválido');
  }
  
  // Check if client exists
  const existing = await pool.query(
    'SELECT id FROM clients WHERE id = $1',
    [id]
  );
  
  if (existing.rows.length === 0) {
    res.status(404);
    throw new Error('Cliente no encontrado');
  }
  
  // Check if phone already exists for another client (if provided)
  if (phone) {
    const existingPhone = await pool.query(
      `SELECT id, name FROM clients
       WHERE regexp_replace(phone, '\\D', '', 'g') = $1 AND id != $2`,
      [String(phone).replace(/\D/g, ''), id]
    );
    
    if (existingPhone.rows.length > 0) {
      res.status(409);
      throw new Error(`Ya existe otro cliente con ese teléfono: ${existingPhone.rows[0].name}`);
    }
  }
  
  const updateQuery = `
    UPDATE clients
    SET name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        email = COALESCE($3, email),
        identification = COALESCE($4, identification),
        -- notes se manda siempre desde la ficha: un string vacío debe poder
        -- borrar la nota, por eso no lleva COALESCE.
        notes = CASE WHEN $5::text IS NULL THEN notes ELSE NULLIF(TRIM($5::text), '') END
    WHERE id = $6
    RETURNING id, name, phone, email, identification, notes, store_credit, created_at
  `;
  
  const result = await pool.query(updateQuery, [
    name,
    phone,
    email,
    identification,
    notes !== undefined ? String(notes) : null,
    id
  ]);

  res.json({
    success: true,
    data: result.rows[0]
  });
});

// @desc    Adjust a client's store credit balance manually
// @route   POST /api/clients/:id/store-credit/adjust
// @access  Private (admin, manager only — to keep an authority chain on adjustments)
export const adjustStoreCredit = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { amount, reason, notes } = req.body;
  const userId = req.user?.userId;

  if (isNaN(id)) {
    res.status(400);
    throw new Error('ID de cliente inválido');
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (typeof numericAmount !== 'number' || Number.isNaN(numericAmount) || numericAmount === 0) {
    res.status(400);
    throw new Error('amount debe ser un número distinto de cero (positivo para sumar, negativo para restar)');
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    res.status(400);
    throw new Error('reason es obligatorio para registrar el motivo del ajuste');
  }

  let dbClient: PoolClient | undefined;
  try {
    dbClient = await pool.connect();
    await dbClient.query('BEGIN');

    const clientResult = await dbClient.query(
      'SELECT id, name, store_credit FROM clients WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (clientResult.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      res.status(404);
      throw new Error('Cliente no encontrado');
    }
    const currentBalance = parseFloat(clientResult.rows[0].store_credit) || 0;
    const newBalance = currentBalance + numericAmount;

    if (newBalance < 0) {
      await dbClient.query('ROLLBACK');
      res.status(400);
      throw new Error(`El ajuste dejaría el saldo en negativo. Saldo actual: $${currentBalance.toFixed(2)}, ajuste: $${numericAmount.toFixed(2)}`);
    }

    await dbClient.query(
      'UPDATE clients SET store_credit = $1, updated_at = NOW() WHERE id = $2',
      [newBalance, id]
    );

    const movementType = numericAmount > 0 ? 'manual_add' : 'manual_subtract';
    const movementResult = await dbClient.query(
      `INSERT INTO client_credit_movements
         (client_id, user_id, movement_type, amount, balance_after, reason, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [id, userId || null, movementType, numericAmount, newBalance, reason.trim(), notes || null]
    );

    await dbClient.query('COMMIT');

    res.json({
      success: true,
      data: {
        client_id: id,
        previous_balance: currentBalance,
        adjustment: numericAmount,
        new_balance: newBalance,
        movement: {
          id: movementResult.rows[0].id,
          type: movementType,
          reason: reason.trim(),
          notes: notes || null,
          created_at: movementResult.rows[0].created_at,
        },
      },
    });
  } catch (err) {
    if (dbClient) {
      try { await dbClient.query('ROLLBACK'); } catch { /* ignore */ }
    }
    throw err;
  } finally {
    if (dbClient) dbClient.release();
  }
});

// @desc    List a client's store-credit movements (audit trail)
// @route   GET /api/clients/:id/store-credit/movements
// @access  Private
export const getStoreCreditMovements = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400);
    throw new Error('ID de cliente inválido');
  }
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);

  const result = await pool.query(
    `SELECT
        m.id,
        m.movement_type,
        m.amount,
        m.balance_after,
        m.sale_id,
        m.valuation_id,
        m.reason,
        m.notes,
        m.created_at,
        u.first_name || ' ' || u.last_name AS user_name
     FROM client_credit_movements m
     LEFT JOIN users u ON m.user_id = u.id
     WHERE m.client_id = $1
     ORDER BY m.created_at DESC
     LIMIT $2`,
    [id, limit]
  );

  res.json({
    success: true,
    data: result.rows.map(row => ({
      ...row,
      amount: parseFloat(row.amount),
      balance_after: parseFloat(row.balance_after),
    })),
  });
});