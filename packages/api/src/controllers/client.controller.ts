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
  
  const searchQuery = `
    SELECT id, name, phone, email, identification, store_credit, created_at
    FROM clients
    WHERE name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1
    ORDER BY name
    LIMIT 20
  `;
  
  const result = await pool.query(searchQuery, [`%${q}%`]);
  
  res.json({
    success: true,
    data: result.rows
  });
});

// @desc    Get client by ID
// @route   GET /api/clients/:id
// @access  Private
export const getClient = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    res.status(400);
    throw new Error('Invalid client ID');
  }
  
  const query = `
    SELECT id, name, phone, email, identification, store_credit, created_at
    FROM clients
    WHERE id = $1
  `;
  
  const result = await pool.query(query, [id]);
  
  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Client not found');
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
  const { name, phone, email, identification } = req.body;
  
  if (!name) {
    res.status(400);
    throw new Error('Name is required');
  }
  
  // Check if phone already exists (if provided)
  if (phone) {
    const existingPhone = await pool.query(
      'SELECT id FROM clients WHERE phone = $1',
      [phone]
    );
    
    if (existingPhone.rows.length > 0) {
      res.status(400);
      throw new Error('A client with this phone number already exists');
    }
  }
  
  const insertQuery = `
    INSERT INTO clients (name, phone, email, identification)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, phone, email, identification, store_credit, created_at
  `;
  
  const result = await pool.query(insertQuery, [
    name,
    phone || null,
    email || null,
    identification || null
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
  const { name, phone, email, identification } = req.body;
  
  if (isNaN(id)) {
    res.status(400);
    throw new Error('Invalid client ID');
  }
  
  // Check if client exists
  const existing = await pool.query(
    'SELECT id FROM clients WHERE id = $1',
    [id]
  );
  
  if (existing.rows.length === 0) {
    res.status(404);
    throw new Error('Client not found');
  }
  
  // Check if phone already exists for another client (if provided)
  if (phone) {
    const existingPhone = await pool.query(
      'SELECT id FROM clients WHERE phone = $1 AND id != $2',
      [phone, id]
    );
    
    if (existingPhone.rows.length > 0) {
      res.status(400);
      throw new Error('Another client with this phone number already exists');
    }
  }
  
  const updateQuery = `
    UPDATE clients
    SET name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        email = COALESCE($3, email),
        identification = COALESCE($4, identification)
    WHERE id = $5
    RETURNING id, name, phone, email, identification, store_credit, created_at
  `;
  
  const result = await pool.query(updateQuery, [
    name,
    phone,
    email,
    identification,
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
    throw new Error('Invalid client ID');
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
    throw new Error('Invalid client ID');
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