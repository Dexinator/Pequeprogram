import express from 'express';
import { protect, authorize } from '../utils/auth.middleware';
import {
  searchClients,
  getClient,
  createClient,
  updateClient
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

export default router;