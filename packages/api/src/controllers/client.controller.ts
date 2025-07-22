import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { pool } from '../db';

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