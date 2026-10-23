import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { layawayService } from '../services/layaway.service';
import { LayawayQueryParams } from '../models/layaway.model';

// @desc    Crear un apartado
// @route   POST /api/layaways
export const createLayaway = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401);
    throw new Error('No autorizado: usuario no identificado');
  }

  const created = await layawayService.createLayaway(userId, req.body);
  const full = await layawayService.getLayawayById(created.id as number);
  res.status(201).json({ success: true, data: full });
});

// @desc    Registrar un abono (si cubre el total, liquida el apartado)
// @route   POST /api/layaways/:id/payments
export const addPayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400);
    throw new Error('ID de apartado inválido');
  }

  const updated = await layawayService.addPayment(userId as number, id, req.body);
  res.json({ success: true, data: updated });
});

// @desc    Cancelar un apartado (devuelve el stock)
// @route   POST /api/layaways/:id/cancel
export const cancelLayaway = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400);
    throw new Error('ID de apartado inválido');
  }

  const updated = await layawayService.cancelLayaway(userId as number, id, req.body);
  res.json({ success: true, data: updated });
});

// @desc    Listado de apartados
// @route   GET /api/layaways
export const getLayaways = asyncHandler(async (req: Request, res: Response) => {
  const params: LayawayQueryParams = {
    client_id: req.query.client_id ? parseInt(req.query.client_id as string) : undefined,
    status: req.query.status as any,
    overdue: req.query.overdue === 'true',
    search: req.query.search as string,
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
  };

  const result = await layawayService.getLayaways(params);

  res.json({
    success: true,
    data: result.layaways,
    pagination: {
      page: params.page || 1,
      limit: params.limit || 20,
      total: result.total,
      pages: Math.ceil(result.total / (params.limit || 20)),
    },
  });
});

// @desc    Estadísticas de apartados
// @route   GET /api/layaways/stats
export const getLayawayStats = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await layawayService.getStats() });
});

// @desc    Detalle de un apartado
// @route   GET /api/layaways/:id
export const getLayaway = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400);
    throw new Error('ID de apartado inválido');
  }

  const found = await layawayService.getLayawayById(id);
  if (!found) {
    res.status(404);
    throw new Error('Apartado no encontrado');
  }

  res.json({ success: true, data: found });
});
