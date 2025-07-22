import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { OtherProdsService } from '../services/otherprods.service';
import { CreateOtherProdDto, OtherProdQueryParams } from '../models/otherprods.model';

const otherProdsService = new OtherProdsService();

// @desc    Create new purchase
// @route   POST /api/otherprods
// @access  Private
export const createPurchase = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  
  if (!userId) {
    res.status(401);
    throw new Error('Usuario no autenticado');
  }
  
  const purchaseData: CreateOtherProdDto = req.body;
  
  // Validar datos básicos
  if (!purchaseData.supplier_name || !purchaseData.payment_method || !purchaseData.items || purchaseData.items.length === 0) {
    res.status(400);
    throw new Error('Datos incompletos. Se requiere proveedor, método de pago y al menos un producto');
  }
  
  // Validar items
  for (const item of purchaseData.items) {
    if (!item.product_name || item.quantity <= 0 || item.purchase_unit_price < 0 || item.sale_unit_price < 0) {
      res.status(400);
      throw new Error('Datos de producto inválidos');
    }
  }
  
  const purchase = await otherProdsService.createPurchase(userId, purchaseData);
  
  res.status(201).json({
    success: true,
    data: purchase
  });
});

// @desc    Get purchase by ID
// @route   GET /api/otherprods/:id
// @access  Private
export const getPurchase = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    res.status(400);
    throw new Error('ID inválido');
  }
  
  const purchase = await otherProdsService.getPurchase(id);
  
  if (!purchase) {
    res.status(404);
    throw new Error('Compra no encontrada');
  }
  
  res.json({
    success: true,
    data: purchase
  });
});

// @desc    Get all purchases with filters
// @route   GET /api/otherprods
// @access  Private
export const getPurchases = asyncHandler(async (req: Request, res: Response) => {
  const params: OtherProdQueryParams = {
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    supplier_name: req.query.supplier_name as string,
    location: req.query.location as string,
    start_date: req.query.start_date as string,
    end_date: req.query.end_date as string
  };
  
  const result = await otherProdsService.getPurchases(params);
  
  res.json({
    success: true,
    data: result.purchases,
    pagination: {
      page: params.page || 1,
      limit: params.limit || 20,
      total: result.total,
      pages: Math.ceil(result.total / (params.limit || 20))
    }
  });
});

// @desc    Get purchase statistics
// @route   GET /api/otherprods/stats
// @access  Private
export const getPurchaseStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await otherProdsService.getStats();
  
  res.json({
    success: true,
    data: stats
  });
});