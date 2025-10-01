import express from 'express';
import { protect, authorize } from '../utils/auth.middleware';
import {
  searchInventory,
  getAvailableInventory,
  updateInventoryQuantity
} from '../controllers/sales.controller';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Inventory search routes
router
  .route('/search')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor']), searchInventory);

router
  .route('/available')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor']), getAvailableInventory);

// Update inventory quantity - only admin and manager roles
router
  .route('/:id/quantity')
  .put(authorize(['superadmin', 'admin', 'manager', 'gerente']), updateInventoryQuantity);

export default router;