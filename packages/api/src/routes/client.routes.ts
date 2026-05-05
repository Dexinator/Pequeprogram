import express from 'express';
import { protect, authorize } from '../utils/auth.middleware';
import {
  searchClients,
  getClient,
  createClient,
  updateClient,
  adjustStoreCredit,
  getStoreCreditMovements
} from '../controllers/client.controller';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Client routes
router
  .route('/search')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor', 'valuator', 'valuador']), searchClients);

router
  .route('/')
  .post(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor', 'valuator', 'valuador']), createClient);

router
  .route('/:id')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor', 'valuator', 'valuador']), getClient)
  .put(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor', 'valuator', 'valuador']), updateClient);

// Store credit management — adjustments restricted to admin/manager to keep an
// authority chain on balance changes; movements list available to everyone who
// can see the client.
router
  .route('/:id/store-credit/adjust')
  .post(authorize(['superadmin', 'admin', 'manager', 'gerente']), adjustStoreCredit);

router
  .route('/:id/store-credit/movements')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor', 'valuator', 'valuador']), getStoreCreditMovements);

export default router;
