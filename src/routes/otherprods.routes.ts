import express from 'express';
import { protect, authorize } from '../utils/auth.middleware';
import {
  createPurchase,
  getPurchase,
  getPurchases,
  getPurchaseStats
} from '../controllers/otherprods.controller';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Purchase statistics (debe ir antes de /:id para evitar conflictos)
router
  .route('/stats')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor']), getPurchaseStats);

// Other products purchases routes
router
  .route('/')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor']), getPurchases)
  .post(authorize(['superadmin', 'admin', 'manager', 'gerente']), createPurchase);

router
  .route('/:id')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor']), getPurchase);

export default router;