import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ConsignmentService } from '../services/consignment.service';

const consignmentService = new ConsignmentService();

// GET /api/consignments
export const getAllConsignments = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status = 'available', location, client_id } = req.query;
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  const filters = {
    status: status as string,
    location: location as string,
    client_id: client_id ? parseInt(client_id as string) : undefined
  };

  const result = await consignmentService.getAllConsignments(offset, limitNum, filters);
  
  res.json({
    success: true,
    data: result.consignments,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: result.total,
      totalPages: Math.ceil(result.total / limitNum)
    }
  });
});

// GET /api/consignments/:id
export const getConsignmentById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const consignment = await consignmentService.getConsignmentById(parseInt(id));
  
  if (!consignment) {
    res.status(404).json({
      success: false,
      message: 'Producto en consignación no encontrado'
    });
    return;
  }

  res.json({
    success: true,
    data: consignment
  });
});

// PUT /api/consignments/:id/paid
export const markConsignmentAsPaid = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { paid_amount, notes } = req.body;
  
  // paid_amount is now optional - if not provided, it will be calculated automatically as 50% of sale price
  const paidAmountValue = paid_amount ? parseFloat(paid_amount) : null;

  const consignment = await consignmentService.markAsPaid(
    parseInt(id), 
    paidAmountValue,
    notes
  );
  
  if (!consignment) {
    res.status(404).json({
      success: false,
      message: 'Producto en consignación no encontrado o no está en estado vendido sin pagar'
    });
    return;
  }

  res.json({
    success: true,
    data: consignment,
    message: 'Consignación marcada como pagada exitosamente'
  });
});

// GET /api/consignments/stats
export const getConsignmentStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await consignmentService.getConsignmentStats();

  res.json({
    success: true,
    data: stats
  });
});

// PUT /api/consignments/:id/returned
export const markConsignmentAsReturned = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { notes } = req.body;

  const consignment = await consignmentService.markAsReturned(
    parseInt(id),
    notes
  );

  if (!consignment) {
    res.status(404).json({
      success: false,
      message: 'Producto en consignación no encontrado o no está disponible para devolución'
    });
    return;
  }

  res.json({
    success: true,
    data: consignment,
    message: 'Consignación marcada como devuelta exitosamente'
  });
});