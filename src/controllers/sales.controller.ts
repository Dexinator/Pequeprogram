import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { SalesService } from '../services/sales.service';
import { CreateSaleDto, SaleQueryParams, InventorySearchParams } from '../models/sales.model';

const salesService = new SalesService();

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
export const createSale = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  
  if (!userId) {
    res.status(401);
    throw new Error('Usuario no autenticado');
  }

  const saleData: CreateSaleDto = req.body;

  // Convertir payment_method legacy a payment_details si es necesario
  if (!saleData.payment_details || saleData.payment_details.length === 0) {
    if (!saleData.payment_method) {
      res.status(400);
      throw new Error('Debe especificar payment_method o payment_details');
    }
    
    // Calcular el total para el payment_detail
    const totalAmount = saleData.items.reduce((sum, item) => sum + (item.unit_price * item.quantity_sold), 0);
    
    // Crear payment_details desde payment_method legacy
    saleData.payment_details = [{
      payment_method: saleData.payment_method,
      amount: totalAmount,
      notes: undefined
    }];
  }

  if (!saleData.items || saleData.items.length === 0) {
    res.status(400);
    throw new Error('La venta debe tener al menos un item');
  }

  // Validar que cada item tenga los campos requeridos
  for (const item of saleData.items) {
    if (!item.inventario_id || !item.quantity_sold || !item.unit_price) {
      res.status(400);
      throw new Error('Todos los items deben tener inventario_id, quantity_sold y unit_price');
    }

    if (item.quantity_sold <= 0) {
      res.status(400);
      throw new Error('La cantidad vendida debe ser mayor a 0');
    }

    if (item.unit_price < 0) {
      res.status(400);
      throw new Error('El precio unitario no puede ser negativo');
    }
  }

  const sale = await salesService.createSale(userId, saleData);

  res.status(201).json({
    success: true,
    data: sale
  });
});

// @desc    Get all sales with filters
// @route   GET /api/sales
// @access  Private
export const getSales = asyncHandler(async (req: Request, res: Response) => {
  const params: SaleQueryParams = {
    client_id: req.query.client_id ? parseInt(req.query.client_id as string) : undefined,
    user_id: req.query.user_id ? parseInt(req.query.user_id as string) : undefined,
    status: req.query.status as string,
    payment_method: req.query.payment_method as string,
    location: req.query.location as string,
    start_date: req.query.start_date as string,
    end_date: req.query.end_date as string,
    search: req.query.search as string,
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 10
  };

  const result = await salesService.getSales(params);

  res.json({
    success: true,
    data: result.sales,
    pagination: {
      page: params.page || 1,
      limit: params.limit || 10,
      total: result.total,
      pages: Math.ceil(result.total / (params.limit || 10))
    }
  });
});

// @desc    Get single sale by ID
// @route   GET /api/sales/:id
// @access  Private
export const getSale = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400);
    throw new Error('ID de venta inválido');
  }

  const sale = await salesService.getSale(id);

  if (!sale) {
    res.status(404);
    throw new Error('Venta no encontrada');
  }

  res.json({
    success: true,
    data: sale
  });
});

// @desc    Search inventory items
// @route   GET /api/inventory/search
// @access  Private
export const searchInventory = asyncHandler(async (req: Request, res: Response) => {
  const params: InventorySearchParams = {
    q: req.query.q as string,
    category_id: req.query.category_id ? parseInt(req.query.category_id as string) : undefined,
    subcategory_id: req.query.subcategory_id ? parseInt(req.query.subcategory_id as string) : undefined,
    location: req.query.location as string,
    available_only: req.query.available_only === 'true',
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 20
  };

  const result = await salesService.searchInventory(params);

  res.json({
    success: true,
    data: result.items,
    pagination: {
      page: params.page || 1,
      limit: params.limit || 20,
      total: result.total,
      pages: Math.ceil(result.total / (params.limit || 20))
    }
  });
});

// @desc    Get available inventory items (shortcut for available_only=true)
// @route   GET /api/inventory/available
// @access  Private
export const getAvailableInventory = asyncHandler(async (req: Request, res: Response) => {
  const params: InventorySearchParams = {
    q: req.query.q as string,
    category_id: req.query.category_id ? parseInt(req.query.category_id as string) : undefined,
    subcategory_id: req.query.subcategory_id ? parseInt(req.query.subcategory_id as string) : undefined,
    location: req.query.location as string,
    available_only: true, // Forzar solo productos disponibles
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 20
  };

  const result = await salesService.searchInventory(params);

  res.json({
    success: true,
    data: result.items,
    pagination: {
      page: params.page || 1,
      limit: params.limit || 20,
      total: result.total,
      pages: Math.ceil(result.total / (params.limit || 20))
    }
  });
});