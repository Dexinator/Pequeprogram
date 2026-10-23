import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { returnsService } from '../services/returns.service';
import { CreateReturnDto, ReturnQueryParams } from '../models/returns.model';

// @desc    Datos de una venta para armar su devolución
// @route   GET /api/returns/sale/:saleId
export const getSaleForReturn = asyncHandler(async (req: Request, res: Response) => {
  const saleId = parseInt(req.params.saleId);
  if (isNaN(saleId)) {
    res.status(400);
    throw new Error('Número de venta inválido');
  }

  const sale = await returnsService.getSaleForReturn(saleId);
  if (!sale) {
    res.status(404);
    throw new Error(`No se encontró la venta #${saleId}`);
  }

  res.json({ success: true, data: sale });
});

// @desc    Registrar una devolución
// @route   POST /api/returns
export const createReturn = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401);
    throw new Error('No autorizado: usuario no identificado');
  }

  const { sale_id, return_type, refund_method, items, reason, notes, location } = req.body;

  if (!sale_id) {
    res.status(400);
    throw new Error('Se requiere la venta a la que pertenece la devolución');
  }
  if (!['garantia', 'sin_defecto'].includes(return_type)) {
    res.status(400);
    throw new Error("El tipo de devolución debe ser 'garantia' o 'sin_defecto'");
  }
  if (!['efectivo', 'credito_tienda', 'tarjeta'].includes(refund_method)) {
    res.status(400);
    throw new Error("El método de devolución debe ser 'efectivo', 'tarjeta' o 'credito_tienda'");
  }
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Debe indicar al menos un artículo a devolver');
  }

  const dto: CreateReturnDto = { sale_id, return_type, refund_method, items, reason, notes, location };

  // Las validaciones del servicio lanzan BusinessError, que el middleware
  // traduce a 400. Un fallo real de base de datos sigue siendo 500.
  const created = await returnsService.createReturn(userId, dto);
  const full = await returnsService.getReturnById(created.id as number);
  res.status(201).json({ success: true, data: full });
});

// @desc    Historial de devoluciones
// @route   GET /api/returns
export const getReturns = asyncHandler(async (req: Request, res: Response) => {
  const params: ReturnQueryParams = {
    sale_id: req.query.sale_id ? parseInt(req.query.sale_id as string) : undefined,
    client_id: req.query.client_id ? parseInt(req.query.client_id as string) : undefined,
    return_type: req.query.return_type as any,
    refund_method: req.query.refund_method as any,
    location: req.query.location as string,
    start_date: req.query.start_date as string,
    end_date: req.query.end_date as string,
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
  };

  const result = await returnsService.getReturns(params);

  res.json({
    success: true,
    data: result.returns,
    pagination: {
      page: params.page || 1,
      limit: params.limit || 20,
      total: result.total,
      pages: Math.ceil(result.total / (params.limit || 20)),
    },
  });
});

// @desc    Estadísticas de devoluciones
// @route   GET /api/returns/stats
export const getReturnsStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await returnsService.getReturnsStats();
  res.json({ success: true, data: stats });
});

// @desc    Detalle de una devolución
// @route   GET /api/returns/:id
export const getReturn = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400);
    throw new Error('ID de devolución inválido');
  }

  const found = await returnsService.getReturnById(id);
  if (!found) {
    res.status(404);
    throw new Error('Devolución no encontrada');
  }

  res.json({ success: true, data: found });
});
