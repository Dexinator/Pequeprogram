import express from 'express';
import { protect, authorize } from '../utils/auth.middleware';
import {
  createSale,
  getSales,
  getSale,
  searchInventory,
  getAvailableInventory
} from '../controllers/sales.controller';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Sales routes
router
  .route('/')
  .post(authorize(['admin', 'manager', 'sales']), createSale)
  .get(authorize(['admin', 'manager', 'sales']), getSales);

router
  .route('/:id')
  .get(authorize(['admin', 'manager', 'sales']), getSale);

// Inventory search routes (separate from sales routes)
// These will be available at /api/sales/inventory/search and /api/sales/inventory/available

export default router;