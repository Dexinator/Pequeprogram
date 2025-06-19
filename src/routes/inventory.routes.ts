import express from 'express';
import { protect, authorize } from '../utils/auth.middleware';
import {
  searchInventory,
  getAvailableInventory
} from '../controllers/sales.controller';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Inventory search routes
router
  .route('/search')
  .get(authorize(['admin', 'manager', 'sales']), searchInventory);

router
  .route('/available')
  .get(authorize(['admin', 'manager', 'sales']), getAvailableInventory);

export default router;