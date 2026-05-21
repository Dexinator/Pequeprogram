import express from 'express';
import { protect, authorize } from '../utils/auth.middleware';
import {
  createSale,
  getSales,
  getSale,
  getSalesStats,
  searchInventory,
  getAvailableInventory,
  getTicketPayload
} from '../controllers/sales.controller';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Sales routes
router
  .route('/')
  .post(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor']), createSale)
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor']), getSales);

router
  .route('/stats')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor']), getSalesStats);

router
  .route('/:id')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor']), getSale);

router
  .route('/:id/ticket-payload')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor']), getTicketPayload);

// Inventory search routes (separate from sales routes)
// These will be available at /api/sales/inventory/search and /api/sales/inventory/available

export default router;