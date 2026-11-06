import express from 'express';
import { protect, authorize } from '../utils/auth.middleware';
import {
  searchClients,
  listClients,
  getClientSummary,
  getClient,
  createClient,
  updateClient,
  adjustStoreCredit,
  getStoreCreditMovements,
  getCreditStatement
} from '../controllers/client.controller';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Client routes
router
  .route('/search')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor', 'valuator', 'valuador']), searchClients);

// Listado paginado para la pantalla de Clientes (distinto de /search, que
// sirve al autocompletado durante una venta).
router
  .route('/')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor', 'valuator', 'valuador']), listClients)
  .post(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor', 'valuator', 'valuador']), createClient);

router
  .route('/:id')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor', 'valuator', 'valuador']), getClient)
  .put(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor', 'valuator', 'valuador']), updateClient);

// Store credit management — adjustments restricted to admin/manager to keep an
// authority chain on balance changes; movements list available to everyone who
// can see the client.
router
  .route('/:id/summary')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor', 'valuator', 'valuador']), getClientSummary);

router
  .route('/:id/store-credit/adjust')
  .post(authorize(['superadmin', 'admin', 'manager', 'gerente']), adjustStoreCredit);

// Estado de cuenta imprimible del crédito: lo puede sacar cualquiera que
// atienda mostrador, igual que un ticket.
router
  .route('/:id/credit-statement')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor', 'valuator', 'valuador']), getCreditStatement);

router
  .route('/:id/store-credit/movements')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor', 'valuator', 'valuador']), getStoreCreditMovements);

export default router;
